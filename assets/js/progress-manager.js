/**
 * ProgressManager - Günlük kullanıcı ilerlemesini ve puan hesaplamasını yönetir.
 * Bağımlılıklar: GoalManager (goals-manager.js)
 */
const ProgressManager = {
    STORAGE_KEY: 'defend100_progress',

    /**
     * Bugünün tarih anahtarını döndürür (YYYY-MM-DD formatında).
     */
    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Belirtilen tarih için ilerleme verilerini getirir.
     * @param {string} dateKey - YYYY-MM-DD (varsayılan: bugün)
     */
    getProgress(dateKey = this.getTodayKey()) {
        const allProgress = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
        return allProgress[dateKey] || {};
    },

    /**
     * Belirtilen kategori için değeri kaydeder.
     * @param {string} category - 'hydration', 'activity', vb.
     * @param {number} value - Girilen değer.
     * @param {string} dateKey - Tarih (varsayılan: bugün).
     */
    saveProgress(category, value, dateKey = this.getTodayKey()) {
        const allProgress = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');

        if (!allProgress[dateKey]) {
            allProgress[dateKey] = {};
        }

        allProgress[dateKey][category] = parseFloat(value);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(allProgress));
        return true;
    },

    /**
     * Anlık bütünlük puanını hesaplar (0-100).
     * Mantık: Ağırlıklı Tamamlanma Oranı.
     * Puan = (Sum(KategoriPuan * Ağırlık) / ToplamAğırlık) * 100
     */
    calculateDailyScore() {
        const goals = window.GoalManager ? window.GoalManager.getGoals() : {};
        const progress = this.getProgress();

        let totalActiveWeight = 0;
        let weightedScoreSum = 0;

        for (const [key, goal] of Object.entries(goals)) {
            // Sadece Aktif hedefleri hesaba kat
            if (!goal.isActive) continue;

            const weight = parseInt(goal.weight || 2);
            totalActiveWeight += weight;

            const currentVal = progress[key];

            // Eğer veri girilmemişse, bu hedef "Mükemmel" (100 puan) kabul edilir.
            // Puan = 100 ile başlar, hatalar/eksikler girildikçe düşer.
            if (currentVal === undefined || currentVal === null || isNaN(parseFloat(currentVal))) {
                weightedScoreSum += (1 * weight); // 1 = %100 başarı
                continue;
            }

            const val = parseFloat(currentVal);
            const target = parseFloat(goal.target || goal.limit);
            let completionRate = 0;

            if (key === 'screen_time' || key === 'calories') {
                // Kötü Hedefler (Az Daha İyi)
                // Limit aşılmadığı sürece %100 (1). 
                // Aşıldığında puan düşer.
                if (val <= target) {
                    completionRate = 1;
                } else {
                    // Lineer ceza: Limit kadar aşarsan puan 0 olur.
                    // Örn: Limit 100, Val 150 -> 0.5 puan. Val 200 -> 0 puan.
                    completionRate = Math.max(0, 1 - ((val - target) / target));
                }
            } else {
                // İyi Hedefler (Çok Daha İyi)
                // Hedef 0 ise (örn: adım hedefi girilmemiş) ve veri girildiyse? Target 0 olmamalı.
                if (target > 0) {
                    completionRate = Math.min(1, val / target);
                } else {
                    completionRate = 1; // Hedef yoksa tam puan varsay
                }
            }

            weightedScoreSum += (completionRate * weight);
        }

        if (totalActiveWeight === 0) return 100; // Hiç aktif hedef yoksa 100

        // 100 üzerinden normalize et ve tam sayıya yuvarla
        return Math.round((weightedScoreSum / totalActiveWeight) * 100);
    }
};

// Global erişim
window.ProgressManager = ProgressManager;
