"use client"

import { useEffect, useRef } from "react"
import {
    motion,
    useSpring,
    useTransform,
    useMotionValue,
    type SpringOptions,
} from "framer-motion"

interface NumberTickerProps {
    value: number
    className?: string
    springOptions?: SpringOptions
}

export function NumberTicker({
    value,
    className = "",
    springOptions,
}: NumberTickerProps) {
    const motionValue = useMotionValue(0)

    const spring = useSpring(motionValue, {
        stiffness: 100,
        damping: 30,
        mass: 1,
        ...springOptions,
    })

    const display = useTransform(spring, (v) => Math.round(v))

    const ref = useRef<HTMLSpanElement>(null)

    useEffect(() => {
        motionValue.set(value)
    }, [motionValue, value])

    useEffect(() => {
        const unsubscribe = display.on("change", (latest) => {
            if (ref.current) {
                ref.current.textContent = String(latest)
            }
        })
        return unsubscribe
    }, [display])

    return (
        <motion.span ref={ref} className={className}>
            {Math.round(value)}
        </motion.span>
    )
}
