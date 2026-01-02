// ============================================
// ONYX - Task Store (Zustand)
// ============================================

import { create } from 'zustand';
import { Task, MicroStep, CompletedTask, MoodLevel, MagicBreakdownResponse } from '@/types';
import { StorageService } from '@/services/storage.service';
import { useUserStore } from '@/stores/user.store';

interface TaskState {
    // State
    currentTask: Task | null;
    completedTasks: CompletedTask[];
    isLoading: boolean;
    isHydrated: boolean;

    // Computed-like getters
    getCurrentStep: () => MicroStep | null;
    getProgress: () => { current: number; total: number; percentage: number };
    hasActiveTask: () => boolean;

    // Actions
    hydrate: () => void;
    createTaskFromBreakdown: (breakdown: MagicBreakdownResponse, moodAtStart: MoodLevel) => Task;
    setCurrentTask: (task: Task | null) => void;
    completeCurrentStep: () => void;
    skipCurrentStep: () => void;
    jumpToCandy: () => void;
    completeTask: (moodAtEnd?: MoodLevel) => CompletedTask | null;
    abandonTask: () => void;
    setLoading: (loading: boolean) => void;
}

// Generate unique task ID
const generateTaskId = (): string => {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useTaskStore = create<TaskState>((set, get) => ({
    // Initial state
    currentTask: null,
    completedTasks: [],
    isLoading: false,
    isHydrated: false,

    // Get current step
    getCurrentStep: () => {
        const { currentTask } = get();
        if (!currentTask) return null;
        return currentTask.microSteps[currentTask.currentStepIndex] ?? null;
    },

    // Get progress info
    getProgress: () => {
        const { currentTask } = get();
        if (!currentTask) {
            return { current: 0, total: 0, percentage: 0 };
        }
        const completed = currentTask.microSteps.filter(s => s.isCompleted).length;
        const total = currentTask.microSteps.length;
        return {
            current: completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    },

    // Check if there's an active task
    hasActiveTask: () => {
        return get().currentTask !== null;
    },

    // Hydrate from storage
    hydrate: () => {
        const currentTask = StorageService.getCurrentTask();
        const completedTasks = StorageService.getCompletedTasks();

        set({
            currentTask,
            completedTasks,
            isHydrated: true,
        });
    },

    // Create new task from AI breakdown
    createTaskFromBreakdown: (breakdown: MagicBreakdownResponse, moodAtStart: MoodLevel): Task => {
        const task: Task = {
            id: generateTaskId(),
            // Use the clean AI summary title if available, otherwise fall back to raw input
            originalText: breakdown.summaryTitle || breakdown.originalTask,
            microSteps: breakdown.microSteps.map(step => ({
                ...step,
                isCompleted: false,
            })),
            currentStepIndex: 0,
            estimatedMinutes: breakdown.estimatedMinutes,
            candyIndex: breakdown.candyIndex,
            createdAt: Date.now(),
            moodAtStart,
        };

        // Optionally start with candy (easiest step)
        // Uncomment if "Eat the Candy" mode should be default:
        // task.currentStepIndex = breakdown.candyIndex;

        StorageService.setCurrentTask(task);
        set({ currentTask: task });

        return task;
    },

    // Set current task
    setCurrentTask: (task: Task | null) => {
        StorageService.setCurrentTask(task);
        set({ currentTask: task });
    },

    // Complete current step and move to next
    completeCurrentStep: () => {
        const { currentTask } = get();
        if (!currentTask) return;

        const updatedSteps = [...currentTask.microSteps];
        const currentIndex = currentTask.currentStepIndex;

        // Mark current step as completed
        updatedSteps[currentIndex] = {
            ...updatedSteps[currentIndex],
            isCompleted: true,
            completedAt: Date.now(),
        };

        // Gamification: Award XP for step completion
        useUserStore.getState().addXp(10);
        useUserStore.getState().updateStreak();

        // Find next incomplete step
        let nextIndex = currentIndex + 1;
        while (nextIndex < updatedSteps.length && updatedSteps[nextIndex].isCompleted) {
            nextIndex++;
        }

        // Check if all steps are complete
        const allComplete = updatedSteps.every(s => s.isCompleted);

        if (allComplete) {
            // Task is done - will be completed via completeTask()
            const updatedTask: Task = {
                ...currentTask,
                microSteps: updatedSteps,
                currentStepIndex: updatedSteps.length - 1,
            };
            StorageService.setCurrentTask(updatedTask);
            set({ currentTask: updatedTask });
        } else {
            // Move to next step
            const updatedTask: Task = {
                ...currentTask,
                microSteps: updatedSteps,
                currentStepIndex: nextIndex < updatedSteps.length ? nextIndex : currentIndex,
            };
            StorageService.setCurrentTask(updatedTask);
            set({ currentTask: updatedTask });
        }
    },

    // Skip current step (move without completing)
    skipCurrentStep: () => {
        const { currentTask } = get();
        if (!currentTask) return;

        const totalSteps = currentTask.microSteps.length;
        let nextIndex = currentTask.currentStepIndex + 1;

        // Wrap around to find incomplete step
        for (let i = 0; i < totalSteps; i++) {
            const checkIndex = (nextIndex + i) % totalSteps;
            if (!currentTask.microSteps[checkIndex].isCompleted) {
                const updatedTask: Task = {
                    ...currentTask,
                    currentStepIndex: checkIndex,
                };
                StorageService.setCurrentTask(updatedTask);
                set({ currentTask: updatedTask });
                return;
            }
        }
    },

    // Jump to candy (easiest) step
    jumpToCandy: () => {
        const { currentTask } = get();
        if (!currentTask) return;

        // Find first incomplete candy/easy step
        const candyStep = currentTask.microSteps.findIndex(
            (s, i) => !s.isCompleted && (s.isCandy || s.difficultyScore === 1)
        );

        if (candyStep !== -1) {
            const updatedTask: Task = {
                ...currentTask,
                currentStepIndex: candyStep,
            };
            StorageService.setCurrentTask(updatedTask);
            set({ currentTask: updatedTask });
        }
    },

    // Complete and archive the task
    completeTask: (moodAtEnd?: MoodLevel): CompletedTask | null => {
        const { currentTask, completedTasks } = get();
        if (!currentTask) return null;

        const completedTask: CompletedTask = {
            id: currentTask.id,
            originalText: currentTask.originalText,
            totalSteps: currentTask.microSteps.length,
            completedSteps: currentTask.microSteps.filter(s => s.isCompleted).length,
            startedAt: currentTask.createdAt,
            completedAt: Date.now(),
            moodAtStart: currentTask.moodAtStart,
            moodAtEnd,
            durationMinutes: Math.round((Date.now() - currentTask.createdAt) / 60000),
        };

        // Archive to storage
        StorageService.addCompletedTask(completedTask);
        StorageService.setCurrentTask(null);

        set({
            currentTask: null,
            completedTasks: [completedTask, ...completedTasks],
        });

        // Gamification: Award XP for task completion
        useUserStore.getState().addXp(50);
        useUserStore.getState().updateStreak();

        return completedTask;
    },

    // Abandon current task without completing
    abandonTask: () => {
        StorageService.setCurrentTask(null);
        set({ currentTask: null });
    },

    // Set loading state
    setLoading: (loading: boolean) => {
        set({ isLoading: loading });
    },
}));

export default useTaskStore;
