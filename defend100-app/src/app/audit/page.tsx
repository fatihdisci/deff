"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { PageTransition } from "@/components/page-transition"
import { ArrowLeft, Calendar as CalendarIcon, RotateCcw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link"
import { useGoals, type GoalKey } from "@/hooks/use-goals"
import { useProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

const METRIC_LABELS: Record<GoalKey, { name: string; lessIsBetter?: boolean }> = {
    hydration: { name: "SU" },
    activity: { name: "HAREKET" },
    recovery: { name: "DİNLENME" },
    tasks: { name: "GÖREVLER" },
    screen_time: { name: "EKRAN SÜRESİ", lessIsBetter: true },
    calories: { name: "KALORİ", lessIsBetter: true },
}

interface Deduction {
    key: GoalKey
    label: string
    detail: string
    points: number // negative
}

export default function AuditPage() {
    const { goals, activeGoals, getTargetValue } = useGoals()
    const { progress, calculateScore, dateKey, history, setDateKey } = useProgress(goals)
    const score = calculateScore()

    const formattedDate = useMemo(() => {
        const d = new Date(dateKey)
        return d.toLocaleDateString("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).toUpperCase()
    }, [dateKey])

    // Calculate deductions for the receipt (matches scoring engine logic)
    const deductions: Deduction[] = useMemo(() => {
        const items: Deduction[] = []

        // Collect interacted metrics + their penalty ratios
        const interactedEntries: { key: GoalKey; weight: number; penaltyRatio: number }[] = []

        for (const [key] of activeGoals) {
            const val = progress[key]
            if (val === undefined || val === null) continue

            const goal = goals[key]
            const weight = goal.weight || 2
            const target = getTargetValue(key)
            const meta = METRIC_LABELS[key]
            let penaltyRatio = 0

            if (meta.lessIsBetter) {
                // Tip B — Minimize
                if (target > 0 && val > target) {
                    penaltyRatio = Math.min(1, (val - target) / target)
                }
            } else {
                // Tip A — Maximize
                if (target > 0 && val < target) {
                    penaltyRatio = 1 - val / target
                }
            }

            interactedEntries.push({ key, weight, penaltyRatio })
        }

        const totalWeight = interactedEntries.reduce((s, m) => s + m.weight, 0)

        for (const m of interactedEntries) {
            if (m.penaltyRatio <= 0) continue

            const maxPenalty = totalWeight > 0 ? (m.weight / totalWeight) * 100 : 0
            const pts = Math.round(m.penaltyRatio * maxPenalty)
            if (pts <= 0) continue

            const meta = METRIC_LABELS[m.key]
            const goal = goals[m.key]
            const val = progress[m.key]!
            const target = getTargetValue(m.key)
            const pctLabel = Math.round(m.penaltyRatio * 100)

            items.push({
                key: m.key,
                label: meta.lessIsBetter
                    ? `${meta.name} AŞIM (${pctLabel}%)`
                    : `${meta.name} EKSİK (${pctLabel}%)`,
                detail: `Girilen: ${val} / ${target} ${goal.unit}`,
                points: -pts,
            })
        }

        return items
    }, [activeGoals, progress, goals, getTargetValue])

    const totalDeductions = deductions.reduce((sum, d) => sum + d.points, 0)

    const stampLabel =
        score >= 90 ? "MÜKEMMEL" : score >= 70 ? "BAŞARILI" : score >= 40 ? "DİKKAT" : "BAŞARISIZ"
    const stampColor =
        score >= 90
            ? "text-yellow-500/80 border-yellow-500/40"
            : score >= 70
                ? "text-emerald-500/80 border-emerald-500/40"
                : score >= 40
                    ? "text-amber-500/80 border-amber-500/40"
                    : "text-destructive/80 border-destructive/40"

    return (
        <div className="flex min-h-screen flex-col">
            {/* Ambient glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute top-[40%] -right-[10%] h-[50%] w-[50%] rounded-full bg-primary/5 blur-[150px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between border-b border-border/30 bg-background/50 p-4 backdrop-blur-md">
                <Link href="/" className="rounded-lg p-2 transition-colors hover:bg-accent">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="text-center">
                    <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                        Günün Bilançosu
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground/70">{formattedDate}</p>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="rounded-lg p-2 transition-colors hover:bg-accent">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={new Date(dateKey)}
                            onSelect={(date) => {
                                if (date) {
                                    const offset = date.getTimezoneOffset()
                                    const adjusted = new Date(date.getTime() - offset * 60 * 1000)
                                    setDateKey(adjusted.toISOString().split("T")[0])
                                }
                            }}
                            initialFocus
                            modifiers={{
                                good: (date) => (history[date.toISOString().split("T")[0]] ?? 0) >= 80,
                                average: (date) => {
                                    const s = history[date.toISOString().split("T")[0]]
                                    return s !== undefined && s >= 50 && s < 80
                                },
                                bad: (date) => {
                                    const s = history[date.toISOString().split("T")[0]]
                                    return s !== undefined && s < 50
                                },
                            }}
                            modifiersClassNames={{
                                good: "bg-emerald-500/20 text-emerald-600 font-bold hover:bg-emerald-500/30",
                                average: "bg-amber-500/20 text-amber-600 font-bold hover:bg-amber-500/30",
                                bad: "bg-destructive/10 text-destructive font-bold hover:bg-destructive/20",
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </header>

            {/* Receipt */}
            <main className="relative z-10 flex flex-1 flex-col items-center overflow-y-auto px-4 pb-36 pt-8">
                <div className="w-full max-w-md">
                    {/* Jagged top */}
                    <div className="receipt-jagged-top mb-[-1px] h-3 w-full bg-muted/50" />

                    {/* Receipt body */}
                    <div className="relative overflow-hidden bg-card px-6 py-10 shadow-2xl">
                        {/* Paper texture overlay */}
                        <div className="pointer-events-none absolute inset-0 opacity-[0.02] bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)]" />

                        {/* Header */}
                        <div className="mb-8 border-b-2 border-dashed border-border pb-6 text-center">
                            <h2 className="mb-1 text-2xl font-black italic tracking-tighter">
                                ZENITH
                            </h2>
                            <p className="font-mono text-[10px] uppercase leading-tight tracking-widest text-muted-foreground">
                                Terminal No: #ZNTH-8842
                                <br />
                                Doğrulama Kodu: 992-AXL-00
                            </p>
                        </div>

                        {/* Deductions */}
                        <div className="mb-10 space-y-5 font-mono">
                            {deductions.length === 0 ? (
                                <div className="text-center">
                                    <p className="text-sm font-bold text-emerald-500">
                                        KESİNTİ YOK
                                    </p>
                                    <p className="text-[10px] italic text-muted-foreground">
                                        Mükemmel gün — tüm metrikler sağlam!
                                    </p>
                                </div>
                            ) : (
                                deductions.map((d) => (
                                    <div key={d.key} className="group flex items-start justify-between">
                                        <div className="mr-4 flex-1">
                                            <p className="text-sm font-bold">{d.label}</p>
                                            <p className="text-[10px] italic text-muted-foreground">
                                                {d.detail}
                                            </p>
                                        </div>
                                        <p className="whitespace-nowrap font-bold text-destructive">
                                            {d.points}pts
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Totals */}
                        <div className="mb-10 space-y-2 border-t-2 border-dashed border-border pt-6">
                            <div className="flex justify-between font-mono text-xs">
                                <span>TOPLAM KESİNTİ</span>
                                <span>{totalDeductions} PTS</span>
                            </div>
                            <div className="flex justify-between font-mono text-xs">
                                <span>GÜNLÜK BAŞLANGIÇ</span>
                                <span>100 PTS</span>
                            </div>
                            <div className="mt-4 flex justify-between border-t border-border pt-2 text-xl font-bold">
                                <span>TOPLAM SKOR</span>
                                <span className="text-primary">{score}</span>
                            </div>
                        </div>

                        {/* Stamp — drop-in animation */}
                        <div className="relative flex justify-center py-4">
                            <motion.div
                                initial={{ scale: 3, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 12,
                                    delay: 0.5,
                                }}
                                className={cn(
                                    "stamp-effect text-4xl font-black tracking-tighter",
                                    stampColor
                                )}
                            >
                                {stampLabel}
                            </motion.div>
                            <div className="absolute -right-2 -top-4 opacity-[0.06]">
                                <span className="text-8xl font-black">{score}</span>
                            </div>
                        </div>

                        {/* Barcode */}
                        <div className="mt-12 text-center font-mono">
                            <div className="mb-4 flex justify-center gap-1 opacity-20">
                                {[1, 2, 0.5, 3, 1, 2, 0.5, 1].map((w, i) => (
                                    <div
                                        key={i}
                                        className="h-8 bg-foreground"
                                        style={{ width: `${w * 4}px` }}
                                    />
                                ))}
                            </div>
                            <p className="text-[9px] uppercase tracking-widest text-muted-foreground/50">
                                Serini korumaya devam et.
                                <br />
                                Her gün performansını savun.
                            </p>
                        </div>
                    </div>

                    {/* Jagged bottom */}
                    <div className="receipt-jagged-bottom mt-[-1px] h-3 w-full bg-muted/50" />
                </div>
            </main>

            {/* Renew Button */}
            <div className="fixed bottom-20 left-0 right-0 z-40 bg-gradient-to-t from-background via-background to-transparent p-4">
                <div className="mx-auto max-w-md">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                    >
                        <RotateCcw className="h-5 w-5" />
                        Yarın İçin Yenile
                    </motion.button>
                </div>
            </div>

        </div>
    )
}
