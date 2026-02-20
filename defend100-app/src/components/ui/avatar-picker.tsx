"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface Avatar {
    id: number;
    svg: React.ReactNode;
    alt: string;
    theme: string;
}

// Zenith Temasına uygun 6 Minimalist Avatar
export const avatars: Avatar[] = [
    {
        id: 1,
        alt: "The Guardian",
        theme: "from-blue-500 to-indigo-500",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="18" cy="18" r="18" fill="#1e3a8a" />
                <rect x="10" y="14" width="16" height="8" rx="4" fill="#60a5fa" />
                <circle cx="14" cy="18" r="2" fill="#1e3a8a" />
                <circle cx="22" cy="18" r="2" fill="#1e3a8a" />
            </svg>
        ),
    },
    {
        id: 2,
        alt: "The Striker",
        theme: "from-red-500 to-orange-500",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="18" cy="18" r="18" fill="#7f1d1d" />
                <path d="M10 14L18 22L26 14" stroke="#f87171" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="18" cy="10" r="2" fill="#f87171" />
            </svg>
        ),
    },
    {
        id: 3,
        alt: "The Sage",
        theme: "from-purple-500 to-pink-500",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="18" cy="18" r="18" fill="#4c1d95" />
                <circle cx="18" cy="18" r="8" fill="#c084fc" />
                <path d="M18 14V22M14 18H22" stroke="#4c1d95" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 4,
        alt: "The Phantom",
        theme: "from-slate-700 to-slate-900",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="18" cy="18" r="18" fill="#0f172a" />
                <rect x="12" y="16" width="12" height="4" rx="2" fill="#94a3b8" />
                <circle cx="18" cy="12" r="2" fill="#94a3b8" />
            </svg>
        ),
    },
    {
        id: 5,
        alt: "The Spark",
        theme: "from-yellow-400 to-amber-500",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="18" cy="18" r="18" fill="#78350f" />
                <path d="M18 8L22 18H14L18 28" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        id: 6,
        alt: "The Sentinel",
        theme: "from-emerald-400 to-teal-500",
        svg: (
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
                <circle cx="18" cy="18" r="18" fill="#064e3b" />
                <rect x="12" y="12" width="12" height="12" rx="3" fill="#34d399" />
                <circle cx="15" cy="15" r="1.5" fill="#064e3b" />
                <circle cx="21" cy="15" r="1.5" fill="#064e3b" />
                <rect x="15" y="19" width="6" height="2" rx="1" fill="#064e3b" />
            </svg>
        ),
    },
];

const mainAvatarVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
    exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
};

const pickerVariants = {
    container: { initial: { opacity: 0 }, animate: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } },
    item: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 300, damping: 20 } } },
};

const selectedVariants = {
    initial: { opacity: 0, rotate: -180, scale: 0.8 },
    animate: { opacity: 1, rotate: 0, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 15 } },
    exit: { opacity: 0, rotate: 180, transition: { duration: 0.2 } },
};

export function AvatarPicker() {
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(avatars[0]);
    const [rotationCount, setRotationCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem("zenith_avatar_id");
        if (saved) {
            const found = avatars.find(a => a.id === parseInt(saved));
            if (found) setSelectedAvatar(found);
        }
    }, []);

    const handleAvatarSelect = (avatar: Avatar) => {
        setRotationCount((prev) => prev + 1080);
        setSelectedAvatar(avatar);
        localStorage.setItem("zenith_avatar_id", avatar.id.toString());
    };

    if (!mounted) return null; // Hydration mismatch önlemi

    return (
        <motion.div initial="initial" animate="animate" className="w-full">
            <div className="w-full max-w-md mx-auto overflow-hidden">
                {/* Dinamik Arka Plan */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "8rem", transition: { height: { type: "spring", stiffness: 100, damping: 20 } } }}
                    className={cn("w-full bg-gradient-to-r opacity-20 rounded-t-3xl transition-colors duration-500", selectedAvatar.theme)}
                />

                <div className="px-4 pb-8 -mt-16">
                    {/* Ana Avatar Ekranı */}
                    <motion.div
                        className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background bg-slate-900 flex items-center justify-center shadow-xl"
                        variants={mainAvatarVariants}
                        layoutId="selectedAvatar"
                    >
                        <motion.div
                            className="w-full h-full flex items-center justify-center scale-[2.5]"
                            animate={{ rotate: rotationCount }}
                            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        >
                            {selectedAvatar.svg}
                        </motion.div>
                    </motion.div>

                    <motion.div className="text-center mt-4" variants={pickerVariants.item}>
                        <motion.p className="text-muted-foreground text-sm mt-1">Görünümünü Seç</motion.p>
                    </motion.div>

                    {/* Avatar Seçici (6'lı Grid/Wrap) */}
                    <motion.div className="mt-8" variants={pickerVariants.container}>
                        <motion.div className="flex justify-center gap-4 flex-wrap px-2" variants={pickerVariants.container}>
                            {avatars.map((avatar) => (
                                <motion.button
                                    key={avatar.id}
                                    onClick={() => handleAvatarSelect(avatar)}
                                    className={cn(
                                        "relative w-14 h-14 rounded-full overflow-hidden border-2 flex-shrink-0 bg-slate-900",
                                        "transition-all duration-300",
                                        selectedAvatar.id === avatar.id ? "border-primary" : "border-transparent"
                                    )}
                                    variants={pickerVariants.item}
                                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                    whileTap={{ y: 0, scale: 0.9 }}
                                >
                                    <div className="w-full h-full flex items-center justify-center scale-110">
                                        {avatar.svg}
                                    </div>
                                    {selectedAvatar.id === avatar.id && (
                                        <motion.div
                                            className="absolute inset-0 bg-primary/20 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-full"
                                            variants={selectedVariants}
                                            initial="initial"
                                            animate="animate"
                                            exit="exit"
                                            layoutId="selectedIndicator"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
