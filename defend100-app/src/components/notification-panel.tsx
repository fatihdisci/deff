"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCheck, Info, CheckCircle, AlertTriangle, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { tr } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { type Notification, type NotificationType } from "@/hooks/use-notifications"

interface NotificationPanelProps {
    isOpen: boolean
    notifications: Notification[]
    onClose: () => void
    onMarkRead: (id: string) => void
    onMarkAllRead: () => void
}

const icons: Record<NotificationType, React.ReactNode> = {
    info: <Info className="h-4 w-4 text-blue-400" />,
    success: <CheckCircle className="h-4 w-4 text-emerald-400" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    error: <AlertCircle className="h-4 w-4 text-rose-400" />,
}

export function NotificationPanel({
    isOpen,
    notifications,
    onClose,
    onMarkRead,
    onMarkAllRead,
}: NotificationPanelProps) {
    const unreadCount = notifications.filter((n) => !n.read).length

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    />

                    {/* Centered Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed inset-x-4 top-[15vh] z-50 mx-auto max-w-sm overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5">
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-base font-bold text-foreground">Bildirimler</h3>
                                {notifications.length > 0 && (
                                    <span className={cn(
                                        "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold",
                                        unreadCount > 0
                                            ? "bg-primary/15 text-primary"
                                            : "bg-muted text-muted-foreground"
                                    )}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {notifications.length > 0 && (
                                    <button
                                        onClick={onMarkAllRead}
                                        title="Tümünü okundu işaretle"
                                        disabled={unreadCount === 0}
                                        className={cn(
                                            "rounded-xl p-2 transition-colors",
                                            unreadCount > 0
                                                ? "text-muted-foreground hover:bg-accent hover:text-primary"
                                                : "text-muted-foreground/30 cursor-default"
                                        )}
                                    >
                                        <CheckCheck className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="mx-5 h-px bg-border/50" />

                        {/* List */}
                        <div className="max-h-[50vh] overflow-y-auto p-3">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 text-center text-muted-foreground">
                                    <div className="mb-3 rounded-full bg-muted p-3.5">
                                        <Info className="h-6 w-6 opacity-40" />
                                    </div>
                                    <p className="text-sm font-medium">Yeni bildirim yok</p>
                                    <p className="mt-1 text-xs text-muted-foreground/60">Bildirimler burada görünecek</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    {notifications.map((note) => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => onMarkRead(note.id)}
                                            className={cn(
                                                "group relative cursor-pointer rounded-2xl border border-transparent p-3.5 transition-all hover:bg-accent/50",
                                                !note.read ? "bg-accent/40 border-primary/15" : "opacity-50"
                                            )}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-0.5 shrink-0">{icons[note.type]}</div>
                                                <div className="flex-1 space-y-1">
                                                    <p className={cn("text-sm font-semibold leading-tight", !note.read ? "text-foreground" : "text-muted-foreground")}>
                                                        {note.title}
                                                    </p>
                                                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">{note.message}</p>
                                                    <p className="text-[10px] text-muted-foreground/50">
                                                        {formatDistanceToNow(new Date(note.date), { addSuffix: true, locale: tr })}
                                                    </p>
                                                </div>
                                                {!note.read && (
                                                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
