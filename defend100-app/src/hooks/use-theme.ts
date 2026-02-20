"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "zenith_theme"

export function useTheme() {
    const [isDark, setIsDark] = useState(true)
    const [mounted, setMounted] = useState(false)

    // Read saved theme on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        const prefersDark = saved === null
            ? document.documentElement.classList.contains("dark")
            : saved === "dark"
        setIsDark(prefersDark)
        document.documentElement.classList.toggle("dark", prefersDark)
        setMounted(true)
    }, [])

    const toggle = useCallback(() => {
        setIsDark((prev) => {
            const next = !prev
            document.documentElement.classList.toggle("dark", next)
            localStorage.setItem(STORAGE_KEY, next ? "dark" : "light")
            return next
        })
    }, [])

    const setTheme = useCallback((dark: boolean) => {
        setIsDark(dark)
        document.documentElement.classList.toggle("dark", dark)
        localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light")
    }, [])

    return { isDark, toggle, setTheme, mounted }
}
