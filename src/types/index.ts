// ============================================
// ONYX - Core Type Definitions
// ============================================

// -------------------- User & Mood --------------------
export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export interface MoodEntry {
    level: MoodLevel;
    timestamp: number;
    taskId?: string;
}

// -------------------- Tasks & Steps --------------------
export type DifficultyScore = 1 | 2 | 3; // 1=Easy (Candy), 2=Medium, 3=Hard

export interface MicroStep {
    id: string;
    text: string;
    difficultyScore: DifficultyScore;
    isCandy: boolean;
    isCompleted: boolean;
    completedAt?: number;
}

export interface Task {
    id: string;
    originalText: string;
    microSteps: MicroStep[];
    currentStepIndex: number;
    estimatedMinutes: number;
    candyIndex: number;
    createdAt: number;
    completedAt?: number;
    moodAtStart: MoodLevel;
    moodAtEnd?: MoodLevel;
    // Gamification - Time Betting
    betDurationMinutes?: number;
    betStartTime?: number;
    potentialXp?: number;
}

export interface CompletedTask {
    id: string;
    originalText: string;
    totalSteps: number;
    completedSteps: number;
    startedAt: number;
    completedAt: number;
    moodAtStart: MoodLevel;
    moodAtEnd?: MoodLevel;
    durationMinutes: number;
}

// -------------------- AI Service --------------------
export interface MagicBreakdownRequest {
    taskText: string;
    moodLevel: MoodLevel;
    preferEasyFirst?: boolean;
}

export interface MagicBreakdownResponse {
    originalTask: string;
    summaryTitle?: string; // Extracted clear title from Brain Dump
    microSteps: Omit<MicroStep, 'isCompleted' | 'completedAt'>[];
    estimatedMinutes: number;
    candyIndex: number;
    motivationalNote?: string;
}

export interface AIServiceError {
    code: 'RATE_LIMIT' | 'INVALID_KEY' | 'NETWORK_ERROR' | 'PARSE_ERROR';
    message: string;
}

// -------------------- Subscription --------------------
export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionState {
    tier: SubscriptionTier;
    isPremium: boolean;
    dailyBreakdownsUsed: number;
    dailyBreakdownLimit: number;
    lastResetDate: string;
}

export interface PremiumFeature {
    id: string;
    name: string;
    description: string;
    icon: string;
}

// -------------------- Storage Keys --------------------
export enum StorageKeys {
    HAS_ONBOARDED = 'onyx:has_onboarded',
    CURRENT_TASK = 'onyx:current_task',
    COMPLETED_TASKS = 'onyx:completed_tasks',
    DAILY_BREAKDOWN_COUNT = 'onyx:daily_breakdown_count',
    LAST_BREAKDOWN_DATE = 'onyx:last_breakdown_date',
    USER_MOOD_HISTORY = 'onyx:user_mood_history',
    CURRENT_MOOD = 'onyx:current_mood',
    HAPTICS_ENABLED = 'onyx:haptics_enabled',
    SUBSCRIPTION_CACHE = 'onyx:subscription_cache',
    // Gamification
    USER_XP = 'onyx:user_xp',
    USER_LEVEL = 'onyx:user_level',
    USER_STREAK = 'onyx:user_streak',
    LAST_ACTIVITY_DATE = 'onyx:last_activity_date',
    TASK_BACKLOG = 'onyx:task_backlog',
    USER_LANGUAGE = 'onyx:user_language',
}

// -------------------- Navigation --------------------
export type OnboardingStep = 'mood-check' | 'first-task' | 'first-breakdown';

// -------------------- Utility Types --------------------
export type AsyncResult<T> =
    | { success: true; data: T }
    | { success: false; error: AIServiceError };
