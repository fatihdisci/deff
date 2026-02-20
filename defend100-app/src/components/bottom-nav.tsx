"use client"

import { type ComponentType, type SVGProps } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { User } from "lucide-react"
import { DefenseIcon, HistoryIcon, ArsenalIcon } from "@/components/icons"
import { cn } from "@/lib/utils"

type NavIcon = ComponentType<SVGProps<SVGSVGElement>> | ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>

interface NavItem {
    href: string
    label: string
    icon: NavIcon
    isCustomSvg?: boolean
}

const navItems: NavItem[] = [
    { href: "/", label: "Ana Sayfa", icon: DefenseIcon, isCustomSvg: true },
    { href: "/audit", label: "Geçmiş", icon: HistoryIcon, isCustomSvg: true },
    { href: "/arsenal", label: "Hedefler", icon: ArsenalIcon, isCustomSvg: true },
    { href: "/profile", label: "Profil", icon: User },
]

export function BottomNav() {
    const pathname = usePathname()

    // Hide BottomNav on auth and onboarding routes
    if (pathname === '/login' || pathname.startsWith('/onboarding')) {
        return null
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="mx-auto flex max-w-md items-center justify-around px-2 h-20">
                {navItems.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : item.href === "/profile"
                            ? pathname === "/profile" || pathname === "/settings"
                            : pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2"
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="bottom-nav-pill"
                                    className="absolute inset-x-2 top-1 bottom-1 rounded-2xl bg-primary/10 dark:bg-primary/15"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <div className={cn(
                                "relative z-10 flex flex-col items-center gap-1 transition-colors duration-200",
                                isActive ? "text-primary dark:text-primary" : "text-muted-foreground/60 dark:text-muted-foreground/50 hover:text-muted-foreground"
                            )}>
                                {item.isCustomSvg ? (
                                    <Icon
                                        className={cn(
                                            "h-6 w-6 transition-transform duration-300",
                                            isActive && "scale-110"
                                        )}
                                    />
                                ) : (
                                    <Icon
                                        className="h-6 w-6"
                                        strokeWidth={1.5}
                                    />
                                )}
                                <span className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
                                    isActive ? "opacity-100" : "opacity-70"
                                )}>
                                    {item.label}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
