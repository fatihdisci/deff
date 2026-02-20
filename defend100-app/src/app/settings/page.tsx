"use client"

import { useState, useCallback } from "react"
import { ArrowLeft, Moon, Sun, Bell, Trash2 } from "lucide-react"
import Link from "next/link"
import { PageTransition } from "@/components/page-transition"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"

/* ── Toggle Switch ── */
function ToggleSwitch({
    checked,
    onChange,
}: {
    checked: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "relative h-7 w-12 rounded-full transition-all",
                checked
                    ? "bg-primary shadow-[0_0_10px] shadow-primary/50"
                    : "bg-muted"
            )}
        >
            <div
                className={cn(
                    "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
                    checked ? "left-6" : "left-1"
                )}
            />
        </button>
    )
}

export default function SettingsPage() {
    const { isDark, setTheme, mounted } = useTheme()
    const [notifications, setNotifications] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleDarkModeToggle = useCallback((val: boolean) => {
        setTheme(val)
    }, [setTheme])

    const handleReset = useCallback(() => {
        localStorage.removeItem("zenith_goals")
        localStorage.removeItem("zenith_progress")
        setShowConfirm(false)
        window.location.reload()
    }, [])

    return (
        <div className="flex min-h-screen flex-col">
            {/* Header */}
            <header className="p-6 flex items-center gap-4">
                <Link
                    href="/profile"
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-accent"
                >
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
                <h2 className="text-2xl font-bold">Ayarlar</h2>
            </header>

            <PageTransition>
                <main className="mx-auto max-w-md space-y-4 px-6 pb-32 w-full">
                    {/* Dark Mode */}
                    <div className="glass-card flex items-center justify-between rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            {isDark
                                ? <Moon className="h-5 w-5 text-primary" />
                                : <Sun className="h-5 w-5 text-amber-500" />
                            }
                            <span className="font-medium">
                                {isDark ? "Gece Modu" : "Gündüz Modu"}
                            </span>
                        </div>
                        <ToggleSwitch checked={isDark} onChange={handleDarkModeToggle} />
                    </div>

                    {/* Notifications */}
                    <div className="glass-card flex items-center justify-between rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="font-medium">Bildirim Hatırlatıcı</span>
                        </div>
                        <ToggleSwitch checked={notifications} onChange={setNotifications} />
                    </div>

                    {/* Reset Data */}
                    <div className="pt-10">
                        {!showConfirm ? (
                            <button
                                onClick={() => setShowConfirm(true)}
                                className="w-full rounded-2xl border border-destructive/20 py-5 font-bold text-destructive transition-all hover:bg-destructive/5 active:scale-95"
                            >
                                Tüm Verileri Sıfırla
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-center text-sm text-destructive font-medium">
                                    Emin misiniz? Bu işlem geri alınamaz.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="flex-1 rounded-xl border border-border py-3 font-medium transition-all hover:bg-accent"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive py-3 font-bold text-destructive-foreground transition-all active:scale-95"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Sıfırla
                                    </button>
                                </div>
                            </div>
                        )}

                        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
                            Zenith v2.0.0 — React Build
                        </p>
                    </div>
                </main>
            </PageTransition>

        </div>
    )
}
