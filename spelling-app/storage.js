// Storage module for Spelling Practice App
// Handles all localStorage operations

const STORAGE_KEYS = {
    WORD_STATS: 'spelling_word_stats',
    SETTINGS: 'spelling_settings',
    SESSIONS: 'spelling_sessions'
};

// Default settings
const DEFAULT_SETTINGS = {
    enabledLists: ['basic', 'common', 'misspelt'],
    struggleThreshold: 10000, // 10 seconds in milliseconds
};

// Storage helper functions
const Storage = {
    // Get settings from storage
    getSettings() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Error reading settings:', e);
        }
        return { ...DEFAULT_SETTINGS };
    },

    // Save settings to storage
    saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.error('Error saving settings:', e);
        }
    },

    // Get all word statistics
    getWordStats() {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.WORD_STATS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error reading word stats:', e);
        }
        return {};
    },

    // Get stats for a specific word
    getWordStat(word) {
        const stats = this.getWordStats();
        return stats[word.toLowerCase()] || null;
    },

    // Update stats for a word after an attempt
    recordAttempt(word, correct, timeMs) {
        const stats = this.getWordStats();
        const wordLower = word.toLowerCase();
        const settings = this.getSettings();

        if (!stats[wordLower]) {
            stats[wordLower] = {
                attempts: 0,
                correct: 0,
                totalTime: 0,
                struggled: false
            };
        }

        const wordStat = stats[wordLower];
        wordStat.attempts++;
        if (correct) {
            wordStat.correct++;
        }
        wordStat.totalTime += timeMs;
        wordStat.avgTime = Math.round(wordStat.totalTime / wordStat.attempts);
        wordStat.lastAttemptTime = timeMs;
        wordStat.lastAttemptDate = new Date().toISOString();

        // Mark as struggled if correct but took too long
        if (correct && timeMs > settings.struggleThreshold) {
            wordStat.struggled = true;
        }
        // Clear struggled flag if answered quickly and correctly
        if (correct && timeMs <= settings.struggleThreshold) {
            wordStat.struggled = false;
        }
        // Always mark as struggled if incorrect
        if (!correct) {
            wordStat.struggled = true;
        }

        try {
            localStorage.setItem(STORAGE_KEYS.WORD_STATS, JSON.stringify(stats));
        } catch (e) {
            console.error('Error saving word stats:', e);
        }

        return wordStat;
    },

    // Get words that the user has struggled with
    getStruggledWords(wordPool) {
        const stats = this.getWordStats();
        return wordPool.filter(item => {
            const wordStat = stats[item.word.toLowerCase()];
            return wordStat && wordStat.struggled;
        });
    },

    // Get words that were answered incorrectly
    getIncorrectWords(wordPool) {
        const stats = this.getWordStats();
        return wordPool.filter(item => {
            const wordStat = stats[item.word.toLowerCase()];
            return wordStat && wordStat.correct < wordStat.attempts;
        });
    },

    // Get overall statistics
    getOverallStats() {
        const stats = this.getWordStats();
        const words = Object.values(stats);

        if (words.length === 0) {
            return {
                totalPracticed: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                overallAccuracy: 0,
                struggledCount: 0
            };
        }

        const totalAttempts = words.reduce((sum, w) => sum + w.attempts, 0);
        const totalCorrect = words.reduce((sum, w) => sum + w.correct, 0);
        const struggledCount = words.filter(w => w.struggled).length;

        return {
            totalPracticed: words.length,
            totalAttempts,
            totalCorrect,
            overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0,
            struggledCount
        };
    },

    // Reset all statistics
    resetStats() {
        try {
            localStorage.removeItem(STORAGE_KEYS.WORD_STATS);
            localStorage.removeItem(STORAGE_KEYS.SESSIONS);
        } catch (e) {
            console.error('Error resetting stats:', e);
        }
    },

    // Save a completed session
    saveSession(sessionData) {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
            const sessions = stored ? JSON.parse(stored) : [];
            sessions.push({
                ...sessionData,
                date: new Date().toISOString()
            });
            // Keep only last 50 sessions
            if (sessions.length > 50) {
                sessions.splice(0, sessions.length - 50);
            }
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
        } catch (e) {
            console.error('Error saving session:', e);
        }
    }
};
