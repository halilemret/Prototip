// ============================================
// ONYX - Focus Timer Store (Pomodoro)
// 25 min focus + 5 min break cycle
// Timestamp-based + Full Persistence
// ============================================

import { create } from 'zustand';
import { StorageService } from '@/services/storage.service';
import { StorageKeys } from '@/types';
import { useUserStore } from './user.store';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak' | 'idle';

interface TimerSettings {
    focusDuration: number;      // in seconds
    shortBreakDuration: number; // in seconds
    longBreakDuration: number;  // in seconds
    longBreakInterval: number;
    autoStartBreak: boolean;
    autoStartFocus: boolean;
}

interface TimerStats {
    todayPomodoros: number;
    totalPomodoros: number;
    todayFocusMinutes: number;
    totalFocusMinutes: number;
    lastSessionDate: string;
}

interface ActiveSession {
    mode: TimerMode;
    isRunning: boolean;
    isPaused: boolean;
    remainingSeconds: number;
    totalSeconds: number;
    endTime?: number;
    currentPomodoroCount: number;
}

interface TimerState extends ActiveSession {
    settings: TimerSettings;
    stats: TimerStats;

    start: (mode?: TimerMode) => void;
    pause: () => void;
    resume: () => void;
    reset: () => void;
    skip: () => void;
    tick: () => void;
    updateSettings: (settings: Partial<TimerSettings>) => void;
    hydrate: () => Promise<void>;
}

const DEFAULT_SETTINGS: TimerSettings = {
    focusDuration: 25 * 60,
    shortBreakDuration: 5 * 60,
    longBreakDuration: 15 * 60,
    longBreakInterval: 4,
    autoStartBreak: false,
    autoStartFocus: false,
};

const DEFAULT_STATS: TimerStats = {
    todayPomodoros: 0,
    totalPomodoros: 0,
    todayFocusMinutes: 0,
    totalFocusMinutes: 0,
    lastSessionDate: new Date().toDateString(),
};

const POMODORO_XP_BONUS = 15;
const LONG_BREAK_XP_BONUS = 25;

export const BREAK_MESSAGES = {
    en: [
        "Great work! Time to rest your brain. 🧠",
        "You earned this break! Stretch a bit. 🙆",
        "Step away from the screen. You did amazing! ⭐",
        "Hydration check! Grab some water. 💧",
        "Deep breaths. You're crushing it! 💪",
    ],
    tr: [
        "Harika iş! Beynini dinlendir. 🧠",
        "Bu molayı hak ettin! Biraz esne. 🙆",
        "Ekrandan uzaklaş. Müthişsin! ⭐",
        "Su içme zamanı! Bir bardak al. 💧",
        "Derin nefes. Çok iyi gidiyorsun! 💪",
    ],
};

export const FOCUS_START_MESSAGES = {
    en: [
        "Let's do this! 25 minutes of pure focus. 🎯",
        "Block out distractions. You've got this! 🔥",
        "One step at a time. Start now! 🚀",
    ],
    tr: [
        "Hadi başlayalım! 25 dakika saf odaklanma. 🎯",
        "Dikkat dağıtıcıları engelle. Yapabilirsin! 🔥",
        "Adım adım. Şimdi başla! 🚀",
    ],
};

const persistState = (state: ActiveSession) => {
    StorageService.setItem(StorageKeys.TIMER_STATE, state);
};

export const useTimerStore = create<TimerState>((set, get) => ({
    mode: 'idle',
    isRunning: false,
    isPaused: false,
    remainingSeconds: DEFAULT_SETTINGS.focusDuration,
    totalSeconds: DEFAULT_SETTINGS.focusDuration,
    endTime: undefined,
    currentPomodoroCount: 0,
    settings: DEFAULT_SETTINGS,
    stats: DEFAULT_STATS,

    start: (mode = 'focus') => {
        const { settings, currentPomodoroCount } = get();
        let duration = settings.focusDuration;
        if (mode === 'shortBreak') duration = settings.shortBreakDuration;
        if (mode === 'longBreak') duration = settings.longBreakDuration;

        const endTime = Date.now() + duration * 1000;

        const newState: ActiveSession = {
            mode,
            isRunning: true,
            isPaused: false,
            remainingSeconds: duration,
            totalSeconds: duration,
            endTime,
            currentPomodoroCount,
        };

        set(newState);
        persistState(newState);
    },

    pause: () => {
        const { mode, remainingSeconds, totalSeconds, currentPomodoroCount } = get();
        const newState: ActiveSession = {
            mode,
            isRunning: false,
            isPaused: true,
            remainingSeconds,
            totalSeconds,
            endTime: undefined,
            currentPomodoroCount,
        };
        set(newState);
        persistState(newState);
    },

    resume: () => {
        const { mode, remainingSeconds, totalSeconds, currentPomodoroCount } = get();
        const endTime = Date.now() + remainingSeconds * 1000;

        const newState: ActiveSession = {
            mode,
            isRunning: true,
            isPaused: false,
            remainingSeconds,
            totalSeconds,
            endTime,
            currentPomodoroCount,
        };
        set(newState);
        persistState(newState);
    },

    reset: () => {
        const { settings, currentPomodoroCount } = get();
        const newState: ActiveSession = {
            mode: 'idle',
            isRunning: false,
            isPaused: false,
            remainingSeconds: settings.focusDuration,
            totalSeconds: settings.focusDuration,
            endTime: undefined,
            currentPomodoroCount: currentPomodoroCount, // Keep count? Maybe reset count on long break? Usually daily reset handles this.
        };
        set(newState);
        persistState(newState);
    },

    skip: () => {
        const { mode, currentPomodoroCount, settings } = get();
        if (mode === 'focus') {
            const isLongBreak = (currentPomodoroCount + 1) % settings.longBreakInterval === 0;
            get().start(isLongBreak ? 'longBreak' : 'shortBreak');
        } else {
            get().start('focus');
        }
    },

    tick: () => {
        const { isRunning, endTime, mode, currentPomodoroCount, settings, stats } = get();

        if (!isRunning || !endTime) return;

        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));

        set({ remainingSeconds: remaining });

        if (remaining <= 0) {
            // Timer Completed
            if (mode === 'focus') {
                const newCount = currentPomodoroCount + 1;
                const isLongBreak = newCount % settings.longBreakInterval === 0;
                const xpBonus = isLongBreak ? LONG_BREAK_XP_BONUS : POMODORO_XP_BONUS;

                useUserStore.getState().addXp(xpBonus);

                const today = new Date().toDateString();
                const isSameDay = stats.lastSessionDate === today;

                const newStats: TimerStats = {
                    todayPomodoros: isSameDay ? stats.todayPomodoros + 1 : 1,
                    totalPomodoros: stats.totalPomodoros + 1,
                    todayFocusMinutes: isSameDay
                        ? stats.todayFocusMinutes + Math.floor(settings.focusDuration / 60)
                        : Math.floor(settings.focusDuration / 60),
                    totalFocusMinutes: stats.totalFocusMinutes + Math.floor(settings.focusDuration / 60),
                    lastSessionDate: today,
                };

                const finishedState: ActiveSession = {
                    mode,
                    isRunning: false,
                    isPaused: false, // Finished is not paused
                    remainingSeconds: 0,
                    totalSeconds: settings.focusDuration,
                    endTime: undefined,
                    currentPomodoroCount: newCount,
                };

                set({
                    ...finishedState,
                    stats: newStats,
                });

                persistState(finishedState);
                StorageService.setItem(StorageKeys.TIMER_STATS, newStats);

                if (settings.autoStartBreak) {
                    setTimeout(() => {
                        get().start(isLongBreak ? 'longBreak' : 'shortBreak');
                    }, 1000);
                }
            } else {
                // Break Completed
                const finishedState: ActiveSession = {
                    mode,
                    isRunning: false,
                    isPaused: false,
                    remainingSeconds: 0,
                    totalSeconds: settings.focusDuration, // Just placeholder
                    endTime: undefined,
                    currentPomodoroCount,
                };

                set(finishedState);
                persistState(finishedState);

                if (settings.autoStartFocus) {
                    setTimeout(() => {
                        get().start('focus');
                    }, 1000);
                }
            }
        }
    },

    updateSettings: (newSettings) => {
        const settings = { ...get().settings, ...newSettings };
        set({ settings });
        StorageService.setItem(StorageKeys.TIMER_SETTINGS, settings);
    },

    hydrate: async () => {
        try {
            const [savedSettings, savedStats, savedState] = await Promise.all([
                StorageService.getItem<TimerSettings>(StorageKeys.TIMER_SETTINGS),
                StorageService.getItem<TimerStats>(StorageKeys.TIMER_STATS),
                StorageService.getItem<ActiveSession>(StorageKeys.TIMER_STATE),
            ]);

            const today = new Date().toDateString();
            let stats = savedStats || DEFAULT_STATS;

            // Daily reset stats
            if (stats.lastSessionDate !== today) {
                stats = {
                    ...stats,
                    todayPomodoros: 0,
                    todayFocusMinutes: 0,
                    lastSessionDate: today,
                };
            }

            let loadedState: Partial<ActiveSession> = {};

            if (savedState) {
                loadedState = { ...savedState };

                // Recalculate if it was running
                if (savedState.isRunning && savedState.endTime) {
                    const now = Date.now();
                    const remaining = Math.ceil((savedState.endTime - now) / 1000);

                    if (remaining <= 0) {
                        // Finished while away
                        loadedState.remainingSeconds = 0;
                        loadedState.isRunning = false;
                        loadedState.endTime = undefined;
                        // Ideally we should auto-complete here, but for now just stop it.
                        // User will see 00:00.
                        // Calling tick() immediately after hydrate might handle this naturally 
                        // if we left it running but it's cleaner to reset here.
                    } else {
                        loadedState.remainingSeconds = remaining;
                    }
                }
            }

            set({
                settings: savedSettings || DEFAULT_SETTINGS,
                stats,
                ...loadedState,
            });
        } catch (error) {
            console.error('Failed to hydrate timer store:', error);
        }
    },
}));

export const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getProgress = (remaining: number, total: number): number => {
    if (total === 0) return 0;
    return ((total - remaining) / total) * 100;
};
