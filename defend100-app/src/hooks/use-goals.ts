"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export interface GoalConfig {
    weight: number
    target?: number
    limit?: number
    unit: string
    isActive: boolean
}

export type GoalKey = "hydration" | "activity" | "recovery" | "tasks" | "screen_time" | "calories"

export type Goals = Record<GoalKey, GoalConfig>

const DEFAULTS: Goals = {
    hydration: { weight: 2, target: 2500, unit: "ml", isActive: true },
    activity: { weight: 3, target: 10000, unit: "adım", isActive: true },
    recovery: { weight: 2, target: 8, unit: "saat", isActive: true },
    tasks: { weight: 1, target: 5, unit: "adet", isActive: true },
    screen_time: { weight: 2, limit: 3.5, unit: "saat", isActive: true },
    calories: { weight: 2, target: 2200, unit: "kcal", isActive: true },
}

export function useGoals() {
    const supabase = createClient()
    const [goals, setGoals] = useState<Goals>(DEFAULTS)
    const [userId, setUserId] = useState<string | null>(null)

    // 1. Fetch user session and goals on mount
    useEffect(() => {
        let mounted = true

        async function fetchGoals() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                if (mounted) setUserId(user.id)

                const { data, error } = await supabase
                    .from("goals")
                    .select("*")
                    .eq("user_id", user.id)

                if (error) throw error

                if (data && data.length > 0 && mounted) {
                    const merged = { ...DEFAULTS }
                    data.forEach((row) => {
                        const key = row.metric_key as GoalKey
                        if (merged[key]) {
                            merged[key] = {
                                weight: row.weight,
                                target: row.target ? parseFloat(row.target) : undefined,
                                limit: row.limit ? parseFloat(row.limit) : undefined,
                                unit: row.unit,
                                isActive: row.is_active,
                            }
                        }
                    })
                    setGoals(merged)
                }
            } catch (err) {
                console.error("Error fetching goals from Supabase:", err)
            }
        }

        fetchGoals()

        return () => {
            mounted = false
        }
    }, [supabase])

    // 2. Save goals with Optimistic UI updates
    const saveGoals = useCallback(
        async (newGoals: Goals) => {
            if (!userId) return false

            // Optimistic UI update
            setGoals(newGoals)

            try {
                // Prepare flat records for upsert
                const records = Object.entries(newGoals).map(([key, config]) => ({
                    user_id: userId,
                    metric_key: key,
                    weight: config.weight,
                    target: config.target ?? null,
                    limit: config.limit ?? null,
                    unit: config.unit,
                    is_active: config.isActive,
                }))

                const { error } = await supabase
                    .from("goals")
                    .upsert(records, { onConflict: "user_id, metric_key" })

                if (error) throw error
                return true
            } catch (err) {
                console.error("Error saving goals to Supabase:", err)
                return false
            }
        },
        [supabase, userId]
    )

    const getTargetValue = useCallback((key: GoalKey): number => {
        const goal = goals[key]
        return goal.target ?? goal.limit ?? 0
    }, [goals])

    const activeGoals = Object.entries(goals).filter(
        ([, config]) => config.isActive
    ) as [GoalKey, GoalConfig][]

    return { goals, saveGoals, getTargetValue, activeGoals, DEFAULTS }
}
