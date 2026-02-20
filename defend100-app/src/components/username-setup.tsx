"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, User, ShieldCheck, XCircle } from "lucide-react"
import { UserProfile } from "@/hooks/use-profile"
import { AvatarPicker } from "@/components/ui/avatar-picker"

interface UsernameSetupProps {
    profile: UserProfile
    updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
    checkUsernameAvailability: (username: string) => Promise<boolean>
}

export function UsernameSetup({ profile, updateProfile, checkUsernameAvailability }: UsernameSetupProps) {
    const [username, setUsername] = useState("")
    const [status, setStatus] = useState<"idle" | "checking" | "available" | "unavailable" | "invalid">("idle")
    const [saving, setSaving] = useState(false)

    // Regex: At least 8 chars, at least 1 letter, at least 1 number, only letters, numbers, dot, dash
    const isValidFormat = (val: string) => /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9.-]{8,}$/.test(val)

    useEffect(() => {
        if (!username) {
            setStatus("idle")
            return
        }

        if (!isValidFormat(username)) {
            setStatus("invalid")
            return
        }

        setStatus("checking")
        const timer = setTimeout(async () => {
            const isAvail = await checkUsernameAvailability(username)
            setStatus(isAvail ? "available" : "unavailable")
        }, 500)

        return () => clearTimeout(timer)
    }, [username, checkUsernameAvailability])

    const handleSave = async () => {
        if (status !== "available" || saving) return
        setSaving(true)

        // Profil sayfasında saklanan avatar_id yi kaydediyoruz (localStorage'da halihazırda var)
        const savedAvatar = localStorage.getItem("zenith_avatar_id") || "1"

        const success = await updateProfile({
            username: username,
            avatarId: savedAvatar,
            displayName: username // Display name olarak da kullanıyoruz initial phase'de
        })

        if (!success) {
            setSaving(false)
            // Error handling could be here
        }
    }

    return (
        <div className="flex min-h-[100dvh] flex-col items-center p-4 sm:p-6 bg-background relative overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-20 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-sm space-y-6 glass-card p-6 sm:p-8 rounded-3xl border border-border my-auto"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-black tracking-tight">Karakterini Yarat</h1>
                    <p className="text-sm text-muted-foreground">
                        Seni Zenith dünyasında temsil edecek avatarını ve kullanıcı adını belirle.
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Avatar Selection */}
                    <div className="bg-card/50 rounded-2xl p-4 border border-border">
                        <AvatarPicker />
                    </div>

                    {/* Username Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Kullanıcı Adı
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                                placeholder="Örn: fatih.123"
                                className={`w-full rounded-xl border bg-background py-3 pl-10 pr-10 text-sm outline-none transition-all focus:ring-2 
                                    ${status === "available" ? "border-emerald-500/50 focus:ring-emerald-500/20" :
                                        status === "unavailable" || status === "invalid" ? "border-destructive/50 focus:ring-destructive/20" :
                                            "border-border focus:border-primary focus:ring-primary/20"}`}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {status === "checking" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                {status === "available" && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                                {status === "unavailable" && <XCircle className="h-4 w-4 text-destructive" />}
                            </div>
                        </div>

                        {/* Status Messages */}
                        <div className="h-4 mt-1">
                            {status === "checking" && <p className="text-[10px] text-muted-foreground">Uygunluğu kontrol ediliyor...</p>}
                            {status === "available" && <p className="text-[10px] text-emerald-500 font-medium">Bu kullanıcı adı uygun!</p>}
                            {status === "unavailable" && <p className="text-[10px] text-destructive font-medium">Bu isim başkası tarafından alınmış.</p>}
                            {status === "invalid" && username.length > 0 && (
                                <p className="text-[10px] text-destructive font-medium">En az 8 karakter, 1 harf ve 1 rakam içermeli.</p>
                            )}
                            {status === "idle" && (
                                <p className="text-[10px] text-muted-foreground">En az 8 karakter, harf ve rakam zorunlu.</p>
                            )}
                        </div>
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={handleSave}
                        disabled={status !== "available" || saving}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Maceraya Başla"}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}
