"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Check } from "lucide-react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import { useGoals, type GoalKey, type Goals } from "@/hooks/use-goals"
import { cn } from "@/lib/utils"

/* ── Goal card config (slider ranges, icons) ── */
interface GoalCardConfig {
    key: GoalKey
    label: string
    icon: string
    unit: string
    min: number
    max: number
    step: number
    valKey: "target" | "limit"
    lessIsBetter?: boolean
}

const GOAL_CONFIGS: GoalCardConfig[] = [
    { key: "hydration", label: "Su", icon: "💧", unit: "ml", min: 1000, max: 5000, step: 100, valKey: "target" },
    { key: "activity", label: "Hareket", icon: "👟", unit: "adım", min: 2000, max: 20000, step: 500, valKey: "target" },
    { key: "recovery", label: "Dinlenme", icon: "😴", unit: "saat", min: 4, max: 12, step: 0.5, valKey: "target" },
    { key: "tasks", label: "Görevler", icon: "✅", unit: "adet", min: 1, max: 15, step: 1, valKey: "target" },
    { key: "screen_time", label: "Ekran Süresi", icon: "📱", unit: "saat", min: 0.5, max: 8, step: 0.5, valKey: "limit", lessIsBetter: true },
    { key: "calories", label: "Kalori", icon: "🍽️", unit: "kcal", min: 1000, max: 4000, step: 100, valKey: "target", lessIsBetter: true },
]

/* ── Weight Selector ── */
const WEIGHT_OPTIONS = [
    { value: 1, label: "Düşük", icon: "🛡️" },
    { value: 2, label: "Orta", icon: "⚔️" },
    { value: 3, label: "Yüksek", icon: "🔥" },
]

function WeightSelector({
    value,
    onChange,
}: {
    value: number
    onChange: (v: number) => void
}) {
    return (
        <div className="flex items-center gap-1">
            {WEIGHT_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all",
                        value === opt.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-accent"
                    )}
                >
                    <span className="text-sm">{opt.icon}</span>
                    <span>{opt.label}</span>
                </button>
            ))}
        </div>
    )
}

/* ── Active Toggle ── */
function ActiveToggle({
    isActive,
    onChange,
}: {
    isActive: boolean
    onChange: (active: boolean) => void
}) {
    return (
        <button
            onClick={() => onChange(!isActive)}
            className={cn(
                "relative flex h-7 w-12 items-center rounded-full transition-colors",
                isActive ? "bg-primary" : "bg-muted"
            )}
        >
            <motion.div
                animate={{ x: isActive ? 22 : 2 }}
                transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                className="h-5 w-5 rounded-full bg-white shadow-sm"
            />
        </button>
    )
}

/* ── Goal Card ── */
function GoalCard({
    config,
    weight,
    targetValue,
    isActive,
    onWeightChange,
    onTargetChange,
    onActiveChange,
}: {
    config: GoalCardConfig
    weight: number
    targetValue: number
    isActive: boolean
    onWeightChange: (w: number) => void
    onTargetChange: (v: number) => void
    onActiveChange: (active: boolean) => void
}) {
    const displayValue =
        config.key === "recovery" || config.key === "screen_time"
            ? targetValue.toFixed(1)
            : targetValue.toLocaleString()

    return (
        <section
            className={cn(
                "glass-card rounded-2xl p-5 transition-all",
                !isActive && "opacity-40"
            )}
        >
            {/* Header Row */}
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-lg">
                        {config.icon}
                    </div>
                    <div>
                        <h3 className="font-bold">{config.label}</h3>
                        {config.lessIsBetter && (
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                Azı karar
                            </span>
                        )}
                    </div>
                </div>

                <ActiveToggle isActive={isActive} onChange={onActiveChange} />
            </div>

            {/* Weight selector */}
            <div className="mb-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Etki Ağırlığı
                </p>
                <WeightSelector value={weight} onChange={onWeightChange} />
            </div>

            {/* Slider */}
            <div className="space-y-3">
                <div className="flex items-baseline justify-between text-sm">
                    <span className="font-light text-muted-foreground">
                        {config.lessIsBetter ? "Günlük Limit" : "Günlük Hedef"}
                    </span>
                    <span className="font-semibold text-foreground">
                        {displayValue} {config.unit}
                    </span>
                </div>
                <input
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={targetValue}
                    onChange={(e) => onTargetChange(parseFloat(e.target.value))}
                    disabled={!isActive}
                    className="range-slider w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground/60">
                    <span>{config.min}</span>
                    <span>{config.max}</span>
                </div>
            </div>
        </section>
    )
}

/* ── Arsenal Page ── */
export default function ArsenalPage() {
    const { goals, saveGoals } = useGoals()
    const [draft, setDraft] = useState<Goals>(goals)
    const [saved, setSaved] = useState(false)

    // Sync draft when goals load from localStorage
    useState(() => {
        setDraft(goals)
    })

    // Keep draft in sync with goals (loaded from LS async)
    const syncedDraft = Object.keys(draft).length > 0 ? draft : goals

    const updateDraft = useCallback(
        (key: GoalKey, field: string, value: number | boolean) => {
            setDraft((prev) => ({
                ...prev,
                [key]: { ...prev[key], [field]: value },
            }))
            setSaved(false)
        },
        []
    )

    const handleSave = async () => {
        const success = await saveGoals(syncedDraft)
        if (success) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 px-6 py-5 backdrop-blur-md">
                <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
                        >
                            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                        </Link>
                        <h1 className="text-xl font-bold tracking-tight">
                            Ağırlıklar & Hedefler
                        </h1>
                    </div>
                </div>
                <p className="max-w-md text-sm font-light leading-relaxed text-muted-foreground">
                    Her alışkanlığa önem derecesi ata. Yüksek ağırlık, başarısız olunca
                    daha fazla puan kaybı demektir. Stratejin skorunu belirler.
                </p>
            </header>

            {/* Cards */}
            <PageTransition>
                <main className="flex-1 space-y-5 overflow-y-auto px-6 pb-36 pt-4 max-w-2xl mx-auto w-full">
                    {GOAL_CONFIGS.map((config, i) => {
                        const goal = syncedDraft[config.key]
                        const targetVal = (goal?.[config.valKey] as number) ?? 0
                        return (
                            <motion.div
                                key={config.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.4 }}
                            >
                                <GoalCard
                                    config={config}
                                    weight={goal?.weight ?? 2}
                                    targetValue={targetVal}
                                    isActive={goal?.isActive !== false}
                                    onWeightChange={(w) => updateDraft(config.key, "weight", w)}
                                    onTargetChange={(v) => updateDraft(config.key, config.valKey, v)}
                                    onActiveChange={(a) => updateDraft(config.key, "isActive", a)}
                                />
                            </motion.div>
                        )
                    })}
                </main>
            </PageTransition>

            {/* Save Button */}
            <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-background via-background to-transparent p-4">
                <div className="mx-auto max-w-md">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        onClick={handleSave}
                        className={cn(
                            "flex w-full items-center justify-center gap-2 rounded-xl py-4 font-bold shadow-lg transition-all",
                            saved
                                ? "bg-emerald-500 text-white shadow-emerald-500/25"
                                : "bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90"
                        )}
                    >
                        {saved ? (
                            <>
                                <Check className="h-5 w-5" />
                                Kaydedildi!
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Hedefleri Kaydet
                            </>
                        )}
                    </motion.button>
                </div>
            </div>

        </div>
    )
}
