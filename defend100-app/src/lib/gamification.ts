export interface RankInfo {
    level: number
    rank: string
    currentXp: number
    nextLevelXp: number
    progressPct: number
}

// Skala: Her seviye için gereken TOPLAM XP (0'dan başlayarak kümülatif)
// Örnek:
// L1: 0 - 499 (500XP lazım)
// L2: 500 - 1999 (1500XP lazım)
// L3: 2000 - 4999 (3000XP lazım)
// vb.
const XP_THRESHOLDS = [
    { level: 1, rank: "Acemi Savunmacı", minXp: 0 },
    { level: 2, rank: "Kalkan Taşıyıcı", minXp: 500 },
    { level: 3, rank: "Demir Nöbetçi", minXp: 2000 },
    { level: 4, rank: "Aura Muhafızı", minXp: 5000 },
    { level: 5, rank: "İrade Savaşçısı", minXp: 10000 },
    { level: 6, rank: "Disiplin Üstadı", minXp: 20000 },
    { level: 7, rank: "Yenilmez Ruh", minXp: 35000 },
    { level: 8, rank: "Zaman Bükücü", minXp: 55000 },
    { level: 9, rank: "Sonsuz Savunucu", minXp: 80000 },
    { level: 10, rank: "Efsanevi Koruyucu", minXp: 120000 },
]

export function calculateLevelAndRank(xp: number): RankInfo {
    const validXp = Math.max(0, xp)

    let currentTier = XP_THRESHOLDS[0]
    let nextTier = XP_THRESHOLDS[1]

    for (let i = 0; i < XP_THRESHOLDS.length; i++) {
        if (validXp >= XP_THRESHOLDS[i].minXp) {
            currentTier = XP_THRESHOLDS[i]
            nextTier = XP_THRESHOLDS[i + 1] // Can be undefined for max level
        } else {
            break
        }
    }

    // Если достигнут максимальный уровень
    if (!nextTier) {
        return {
            level: currentTier.level,
            rank: currentTier.rank,
            currentXp: validXp,
            nextLevelXp: validXp, // Gösterecek bir sonraki seviye yok
            progressPct: 100,
        }
    }

    // Doğrusal İlerleme Hesaplama (Bu seviyedeki ilerleme / Bu seviyede gereken toplam net XP)
    const xpInThisLevel = validXp - currentTier.minXp
    const requiredXpForNextLevel = nextTier.minXp - currentTier.minXp
    const progressPct = Math.min(100, Math.max(0, (xpInThisLevel / requiredXpForNextLevel) * 100))

    return {
        level: currentTier.level,
        rank: currentTier.rank,
        currentXp: validXp,
        nextLevelXp: nextTier.minXp,
        progressPct: progressPct,
    }
}
