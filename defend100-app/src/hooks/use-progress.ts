"use client"

import { useState, useEffect, useCallback } from "react"
import type { Goals, GoalKey } from "./use-goals"
import { createClient } from "@/lib/supabase/client"

type ProgressData = Partial<Record<GoalKey, number>>
type AllProgress = Record<string, ProgressData>

function getTodayKey(): string {
    return new Date().toISOString().split("T")[0]
}

export function useProgress(goals: Goals) {
    const supabase = createClient()
    const [dateKey, setDateKey] = useState(getTodayKey)
    const [progress, setProgress] = useState<ProgressData>({})
    const [allProgress, setAllProgress] = useState<AllProgress>({})
    const [userId, setUserId] = useState<string | null>(null)

    // Load from Supabase on mount
    useEffect(() => {
        let mounted = true

        async function fetchProgress() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                if (mounted) setUserId(user.id)

                const { data, error } = await supabase
                    .from("progress")
                    .select("*")
                    .eq("user_id", user.id)

                if (error) throw error

                if (data && mounted) {
                    const fetchedProgress: AllProgress = {}
                    data.forEach((row) => {
                        const date = row.date // e.g. "2026-02-20"
                        const key = row.metric_key as GoalKey
                        if (!fetchedProgress[date]) {
                            fetchedProgress[date] = {}
                        }
                        fetchedProgress[date][key] = parseFloat(row.value)
                    })
                    setAllProgress(fetchedProgress)
                }
            } catch (err) {
                console.error("Error fetching progress from Supabase:", err)
            }
        }

        fetchProgress()

        return () => {
            mounted = false
        }
    }, [supabase])

    // Update current date progress view securely when date or allProgress changes
    useEffect(() => {
        setProgress(allProgress[dateKey] || {})
    }, [dateKey, allProgress])

    // Save with Optimistic UI updates
    const saveValue = useCallback(
        async (key: GoalKey, value: number) => {
            if (!userId) return

            // Optimistic Update UI
            setAllProgress((prevAll) => {
                const updatedAll = { ...prevAll }
                if (!updatedAll[dateKey]) updatedAll[dateKey] = {}
                updatedAll[dateKey] = { ...updatedAll[dateKey], [key]: value }
                return updatedAll
            })

            try {
                const { error } = await supabase
                    .from("progress")
                    .upsert(
                        {
                            user_id: userId,
                            date: dateKey,
                            metric_key: key,
                            value: value,
                        },
                        {
                            onConflict: "user_id, date, metric_key"
                        }
                    )
                if (error) throw error
            } catch (err) {
                console.error("Error saving progress to Supabase:", err)
            }
        },
        [supabase, dateKey, userId]
    )

    /**
     * Puan Hesaplama — Penalty-Based Dynamic Pool
     */
    const computeDailyScore = useCallback((dailyProgress: ProgressData): number => {
        // 1) Sadece aktif + veri girilmiş metrikleri topla
        const interacted: { key: GoalKey; weight: number; penaltyRatio: number }[] = []

        for (const [key, goal] of Object.entries(goals) as [GoalKey, Goals[GoalKey]][]) {
            if (!goal.isActive) continue

            const currentVal = dailyProgress[key]

            // Veri girilmediyse → havuza dahil etme
            if (currentVal === undefined || currentVal === null || isNaN(currentVal)) {
                continue
            }

            const weight = goal.weight || 2
            const target = goal.target ?? goal.limit ?? 0
            let penaltyRatio = 0

            if (key === "screen_time" || key === "calories") {
                // Tip B — Minimize: az daha iyi
                if (target > 0 && currentVal > target) {
                    penaltyRatio = Math.min(1, (currentVal - target) / target)
                }
            } else {
                // Tip A — Maximize: çok daha iyi
                if (target > 0 && currentVal < target) {
                    penaltyRatio = 1 - currentVal / target
                }
            }

            interacted.push({ key, weight, penaltyRatio })
        }

        // 2) Hiç veri girilmediyse → skor 100
        if (interacted.length === 0) return 100

        // 3) Dinamik havuz: toplam interacted ağırlık
        const totalWeight = interacted.reduce((sum, m) => sum + m.weight, 0)

        // 4) Her metriğin ceza payını hesapla ve topla
        let totalPenalty = 0
        for (const m of interacted) {
            const maxPenalty = (m.weight / totalWeight) * 100
            totalPenalty += m.penaltyRatio * maxPenalty
        }

        // 5) Skor = 100 - toplam ceza
        return Math.max(0, Math.round(100 - totalPenalty))
    }, [goals])

    const calculateScore = useCallback(() => computeDailyScore(progress), [computeDailyScore, progress])

    // Calculate history for all dates based on allProgress state
    const [history, setHistory] = useState<Record<string, number>>({})

    useEffect(() => {
        let mounted = true

        const newHistory: Record<string, number> = {}
        let newXpTotal = 0

        for (const [date, data] of Object.entries(allProgress)) {
            const score = computeDailyScore(data)
            newHistory[date] = score
            newXpTotal += score
        }

        if (mounted) {
            setHistory(newHistory)

            // Update user XP in Supabase if logged in
            if (userId) {
                // We use fire-and-forget here to keep UI fast
                supabase
                    .from("profiles")
                    .update({ xp: newXpTotal })
                    .eq("id", userId)
                    .then(({ error }) => {
                        if (error) console.error("Error updating XP in profiles:", error)
                    })
            }
        }

        return () => {
            mounted = false
        }
    }, [goals, computeDailyScore, allProgress, userId, supabase]) // Recalculate when goals, allProgress, or userId changes

    return { progress, saveValue, calculateScore, dateKey, history, setDateKey }
}
