"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { NumberTicker } from "@/components/number-ticker"
import { motion, useSpring, useTransform, useAnimation } from "framer-motion"

interface ScoreRingProps {
    score: number
    size?: number
    strokeWidth?: number
    className?: string
}

export function ScoreRing({
    score,
    size = 256,
    strokeWidth = 12,
    className,
}: ScoreRingProps) {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius

    // Animated offset via spring
    const springOffset = useSpring(circumference, {
        stiffness: 60,
        damping: 20,
    })

    // Update spring target when score changes
    const targetOffset = circumference - (score / 100) * circumference
    springOffset.set(targetOffset)

    const animatedOffset = useTransform(springOffset, (v) => v)

    // Color based on score thresholds (4-tier)
    let strokeColor = "#EAB308" // ≥90 — gold
    if (score < 40) strokeColor = "#EF4444" // 0-39 — red
    else if (score < 70) strokeColor = "#F59E0B" // 40-69 — amber
    else if (score < 90) strokeColor = "#10B981" // 70-89 — emerald

    // ── Hit Shake: detect score drops ──
    const prevScore = useRef(score)
    const shakeControls = useAnimation()

    useEffect(() => {
        if (score < prevScore.current) {
            shakeControls.start({
                x: [-5, 5, -5, 5, 0],
                transition: { duration: 0.4, ease: "easeInOut" },
            })
        }
        prevScore.current = score
    }, [score, shakeControls])

    // Glow color synced to stroke color (4-tier)
    const glowColor =
        score < 40
            ? "rgba(239, 68, 68, 0.25)"
            : score < 70
                ? "rgba(245, 158, 11, 0.25)"
                : score < 90
                    ? "rgba(16, 185, 129, 0.25)"
                    : "rgba(234, 179, 8, 0.3)"

    return (
        // Hit-shake wrapper
        <motion.div animate={shakeControls}>
            <div
                className={cn("relative flex items-center justify-center", className)}
                style={{ width: size, height: size }}
            >
                {/* Breathing ring — only the SVG breathes */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center rounded-full"
                    animate={{
                        scale: [1, 1.02, 1],
                        boxShadow: [
                            `0 0 6px 0px ${glowColor}`,
                            `0 0 10px 2px ${glowColor}`,
                            `0 0 6px 0px ${glowColor}`,
                        ],
                    }}
                    transition={{
                        duration: 3,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop" as const,
                    }}
                >
                    <svg
                        className="score-ring -rotate-90"
                        width={size}
                        height={size}
                    >
                        {/* Background track */}
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke="var(--muted)"
                            strokeWidth={strokeWidth}
                        />
                        {/* Progress arc — animated */}
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            strokeDasharray={circumference}
                            strokeDashoffset={animatedOffset}
                            strokeLinecap="round"
                            style={{ transition: "stroke 0.4s ease" }}
                        />
                    </svg>
                </motion.div>

                {/* Center content — stays fixed, does NOT breathe */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {/* Atmosphere glow behind the number */}
                    <div
                        className="absolute w-32 h-32 rounded-full blur-3xl opacity-20"
                        style={{ backgroundColor: strokeColor }}
                    />
                    <NumberTicker
                        value={score}
                        className="relative text-8xl font-black tracking-tighter"
                        springOptions={{ stiffness: 80, damping: 20 }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

