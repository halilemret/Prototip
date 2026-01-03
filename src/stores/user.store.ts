// ============================================
// ONYX - User Store (Zustand)
// ============================================

import { create } from 'zustand';
import { MoodLevel, MoodEntry } from '@/types';
import { StorageService, storage } from '@/services/storage.service';
import { FREE_DAILY_BREAKDOWNS } from '@/constants/app';
import { ThemeType } from '@/constants/theme';

interface UserState {
    // State
    hasOnboarded: boolean;
    currentMood: MoodLevel;
    dailyBreakdownsUsed: number;
    dailyBreakdownLimit: number;
    hapticsEnabled: boolean;
    isHydrated: boolean;

    // Gamification
    xp: number;
    level: number;
    streak: number;
    lastActivityDate: string | null;
    language: 'en' | 'tr';
    theme: ThemeType;

    // Actions
    hydrate: () => void;
    setMood: (mood: MoodLevel) => void;
    completeOnboarding: () => void;
    incrementBreakdownCount: () => number;
    resetDailyCount: () => void;
    canUseBreakdown: () => boolean;
    getRemainingBreakdowns: () => number;
    setHapticsEnabled: (enabled: boolean) => void;
    setLanguage: (lang: 'en' | 'tr') => void;
    setTheme: (theme: ThemeType) => void;

    // Gamification Actions
    addXp: (amount: number) => void;
    updateStreak: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
    // Initial state
    hasOnboarded: false,
    currentMood: 3,
    dailyBreakdownsUsed: 0,
    dailyBreakdownLimit: FREE_DAILY_BREAKDOWNS,
    hapticsEnabled: true,
    isHydrated: false,
    language: 'en',
    theme: 'dark',

    // Hydrate state from storage
    hydrate: () => {
        const hasOnboarded = StorageService.getHasOnboarded();
        const currentMood = StorageService.getCurrentMood();
        const dailyBreakdownsUsed = StorageService.getDailyBreakdownCount();
        const hapticsEnabled = StorageService.getHapticsEnabled();
        const language = StorageService.getLanguage();
        const theme = (storage.getString('onyx:theme') as ThemeType) || 'dark';

        // Gamification
        const xp = StorageService.getXp();
        const level = StorageService.getLevel();
        const streak = StorageService.getStreak();
        const lastActivityDate = StorageService.getLastActivityDate();

        set({
            hasOnboarded,
            currentMood,
            dailyBreakdownsUsed,
            hapticsEnabled,
            theme,
            xp,
            level,
            streak,
            lastActivityDate,
            isHydrated: true,
        });
    },

    // Set current mood
    setMood: (mood: MoodLevel) => {
        StorageService.setCurrentMood(mood);
        set({ currentMood: mood });
    },

    // Mark onboarding as complete
    completeOnboarding: () => {
        StorageService.setHasOnboarded(true);
        set({ hasOnboarded: true });
    },

    // Increment daily breakdown counter
    incrementBreakdownCount: () => {
        const newCount = StorageService.incrementDailyBreakdownCount();
        set({ dailyBreakdownsUsed: newCount });
        return newCount;
    },

    // Reset daily counter (called at new day or by premium users)
    resetDailyCount: () => {
        StorageService.resetDailyBreakdownCount();
        set({ dailyBreakdownsUsed: 0 });
    },

    // Check if user can use another breakdown
    canUseBreakdown: () => {
        const { dailyBreakdownsUsed, dailyBreakdownLimit } = get();
        return dailyBreakdownsUsed < dailyBreakdownLimit;
    },

    // Get remaining breakdowns for today
    getRemainingBreakdowns: () => {
        const { dailyBreakdownsUsed, dailyBreakdownLimit } = get();
        return Math.max(0, dailyBreakdownLimit - dailyBreakdownsUsed);
    },

    // Toggle haptics
    setHapticsEnabled: (enabled: boolean) => {
        StorageService.setHapticsEnabled(enabled);
        set({ hapticsEnabled: enabled });
    },

    // Set language
    setLanguage: (lang: 'en' | 'tr') => {
        StorageService.setLanguage(lang);
        set({ language: lang });
    },

    // Set theme
    setTheme: (theme: ThemeType) => {
        storage.set('onyx:theme', theme);
        set({ theme });
    },

    // Gamification
    xp: 0,
    level: 1,
    streak: 0,
    lastActivityDate: null,

    addXp: (amount: number) => {
        const { xp, level } = get();
        const newXp = xp + amount;

        // Level calculation: Level N requires 100 * N^2 XP
        const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

        if (newLevel > level) {
            // Level Up! (Ideally trigger a modal or animation)
            console.log(`🎉 Level Up! ${level} -> ${newLevel}`);
        }

        set({ xp: newXp, level: newLevel });
        StorageService.setXp(newXp);
        StorageService.setLevel(newLevel);
    },

    updateStreak: () => {
        const { lastActivityDate, streak } = get();
        const now = new Date();
        const today = now.toDateString();

        if (lastActivityDate === today) return; // Already updated today

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        let newStreak = streak;

        if (lastActivityDate === yesterday.toDateString()) {
            newStreak += 1;
        } else if (lastActivityDate && lastActivityDate !== today) {
            newStreak = 1; // Streak broken
        } else if (!lastActivityDate) {
            newStreak = 1; // First day
        }

        set({ streak: newStreak, lastActivityDate: today });
        StorageService.setStreak(newStreak);
        StorageService.setLastActivityDate(today);
    },
}));

export default useUserStore;
