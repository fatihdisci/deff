
import { useState, useEffect } from "react"

export type NotificationType = "info" | "success" | "warning" | "error"

export interface Notification {
    id: string
    title: string
    message: string
    date: string // ISO string
    read: boolean
    type: NotificationType
}

const STORAGE_KEY = "zenith-notifications"

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)

    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                setNotifications(JSON.parse(stored))
            } catch (e) {
                console.error("Failed to parse notifications", e)
            }
        } else {
            // Add a welcome notification if empty
            const welcome: Notification = {
                id: crypto.randomUUID(),
                title: "Zenith'e Hoş Geldin",
                message: "Günlük hedeflerini takip etmeye başla ve serini oluştur!",
                date: new Date().toISOString(),
                read: false,
                type: "info",
            }
            setNotifications([welcome])
            localStorage.setItem(STORAGE_KEY, JSON.stringify([welcome]))
        }
    }, [])

    // Persist to local storage whenever notifications change
    useEffect(() => {
        if (notifications.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
        }
    }, [notifications])

    const unreadCount = notifications.filter((n) => !n.read).length

    const addNotification = (
        title: string,
        message: string,
        type: NotificationType = "info"
    ) => {
        const newNote: Notification = {
            id: crypto.randomUUID(),
            title,
            message,
            date: new Date().toISOString(),
            read: false,
            type,
        }
        setNotifications((prev) => [newNote, ...prev])
    }

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        )
    }

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    const clearAll = () => {
        setNotifications([])
        localStorage.removeItem(STORAGE_KEY)
    }

    const togglePanel = () => setIsOpen((prev) => !prev)
    const closePanel = () => setIsOpen(false)

    return {
        notifications,
        unreadCount,
        isOpen,
        togglePanel,
        closePanel,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
    }
}
