"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col justify-between p-8">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-20 space-y-6"
            >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/30 bg-primary/15">
                    <Shield className="h-10 w-10 text-primary" />
                </div>

                <h1 className="text-5xl font-black leading-none tracking-tighter">
                    HER GÜN{" "}
                    <br />
                    <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                        100 PUANLA
                    </span>{" "}
                    <br />
                    BAŞLA.
                </h1>

                <p className="max-w-sm text-lg font-light leading-relaxed text-muted-foreground">
                    Mükemmel bir skorun var. Tek görevin, gün boyu yapacağın hatalarla bu
                    puanın erimesini engellemek.
                </p>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="space-y-4"
            >
                {/* Progress dots */}
                <div className="flex gap-2">
                    <div className="h-1 w-12 rounded-full bg-primary" />
                    <div className="h-1 w-4 rounded-full bg-muted" />
                    <div className="h-1 w-4 rounded-full bg-muted" />
                </div>

                <motion.div whileTap={{ scale: 0.95 }}>
                    <Link
                        href="/"
                        className="flex w-full items-center justify-center rounded-2xl bg-primary py-5 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90"
                    >
                        Savunmaya Başla
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    )
}
