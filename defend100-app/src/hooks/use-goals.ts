"use client"

import { useState, useEffect, useCallback } from "react"

export interface GoalConfig {
    weight: number
    target?: number
    limit?: number
    unit: string
    isActive: boolean
}

export type GoalKey = "hydration" | "activity" | "recovery" | "tasks" | "screen_time" | "calories"

export type Goals = Record<GoalKey, GoalConfig>

const STORAGE_KEY = "defend100_goals"

const DEFAULTS: Goals = {
    hydration: { weight: 2, target: 2500, unit: "ml", isActive: true },
    activity: { weight: 3, target: 10000, unit: "adım", isActive: true },
    recovery: { weight: 2, target: 8, unit: "saat", isActive: true },
    tasks: { weight: 1, target: 5, unit: "adet", isActive: true },
    screen_time: { weight: 2, limit: 3.5, unit: "saat", isActive: true },
    calories: { weight: 2, target: 2200, unit: "kcal", isActive: true },
}

export function useGoals() {
    const [goals, setGoals] = useState<Goals>(DEFAULTS)

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                const merged = { ...DEFAULTS }
                for (const key in merged) {
                    if (parsed[key]) {
                        merged[key as GoalKey] = { ...merged[key as GoalKey], ...parsed[key] }
                    }
                }
                setGoals(merged)
            } catch {
                setGoals(DEFAULTS)
            }
        }
    }, [])

    const saveGoals = useCallback((newGoals: Goals) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newGoals))
            setGoals(newGoals)
            return true
        } catch {
            return false
        }
    }, [])

    const getTargetValue = useCallback((key: GoalKey): number => {
        const goal = goals[key]
        return goal.target ?? goal.limit ?? 0
    }, [goals])

    const activeGoals = Object.entries(goals).filter(
        ([, config]) => config.isActive
    ) as [GoalKey, GoalConfig][]

    return { goals, saveGoals, getTargetValue, activeGoals, DEFAULTS }
}
