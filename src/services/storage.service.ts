// ============================================
// ONYX - AsyncStorage Service
// ============================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys, Task, CompletedTask, MoodEntry, MoodLevel } from '@/types';

// -------------------- Generic Helpers --------------------

async function getItem<T>(key: StorageKeys): Promise<T | null> {
    try {
        const value = await AsyncStorage.getItem(key);
        if (!value) return null;
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
}

async function setItem<T>(key: StorageKeys, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
}

async function removeItem(key: StorageKeys): Promise<void> {
    await AsyncStorage.removeItem(key);
}

// Sync versions using cached data
const cache: Record<string, unknown> = {};

function getItemSync<T>(key: StorageKeys): T | null {
    return (cache[key] as T) ?? null;
}

function setItemSync<T>(key: StorageKeys, value: T): void {
    cache[key] = value;
    // Fire and forget - async save
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(console.error);
}

// -------------------- Storage Service --------------------

export const StorageService = {
    // Initialize cache from AsyncStorage
    async hydrate(): Promise<void> {
        try {
            const keys = Object.values(StorageKeys);
            const pairs = await AsyncStorage.multiGet(keys);
            pairs.forEach(([key, value]: [string, string | null]) => {
                if (value) {
                    try {
                        cache[key] = JSON.parse(value);
                    } catch {
                        cache[key] = value;
                    }
                }
            });
        } catch (error) {
            console.error('[Storage] Hydration failed:', error);
        }
    },

    // Onboarding status
    getHasOnboarded: (): boolean => {
        return getItemSync<boolean>(StorageKeys.HAS_ONBOARDED) ?? false;
    },

    setHasOnboarded: (value: boolean): void => {
        setItemSync(StorageKeys.HAS_ONBOARDED, value);
    },

    // -------------------- Current Task --------------------

    getCurrentTask: (): Task | null => {
        return getItemSync<Task>(StorageKeys.CURRENT_TASK);
    },

    setCurrentTask: (task: Task | null): void => {
        if (task) {
            setItemSync(StorageKeys.CURRENT_TASK, task);
        } else {
            cache[StorageKeys.CURRENT_TASK] = null;
            AsyncStorage.removeItem(StorageKeys.CURRENT_TASK).catch(console.error);
        }
    },

    // -------------------- Task Backlog --------------------

    getBacklog: (): Task[] => {
        return getItemSync<Task[]>(StorageKeys.TASK_BACKLOG) ?? [];
    },

    setBacklog: (backlog: Task[]): void => {
        setItemSync(StorageKeys.TASK_BACKLOG, backlog);
    },

    // -------------------- Completed Tasks --------------------

    getCompletedTasks: (): CompletedTask[] => {
        return getItemSync<CompletedTask[]>(StorageKeys.COMPLETED_TASKS) ?? [];
    },

    addCompletedTask: (task: CompletedTask): void => {
        const existing = StorageService.getCompletedTasks();
        const updated = [task, ...existing].slice(0, 100);
        setItemSync(StorageKeys.COMPLETED_TASKS, updated);
    },

    clearCompletedTasks: (): void => {
        cache[StorageKeys.COMPLETED_TASKS] = [];
        AsyncStorage.removeItem(StorageKeys.COMPLETED_TASKS).catch(console.error);
    },

    // -------------------- Daily Breakdown Counter --------------------

    getDailyBreakdownCount: (): number => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = getItemSync<string>(StorageKeys.LAST_BREAKDOWN_DATE);

        if (lastDate !== today) {
            setItemSync(StorageKeys.LAST_BREAKDOWN_DATE, today);
            setItemSync(StorageKeys.DAILY_BREAKDOWN_COUNT, 0);
            return 0;
        }

        return getItemSync<number>(StorageKeys.DAILY_BREAKDOWN_COUNT) ?? 0;
    },

    incrementDailyBreakdownCount: (): number => {
        const current = StorageService.getDailyBreakdownCount();
        const newCount = current + 1;
        setItemSync(StorageKeys.DAILY_BREAKDOWN_COUNT, newCount);
        return newCount;
    },

    resetDailyBreakdownCount: (): void => {
        setItemSync(StorageKeys.DAILY_BREAKDOWN_COUNT, 0);
    },

    // -------------------- Mood --------------------

    getCurrentMood: (): MoodLevel => {
        return getItemSync<MoodLevel>(StorageKeys.CURRENT_MOOD) ?? 3;
    },

    setCurrentMood: (mood: MoodLevel): void => {
        setItemSync(StorageKeys.CURRENT_MOOD, mood);

        const entry: MoodEntry = {
            level: mood,
            timestamp: Date.now(),
        };
        StorageService.addMoodEntry(entry);
    },

    getMoodHistory: (): MoodEntry[] => {
        return getItemSync<MoodEntry[]>(StorageKeys.USER_MOOD_HISTORY) ?? [];
    },

    addMoodEntry: (entry: MoodEntry): void => {
        const existing = StorageService.getMoodHistory();
        const updated = [entry, ...existing].slice(0, 500);
        setItemSync(StorageKeys.USER_MOOD_HISTORY, updated);
    },

    // -------------------- Settings --------------------

    getHapticsEnabled: (): boolean => {
        return getItemSync<boolean>(StorageKeys.HAPTICS_ENABLED) ?? true;
    },

    setHapticsEnabled: (enabled: boolean): void => {
        setItemSync(StorageKeys.HAPTICS_ENABLED, enabled);
    },

    // -------------------- Gamification --------------------

    getXp: (): number => {
        return getItemSync<number>(StorageKeys.USER_XP) ?? 0;
    },

    setXp: (xp: number): void => {
        setItemSync(StorageKeys.USER_XP, xp);
    },

    getLevel: (): number => {
        return getItemSync<number>(StorageKeys.USER_LEVEL) ?? 1;
    },

    setLevel: (level: number): void => {
        setItemSync(StorageKeys.USER_LEVEL, level);
    },

    getStreak: (): number => {
        return getItemSync<number>(StorageKeys.USER_STREAK) ?? 0;
    },

    setStreak: (streak: number): void => {
        setItemSync(StorageKeys.USER_STREAK, streak);
    },

    getLastActivityDate: (): string | null => {
        return getItemSync<string>(StorageKeys.LAST_ACTIVITY_DATE);
    },

    setLastActivityDate: (date: string): void => {
        setItemSync(StorageKeys.LAST_ACTIVITY_DATE, date);
    },

    getLanguage: (): 'en' | 'tr' => {
        return getItemSync<'en' | 'tr'>(StorageKeys.USER_LANGUAGE) ?? 'en';
    },

    setLanguage: (lang: 'en' | 'tr'): void => {
        setItemSync(StorageKeys.USER_LANGUAGE, lang);
    },

    // -------------------- Utils --------------------

    clearAll: async (): Promise<void> => {
        await AsyncStorage.clear();
        Object.keys(cache).forEach(key => delete cache[key]);
    },

    // Save personalization
    setPersonalization: (data: Record<string, unknown>): void => {
        setItemSync('onyx:personalization' as StorageKeys, data);
    },
};

// Also export storage-like interface for compatibility
export const storage = {
    set: (key: string, value: unknown): void => {
        cache[key] = value;
        AsyncStorage.setItem(key, JSON.stringify(value)).catch(console.error);
    },
    getString: (key: string): string | undefined => {
        const val = cache[key];
        return typeof val === 'string' ? val : undefined;
    },
    getNumber: (key: string): number | undefined => {
        const val = cache[key];
        return typeof val === 'number' ? val : undefined;
    },
    getBoolean: (key: string): boolean | undefined => {
        const val = cache[key];
        return typeof val === 'boolean' ? val : undefined;
    },
    delete: (key: string): void => {
        delete cache[key];
        AsyncStorage.removeItem(key).catch(console.error);
    },
    clearAll: (): void => {
        Object.keys(cache).forEach(key => delete cache[key]);
        AsyncStorage.clear().catch(console.error);
    },
    getAllKeys: (): string[] => Object.keys(cache),
};

export default StorageService;
