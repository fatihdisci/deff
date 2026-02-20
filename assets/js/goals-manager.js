/**
 * GoalManager - Handles persistence and retrieval of user goals.
 */
const GoalManager = {
    STORAGE_KEY: 'defend100_goals',

    DEFAULTS: {
        hydration: { weight: 2, target: 2500, unit: 'ml', isActive: true },
        activity: { weight: 3, target: 10000, unit: 'steps', isActive: true },
        recovery: { weight: 2, target: 8, unit: 'hours', isActive: true },
        tasks: { weight: 1, target: 5, unit: 'items', isActive: true },
        screen_time: { weight: 2, limit: 3.5, unit: 'hours', isActive: true },
        calories: { weight: 2, target: 2200, unit: 'kcal', isActive: true }
    },

    /**
     * Retrieves goals from localStorage, merging with defaults.
     * @returns {Object} The goals configuration object.
     */
    getGoals() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            return { ...this.DEFAULTS };
        }
        try {
            const parsed = JSON.parse(stored);
            // Merge defaults deeply to ensure new keys like 'isActive' appear in old data
            const merged = { ...this.DEFAULTS };
            for (const key in merged) {
                if (parsed[key]) {
                    merged[key] = { ...merged[key], ...parsed[key] };
                }
            }
            return merged;
        } catch (e) {
            console.error('Failed to parse goals from localStorage:', e);
            return { ...this.DEFAULTS };
        }
    },

    /**
     * Saves the goals configuration to localStorage.
     * @param {Object} goals - The goals object to save.
     */
    saveGoals(goals) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
            return true;
        } catch (e) {
            console.error('Failed to save goals to localStorage:', e);
            return false;
        }
    }
};

// Expose to window for global access
window.GoalManager = GoalManager;
