"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

type TierEvent = "up" | "down" | "perfect" | null

interface Particle {
    id: number
    x: number
    y: number
    color: string
    size: number
    rotation: number
    dx: number
    dy: number
}

const TIER_COLORS = {
    up: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"],      // emerald shades
    down: ["#EF4444", "#F87171", "#FCA5A5", "#FECACA"],     // red shades
    perfect: ["#EAB308", "#FACC15", "#FDE047", "#FEF08A", "#F59E0B", "#ffffff"], // gold + white
}

function createParticles(type: TierEvent, count: number): Particle[] {
    if (!type) return []
    const colors = TIER_COLORS[type]
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 30,   // spread from center
        y: type === "perfect" ? 40 : 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: type === "perfect" ? Math.random() * 10 + 4 : Math.random() * 8 + 3,
        rotation: Math.random() * 360,
        dx: (Math.random() - 0.5) * 60,        // horizontal spread
        dy: type === "down" ? Math.random() * 40 + 10 : -(Math.random() * 50 + 20), // up or down
    }))
}

/* ── Celebration Overlay ── */
export function TierCelebration({
    event,
    onComplete,
}: {
    event: TierEvent
    onComplete: () => void
}) {
    const [particles, setParticles] = useState<Particle[]>([])

    useEffect(() => {
        if (!event) return
        const count = event === "perfect" ? 40 : 20
        setParticles(createParticles(event, count))
        const timer = setTimeout(onComplete, 1500)
        return () => clearTimeout(timer)
    }, [event, onComplete])

    if (!event) return null

    return (
        <AnimatePresence>
            <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
                {/* Flash overlay */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.15, 0] }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0"
                    style={{
                        backgroundColor:
                            event === "perfect"
                                ? "#EAB308"
                                : event === "up"
                                    ? "#10B981"
                                    : "#EF4444",
                    }}
                />

                {/* Particles */}
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            opacity: 1,
                            scale: 0,
                            rotate: 0,
                        }}
                        animate={{
                            left: `${p.x + p.dx}%`,
                            top: `${p.y + p.dy}%`,
                            opacity: [1, 1, 0],
                            scale: [0, 1.2, 0.8],
                            rotate: p.rotation,
                        }}
                        transition={{
                            duration: event === "perfect" ? 1.4 : 1,
                            ease: "easeOut",
                        }}
                        className="absolute"
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            borderRadius: event === "perfect" ? (Math.random() > 0.5 ? "2px" : "50%") : "50%",
                        }}
                    />
                ))}
            </div>
        </AnimatePresence>
    )
}

/* ── Tier helper ── */
export function getTier(score: number): number {
    if (score >= 90) return 3  // gold
    if (score >= 70) return 2  // emerald
    if (score >= 40) return 1  // amber
    return 0                   // red
}
