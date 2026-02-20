"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Bell, Minus, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { ScoreRing } from "@/components/score-ring"
import { PageTransition } from "@/components/page-transition"
import { LogoIcon } from "@/components/icons"
import { useGoals, type GoalKey } from "@/hooks/use-goals"
import { useProgress } from "@/hooks/use-progress"
import { useNotifications } from "@/hooks/use-notifications"
import { NotificationPanel } from "@/components/notification-panel"
import { TierCelebration, getTier } from "@/components/tier-celebration"
import { cn } from "@/lib/utils"

/* ── Metric card metadata ── */
const METRIC_META: Record<
  GoalKey,
  { label: string; icon: string; gradient: string; iconBg: string; step: number; unit: string }
> = {
  hydration: {
    label: "Su",
    icon: "💧",
    gradient: "from-blue-500/10 to-blue-600/5",
    iconBg: "bg-blue-500/10 text-blue-400",
    step: 100,
    unit: "ml",
  },
  activity: {
    label: "Hareket",
    icon: "👟",
    gradient: "from-emerald-500/10 to-emerald-600/5",
    iconBg: "bg-emerald-500/10 text-emerald-400",
    step: 500,
    unit: "adım",
  },
  recovery: {
    label: "Dinlenme",
    icon: "😴",
    gradient: "from-indigo-500/10 to-indigo-600/5",
    iconBg: "bg-indigo-500/10 text-indigo-400",
    step: 0.5,
    unit: "saat",
  },
  tasks: {
    label: "Görevler",
    icon: "✅",
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-500/10 text-amber-400",
    step: 1,
    unit: "adet",
  },
  screen_time: {
    label: "Ekran Süresi",
    icon: "📱",
    gradient: "from-purple-500/10 to-purple-600/5",
    iconBg: "bg-purple-500/10 text-purple-400",
    step: 0.5,
    unit: "saat",
  },
  calories: {
    label: "Kalori",
    icon: "🍽️",
    gradient: "from-rose-500/10 to-rose-600/5",
    iconBg: "bg-rose-500/10 text-rose-400",
    step: 100,
    unit: "kcal",
  },
}

/* ── Hold-to-repeat with acceleration ── */
function useHoldRepeat(
  action: () => void,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    timerRef.current = null
    intervalRef.current = null
  }

  const start = () => {
    action() // fire once immediately
    let delay = 300 // initial repeat speed (ms)
    const tick = () => {
      action()
      delay = Math.max(50, delay * 0.85) // accelerate, min 50ms
      timerRef.current = setTimeout(tick, delay)
    }
    timerRef.current = setTimeout(tick, 400) // first hold delay
  }

  // Clean up on unmount
  useEffect(() => stop, [])

  return { onPointerDown: start, onPointerUp: stop, onPointerLeave: stop }
}

/* ── Metric Card ── */
function MetricCard({
  label,
  icon,
  iconBg,
  currentValue,
  hasData,
  targetDisplay,
  step,
  isLessIsBetter,
  onValueChange,
}: {
  label: string
  icon: string
  iconBg: string
  currentValue: number
  hasData: boolean
  targetDisplay: string
  step: number
  isLessIsBetter: boolean
  onValueChange: (val: number) => void
}) {
  const target = parseFloat(targetDisplay.replace(/[^0-9.]/g, ""))
  const pct = hasData && target > 0 ? Math.min(100, (currentValue / target) * 100) : 0
  const isOver = hasData && isLessIsBetter && currentValue > target

  // Keep latest value in ref so hold-repeat always uses fresh value
  const valRef = useRef(currentValue)
  valRef.current = currentValue

  const incHold = useHoldRepeat(() => onValueChange(valRef.current + step))
  const decHold = useHoldRepeat(() => onValueChange(Math.max(0, valRef.current - step)))

  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-4",
        isOver && "ring-1 ring-destructive/30"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-xl", iconBg)}>
            {icon}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-base">
              <span className="font-bold">{hasData ? currentValue : "—"}</span>
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / {targetDisplay}
              </span>
            </p>
          </div>
        </div>

        {/* +/- Buttons with hold-to-repeat */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.85 }}
            disabled={!hasData && currentValue === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground transition-colors hover:bg-muted active:bg-muted/80 disabled:opacity-30 select-none touch-none"
            {...decHold}
          >
            <Minus className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:bg-primary/30 select-none touch-none"
            {...incHold}
          >
            <Plus className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isOver ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

/* ── Dashboard Page ── */
export default function DashboardPage() {
  const { goals, activeGoals } = useGoals()
  const { progress, saveValue, calculateScore } = useProgress(goals)
  const score = calculateScore()

  // Scroll visibility for ScoreRing
  const scoreRef = useRef<HTMLElement>(null)
  const [scoreVisible, setScoreVisible] = useState(true)
  const [scorePulseKey, setScorePulseKey] = useState(0)
  const prevScoreRef = useRef(score)

  useEffect(() => {
    const el = scoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setScoreVisible(entry.isIntersecting),
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Pulse badge when score changes
  useEffect(() => {
    if (score !== prevScoreRef.current) {
      setScorePulseKey((k) => k + 1)
      prevScoreRef.current = score
    }
  }, [score])

  // Tier transition detection
  const [tierEvent, setTierEvent] = useState<"up" | "down" | "perfect" | null>(null)
  const prevTierRef = useRef(getTier(score))

  useEffect(() => {
    const currentTier = getTier(score)
    const prevTier = prevTierRef.current

    if (score === 100) {
      setTierEvent("perfect")
    } else if (currentTier > prevTier) {
      setTierEvent("up")
    } else if (currentTier < prevTier) {
      setTierEvent("down")
    }
    prevTierRef.current = currentTier
  }, [score])

  const clearTierEvent = useCallback(() => setTierEvent(null), [])

  const {
    notifications,
    unreadCount,
    isOpen: isNotificationOpen,
    togglePanel,
    closePanel,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotifications()

  const getTargetDisplay = (key: GoalKey): string => {
    const goal = goals[key]
    const val = goal.target ?? goal.limit ?? 0
    return `${val} ${METRIC_META[key].unit}`
  }

  const isLessIsBetter = (key: GoalKey) =>
    key === "screen_time" || key === "calories"

  return (
    <div className="flex min-h-screen flex-col">
      {/* Tier transition celebration */}
      <TierCelebration event={tierEvent} onComplete={clearTierEvent} />

      {/* Floating notification bell */}
      <div className="fixed top-6 right-6 z-50">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={togglePanel}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="relative rounded-full bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20 outline-none"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          )}
        </motion.button>
      </div>

      {/* Dynamic Island — appears when ScoreRing scrolls away */}
      {!scoreVisible && (
        <motion.div
          initial={{ opacity: 0, width: 40, borderRadius: 20 }}
          animate={{ opacity: 1, width: 180, borderRadius: 24 }}
          exit={{ opacity: 0, width: 40 }}
          transition={{ type: "spring" as const, stiffness: 300, damping: 25 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 overflow-hidden"
        >
          <motion.div
            key={scorePulseKey}
            animate={{
              boxShadow: [
                "0 0 0px 0px rgba(234,179,8,0)",
                `0 0 20px 4px ${score >= 90 ? "rgba(234,179,8,0.3)" : score >= 70 ? "rgba(16,185,129,0.3)" : score >= 40 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)"}`,
                "0 0 0px 0px rgba(234,179,8,0)",
              ],
            }}
            transition={{ duration: 0.6 }}
            className="flex h-11 items-center justify-between rounded-3xl bg-black/90 backdrop-blur-xl border border-white/10 px-5 shadow-2xl"
          >
            <div className="flex items-center gap-2">
              <motion.div
                key={`dot-${scorePulseKey}`}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 0.3 }}
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: score >= 90 ? '#EAB308' : score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444' }}
              />
              <span className="text-[11px] font-medium text-white/50">Skor</span>
            </div>
            <motion.span
              key={`num-${scorePulseKey}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="text-base font-bold tabular-nums text-white"
            >
              {score}
            </motion.span>
          </motion.div>
        </motion.div>
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        notifications={notifications}
        onClose={closePanel}
        onMarkRead={markAsRead}
        onMarkAllRead={markAllAsRead}
      />

      {/* Main Content */}
      <PageTransition>
        <main className="flex-1 overflow-y-auto px-6 pt-16 pb-28 max-w-md mx-auto w-full">
          {/* Score Section */}
          <section ref={scoreRef} className="flex flex-col items-center justify-center py-6 text-center space-y-4">
            <ScoreRing score={score} size={256} />
            <p className="mt-8 text-sm italic text-muted-foreground/70 max-w-[280px] leading-relaxed">
              &ldquo;Zaten mükemmelsin. Sadece onu kaybetmemeye çalış.&rdquo;
            </p>
          </section>

          {/* Metrics — staggered entrance */}
          <section className="space-y-4">
            <h3 className="px-1 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Savunma Metrikleri
            </h3>
            {activeGoals.map(([key], i) => {
              const meta = METRIC_META[key]
              const currentVal = progress[key]
              const hasData = currentVal !== undefined && currentVal !== null
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                >
                  <MetricCard
                    label={meta.label}
                    icon={meta.icon}
                    iconBg={meta.iconBg}
                    currentValue={hasData ? currentVal : 0}
                    hasData={hasData}
                    targetDisplay={getTargetDisplay(key)}
                    step={meta.step}
                    isLessIsBetter={isLessIsBetter(key)}
                    onValueChange={(val) => saveValue(key, val)}
                  />
                </motion.div>
              )
            })}
          </section>
        </main>
      </PageTransition>
    </div>
  )
}
