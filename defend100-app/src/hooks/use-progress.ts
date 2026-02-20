"use client"

import { useState, useEffect, useCallback } from "react"
import type { Goals, GoalKey } from "./use-goals"

type ProgressData = Partial<Record<GoalKey, number>>
type AllProgress = Record<string, ProgressData>

const STORAGE_KEY = "defend100_progress"

function getTodayKey(): string {
    return new Date().toISOString().split("T")[0]
}

export function useProgress(goals: Goals) {
    const [dateKey, setDateKey] = useState(getTodayKey)
    const [progress, setProgress] = useState<ProgressData>({})

    // Load from localStorage
    useEffect(() => {
        const all: AllProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        setProgress(all[dateKey] || {})
    }, [dateKey])

    const saveValue = useCallback(
        (key: GoalKey, value: number) => {
            const all: AllProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
            if (!all[dateKey]) all[dateKey] = {}
            all[dateKey][key] = value
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
            setProgress((prev) => ({ ...prev, [key]: value }))
        },
        [dateKey]
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

    // Calculate history for all dates
    const [history, setHistory] = useState<Record<string, number>>({})

    useEffect(() => {
        const all: AllProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        const newHistory: Record<string, number> = {}
        for (const [date, data] of Object.entries(all)) {
            newHistory[date] = computeDailyScore(data)
        }
        setHistory(newHistory)
    }, [goals, computeDailyScore, progress]) // Recalculate when goals or current progress changes

    return { progress, saveValue, calculateScore, dateKey, history, setDateKey }
}
