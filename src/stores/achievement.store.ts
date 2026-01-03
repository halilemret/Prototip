// ============================================
// ONYX - Achievement Store (Zustand)
// Museum of Done - Gamification Layer
// ============================================

import { create } from 'zustand';
import { storage } from '@/services/storage.service';

export interface Achievement {
    id: string;
    name: string;
    nameTr: string;
    description: string;
    descriptionTr: string;
    icon: string;
    target: number;
    category: 'streak' | 'task' | 'special';
}

export interface UnlockedAchievement extends Achievement {
    unlockedAt: number;
    progress: number;
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
    // Streak-based
    {
        id: 'streak_3',
        name: '3-Day Streak',
        nameTr: '3 Günlük Seri',
        description: 'Complete tasks 3 days in a row',
        descriptionTr: '3 gün üst üste görev tamamla',
        icon: 'Flame',
        target: 3,
        category: 'streak',
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        nameTr: 'Hafta Savaşçısı',
        description: 'Maintain a 7-day streak',
        descriptionTr: '7 günlük seri yap',
        icon: 'Trophy',
        target: 7,
        category: 'streak',
    },
    {
        id: 'streak_30',
        name: 'Monthly Master',
        nameTr: 'Aylık Usta',
        description: 'Keep going for 30 days straight!',
        descriptionTr: '30 gün boyunca devam et!',
        icon: 'Crown',
        target: 30,
        category: 'streak',
    },

    // Task-based
    {
        id: 'first_task',
        name: 'First Step',
        nameTr: 'İlk Adım',
        description: 'Complete your first task',
        descriptionTr: 'İlk görevini tamamla',
        icon: 'Footprints',
        target: 1,
        category: 'task',
    },
    {
        id: 'tasks_10',
        name: 'Getting Started',
        nameTr: 'Başlangıç',
        description: 'Complete 10 tasks',
        descriptionTr: '10 görev tamamla',
        icon: 'ListChecks',
        target: 10,
        category: 'task',
    },
    {
        id: 'tasks_25',
        name: 'On a Roll',
        nameTr: 'Hız Kesme',
        description: 'Complete 25 tasks',
        descriptionTr: '25 görev tamamla',
        icon: 'Rocket',
        target: 25,
        category: 'task',
    },
    {
        id: 'tasks_50',
        name: 'Productivity Pro',
        nameTr: 'Verimlilik Uzmanı',
        description: 'Complete 50 tasks',
        descriptionTr: '50 görev tamamla',
        icon: 'Sparkles',
        target: 50,
        category: 'task',
    },
    {
        id: 'tasks_100',
        name: 'Centurion',
        nameTr: 'Yüzbaşı',
        description: 'Complete 100 tasks',
        descriptionTr: '100 görev tamamla',
        icon: 'Award',
        target: 100,
        category: 'task',
    },

    // Special
    {
        id: 'candy_lover',
        name: 'Candy Lover',
        nameTr: 'Şeker Sever',
        description: 'Use "Easy Win" 10 times',
        descriptionTr: '"Kolay Kazan"ı 10 kez kullan',
        icon: 'Candy',
        target: 10,
        category: 'special',
    },
    {
        id: 'bet_master',
        name: 'High Roller',
        nameTr: 'Yüksek Bahisçi',
        description: 'Win 5 time bets',
        descriptionTr: '5 zaman bahsi kazan',
        icon: 'Timer',
        target: 5,
        category: 'special',
    },
    {
        id: 'forgiveness',
        name: 'Self-Compassion',
        nameTr: 'Kendine Şefkat',
        description: 'Use the Forgiveness Protocol',
        descriptionTr: 'Affetme Protokolünü kullan',
        icon: 'Heart',
        target: 1,
        category: 'special',
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        nameTr: 'Gece Kuşu',
        description: 'Complete a task after midnight',
        descriptionTr: 'Gece yarısından sonra görev tamamla',
        icon: 'Moon',
        target: 1,
        category: 'special',
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        nameTr: 'Erken Kalkan',
        description: 'Complete a task before 7 AM',
        descriptionTr: 'Sabah 7\'den önce görev tamamla',
        icon: 'Sun',
        target: 1,
        category: 'special',
    },
];

interface AchievementState {
    // State
    unlockedAchievements: UnlockedAchievement[];
    isHydrated: boolean;

    // Progress counters
    totalTasksCompleted: number;
    candyUsageCount: number;
    betsWonCount: number;

    // Recently unlocked (for showing modal)
    recentlyUnlocked: UnlockedAchievement | null;

    // Actions
    hydrate: () => void;
    checkAndUnlock: (type: 'task' | 'streak' | 'candy' | 'bet_won' | 'forgiveness' | 'time_based', value?: number) => void;
    clearRecentlyUnlocked: () => void;
    getProgress: (achievementId: string) => number;
}

const STORAGE_KEY = 'onyx:achievements';
const PROGRESS_KEY = 'onyx:achievement_progress';

export const useAchievementStore = create<AchievementState>((set, get) => ({
    unlockedAchievements: [],
    isHydrated: false,
    totalTasksCompleted: 0,
    candyUsageCount: 0,
    betsWonCount: 0,
    recentlyUnlocked: null,

    hydrate: () => {
        try {
            const achievementsJson = storage.getString(STORAGE_KEY);
            const progressJson = storage.getString(PROGRESS_KEY);

            const unlockedAchievements = achievementsJson
                ? JSON.parse(achievementsJson)
                : [];

            const progress = progressJson
                ? JSON.parse(progressJson)
                : { totalTasksCompleted: 0, candyUsageCount: 0, betsWonCount: 0 };

            set({
                unlockedAchievements,
                totalTasksCompleted: progress.totalTasksCompleted || 0,
                candyUsageCount: progress.candyUsageCount || 0,
                betsWonCount: progress.betsWonCount || 0,
                isHydrated: true,
            });
        } catch (error) {
            console.warn('[AchievementStore] Hydrate failed:', error);
            set({ isHydrated: true });
        }
    },

    checkAndUnlock: (type, value = 1) => {
        const { unlockedAchievements, totalTasksCompleted, candyUsageCount, betsWonCount } = get();

        let newTaskCount = totalTasksCompleted;
        let newCandyCount = candyUsageCount;
        let newBetsWon = betsWonCount;
        let achievementToUnlock: Achievement | null = null;

        // Update counters based on type
        switch (type) {
            case 'task':
                newTaskCount = totalTasksCompleted + 1;

                // Check task-based achievements
                const taskAchievements = ACHIEVEMENTS.filter(a =>
                    a.category === 'task' &&
                    !unlockedAchievements.some(u => u.id === a.id) &&
                    newTaskCount >= a.target
                );
                if (taskAchievements.length > 0) {
                    achievementToUnlock = taskAchievements[0];
                }
                break;

            case 'streak':
                // value is the current streak
                const streakAchievements = ACHIEVEMENTS.filter(a =>
                    a.category === 'streak' &&
                    !unlockedAchievements.some(u => u.id === a.id) &&
                    value >= a.target
                );
                if (streakAchievements.length > 0) {
                    achievementToUnlock = streakAchievements[0];
                }
                break;

            case 'candy':
                newCandyCount = candyUsageCount + 1;
                const candyAchievement = ACHIEVEMENTS.find(a =>
                    a.id === 'candy_lover' &&
                    !unlockedAchievements.some(u => u.id === a.id) &&
                    newCandyCount >= a.target
                );
                if (candyAchievement) {
                    achievementToUnlock = candyAchievement;
                }
                break;

            case 'bet_won':
                newBetsWon = betsWonCount + 1;
                const betAchievement = ACHIEVEMENTS.find(a =>
                    a.id === 'bet_master' &&
                    !unlockedAchievements.some(u => u.id === a.id) &&
                    newBetsWon >= a.target
                );
                if (betAchievement) {
                    achievementToUnlock = betAchievement;
                }
                break;

            case 'forgiveness':
                const forgivenessAchievement = ACHIEVEMENTS.find(a =>
                    a.id === 'forgiveness' &&
                    !unlockedAchievements.some(u => u.id === a.id)
                );
                if (forgivenessAchievement) {
                    achievementToUnlock = forgivenessAchievement;
                }
                break;

            case 'time_based':
                const hour = new Date().getHours();

                // Night Owl (after midnight, before 5 AM)
                if (hour >= 0 && hour < 5) {
                    const nightOwl = ACHIEVEMENTS.find(a =>
                        a.id === 'night_owl' &&
                        !unlockedAchievements.some(u => u.id === a.id)
                    );
                    if (nightOwl) achievementToUnlock = nightOwl;
                }

                // Early Bird (5 AM - 7 AM)
                if (hour >= 5 && hour < 7) {
                    const earlyBird = ACHIEVEMENTS.find(a =>
                        a.id === 'early_bird' &&
                        !unlockedAchievements.some(u => u.id === a.id)
                    );
                    if (earlyBird) achievementToUnlock = earlyBird;
                }
                break;
        }

        // Save progress
        const progress = {
            totalTasksCompleted: newTaskCount,
            candyUsageCount: newCandyCount,
            betsWonCount: newBetsWon,
        };
        storage.set(PROGRESS_KEY, JSON.stringify(progress));

        // If there's an achievement to unlock
        if (achievementToUnlock) {
            const unlocked: UnlockedAchievement = {
                ...achievementToUnlock,
                unlockedAt: Date.now(),
                progress: achievementToUnlock.target,
            };

            const newUnlockedList = [...unlockedAchievements, unlocked];
            storage.set(STORAGE_KEY, JSON.stringify(newUnlockedList));

            set({
                unlockedAchievements: newUnlockedList,
                totalTasksCompleted: newTaskCount,
                candyUsageCount: newCandyCount,
                betsWonCount: newBetsWon,
                recentlyUnlocked: unlocked,
            });
        } else {
            set({
                totalTasksCompleted: newTaskCount,
                candyUsageCount: newCandyCount,
                betsWonCount: newBetsWon,
            });
        }
    },

    clearRecentlyUnlocked: () => {
        set({ recentlyUnlocked: null });
    },

    getProgress: (achievementId: string) => {
        const { totalTasksCompleted, candyUsageCount, betsWonCount, unlockedAchievements } = get();
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

        if (!achievement) return 0;

        // If already unlocked, return 100%
        if (unlockedAchievements.some(u => u.id === achievementId)) {
            return 100;
        }

        let current = 0;
        switch (achievement.category) {
            case 'task':
                current = totalTasksCompleted;
                break;
            case 'special':
                if (achievementId === 'candy_lover') current = candyUsageCount;
                else if (achievementId === 'bet_master') current = betsWonCount;
                break;
            // Streak is handled separately
        }

        return Math.min(100, Math.round((current / achievement.target) * 100));
    },
}));

export default useAchievementStore;
