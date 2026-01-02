// ============================================
// ONYX - App Constants
// ============================================

// Free tier limitations
export const FREE_DAILY_BREAKDOWNS = 3;

// RevenueCat
export const REVENUECAT_ENTITLEMENT_ID = 'Core Pro';
export const REVENUECAT_OFFERING_ID = 'default';

// AI Configuration (Gemini)
export const AI_MODEL = 'gemini-2.0-flash-exp';
export const AI_MAX_TOKENS = 1024;
export const AI_TEMPERATURE = 0.7;

// Task limits
export const MAX_TASK_LENGTH = 200;
export const MAX_STEPS_PER_TASK = 15;
export const MIN_STEPS_PER_TASK = 3;

// Mood configurations
export const MOOD_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'Empty',
    2: 'Low',
    3: 'Okay',
    4: 'Good',
    5: 'Full',
};

export const MOOD_EMOJIS: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: '🪫',
    2: '🔋',
    3: '🔋',
    4: '🔋',
    5: '⚡',
};

// Premium features list
export const PREMIUM_FEATURES = [
    {
        id: 'unlimited_breakdowns',
        name: 'Unlimited Breakdowns',
        description: 'No daily limits on AI task decomposition',
        icon: '♾️',
    },
    {
        id: 'mood_analytics',
        name: 'Mood Analytics',
        description: 'Track your productivity patterns over time',
        icon: '📊',
    },
    {
        id: 'voice_coach',
        name: 'Voice Motivation',
        description: 'Audio encouragement when you need it',
        icon: '🎙️',
    },
    {
        id: 'panic_mode',
        name: 'Panic Mode',
        description: 'Emergency task simplification',
        icon: '🚨',
    },
] as const;
