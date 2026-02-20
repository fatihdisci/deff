"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { Settings, ChevronRight, Trophy, Flame, Shield, Activity, Calendar as CalendarIcon } from "lucide-react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import { AvatarPicker } from "@/components/ui/avatar-picker"
import { useGoals } from "@/hooks/use-goals"
import { useProgress } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
    const { goals } = useGoals()
    const { history } = useProgress(goals)

    // Calculate stats from real history
    const stats = useMemo(() => {
        const dates = Object.keys(history).sort()
        const scores = Object.values(history)
        const totalDays = scores.length
        const avgScore = totalDays > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / totalDays) : 0
        const perfectDays = scores.filter((s) => s >= 80).length

        // Calculate Streak (simple implementation: consecutive days with valid data)
        let currentStreak = 0
        // To make it robust, we should check date continuity.
        // For now, let's just count how many recent consecutive days have data
        if (dates.length > 0) {
            const sorted = [...dates].reverse()
            const today = new Date().toISOString().split("T")[0]
            const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

            // Start counting if the latet entry is today or yesterday
            if (sorted[0] === today || sorted[0] === yesterday) {
                let prevDate = new Date(sorted[0])
                currentStreak = 1
                for (let i = 1; i < sorted.length; i++) {
                    const currDate = new Date(sorted[i])
                    const diffTime = Math.abs(prevDate.getTime() - currDate.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                    if (diffDays === 1) {
                        currentStreak++
                        prevDate = currDate
                    } else {
                        break
                    }
                }
            }
        }

        return { avgScore, totalDays, currentStreak, perfectDays }
    }, [history])

    // Weekly Data (Last 7 Days)
    const weeklyData = useMemo(() => {
        const today = new Date()
        const days = []
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(today.getDate() - i)
            const dateKey = d.toISOString().split("T")[0]
            const label = d.toLocaleDateString("tr-TR", { weekday: "short" })
            const score = history[dateKey] ?? 0 // Default to 0 if no data
            const hasData = history[dateKey] !== undefined
            days.push({ label, score, hasData })
        }
        return days
    }, [history])

    return (
        <div className="flex min-h-screen flex-col">
            <PageTransition>
                <main className="flex-1 space-y-8 overflow-y-auto px-6 pb-32 pt-10 max-w-md mx-auto w-full">
                    {/* Avatar Picker */}
                    <div className="flex flex-col items-center gap-4">
                        <AvatarPicker />
                        <div className="text-center">
                            <h2 className="text-3xl font-black tracking-tight text-foreground">Fatih</h2>
                            <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2">
                                <Trophy className="w-4 h-4 text-amber-500" />
                                Seviye {Math.floor(stats.totalDays / 7) + 1} Savunucu
                                {stats.currentStreak >= 3 && (
                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Flame className="w-3 h-3 fill-current" />
                                        {stats.currentStreak}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Stat Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                <Activity className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Ortalama Skor
                            </p>
                            <p className="text-4xl font-black text-foreground mt-1">
                                {stats.avgScore}
                                <span className="text-sm text-muted-foreground font-medium ml-1">%</span>
                            </p>
                        </div>
                        <div className="glass-card rounded-2xl p-5 border-l-4 border-l-emerald-500/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                                <Shield className="w-8 h-8" />
                            </div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Mükemmel Gün
                            </p>
                            <p className="text-4xl font-black text-emerald-500 mt-1">{stats.perfectDays}</p>
                        </div>
                    </div>

                    {/* Weekly Chart */}
                    <section className="glass-card rounded-3xl p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                Son 7 Gün
                            </h3>
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold">
                                {stats.totalDays} Gün Kayıtlı
                            </span>
                        </div>

                        <div className="flex items-end justify-between gap-2 h-40 pt-4">
                            {weeklyData.map((d, i) => {
                                const pct = d.score
                                // Visual threshold colors
                                const colorClass =
                                    !d.hasData ? "bg-muted/20" :
                                        d.score >= 80 ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" :
                                            d.score >= 50 ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.4)]" :
                                                "bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.4)]"

                                const height = d.hasData ? Math.max(10, pct) : 5

                                return (
                                    <div key={i} className="flex flex-1 flex-col items-center gap-2 group relative">
                                        {d.hasData && (
                                            <div className="absolute -top-8 bg-card border border-white/10 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                                {d.score} Puan
                                            </div>
                                        )}
                                        <div className="w-full relative h-full flex items-end bg-transparent rounded-lg overflow-hidden">
                                            <div
                                                className={cn("w-full rounded-t-lg transition-all duration-1000 ease-out", colorClass)}
                                                style={{ height: `${height}%` }}
                                            />
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                            {d.label}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Settings Link */}
                    <Link
                        href="/settings"
                        className="flex items-center justify-between glass-card rounded-2xl p-5 transition-colors hover:bg-card/80 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                <Settings className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            </div>
                            <span className="font-medium">Uygulama Ayarları</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                    </Link>
                </main>
            </PageTransition>

        </div>
    )
}
