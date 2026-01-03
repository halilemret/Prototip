// ============================================
// ONYX - Focus View (Main Screen)
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    BatteryIndicator,
    HapticButton,
    StepCard,
    SkeletonStepCard,
} from '@/components';
import {
    Settings,
    Wind,
    Plus,
    Zap,
    History as HistoryIcon
} from 'lucide-react-native';
import { useUserStore } from '@/stores/user.store';
import { useTaskStore } from '@/stores/task.store';
import { useHaptics } from '@/hooks/useHaptics';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { TimeBetModal } from '@/components/Dopamine/TimeBetModal';
import { ActiveBetTimer } from '@/components/Focus/ActiveBetTimer';
import { LevelUpModal } from '@/components/Gamification/LevelUpModal';
import { TaskCompleteModal } from '@/components/Gamification/TaskCompleteModal';
import { NotificationService } from '@/services/notification.service';
import { ForgivenessModal } from '@/components/Dopamine/ForgivenessModal';
import { StorageService } from '@/services/storage.service';
import { AIService } from '@/services/ai.service';
import { useTranslation } from '@/hooks/useTranslation';

export default function FocusViewScreen() {
    const { colors, theme } = useTheme();
    const haptics = useHaptics();
    const [isCompleting, setIsCompleting] = useState(false);
    const { t, language } = useTranslation();

    // User state
    const currentMood = useUserStore((state) => state.currentMood);
    const setMood = useUserStore((state) => state.setMood);

    // Task state
    const currentTask = useTaskStore((state) => state.currentTask);
    const getCurrentStep = useTaskStore((state) => state.getCurrentStep);
    const getProgress = useTaskStore((state) => state.getProgress);
    const completeCurrentStep = useTaskStore((state) => state.completeCurrentStep);
    const skipCurrentStep = useTaskStore((state) => state.skipCurrentStep);
    const jumpToCandy = useTaskStore((state) => state.jumpToCandy);
    const completeTask = useTaskStore((state) => state.completeTask);

    // Premium features
    const { remainingBreakdowns, isPremium } = usePremiumFeature();

    // Gamification state
    const level = useUserStore((state) => state.level);
    const xp = useUserStore((state) => state.xp);

    // XP Calculation
    const nextLevelXp = 100 * Math.pow(level, 2);
    const currentLevelBaseXp = 100 * Math.pow(level - 1, 2);
    const xpPercent = Math.min(100, Math.max(0, ((xp - currentLevelBaseXp) / (nextLevelXp - currentLevelBaseXp)) * 100));

    // Modals state
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [showTaskComplete, setShowTaskComplete] = useState(false);
    const [showTimeBet, setShowTimeBet] = useState(false);
    const [showForgiveness, setShowForgiveness] = useState(false);
    const [earnedXp, setEarnedXp] = useState(0);

    // Track previous level to detect level up
    const [prevLevel, setPrevLevel] = useState(level);

    // Watch for level up
    React.useEffect(() => {
        if (level > prevLevel) {
            setShowLevelUp(true);
            setPrevLevel(level);
        }
    }, [level, prevLevel]);

    // Cleanup & Forgiveness logic
    React.useEffect(() => {
        if (currentTask) {
            // Add a small delay to allow navigation transitions to settle
            const timer = setTimeout(() => {
                // 1. Check for time bet trigger
                if (!currentTask.betStartTime && currentTask.microSteps.every(s => !s.isCompleted)) {
                    setShowTimeBet(true);
                }

                // 2. Check for "Task Rot" (started > 24h ago)
                const ageHours = (Date.now() - currentTask.createdAt) / 3600000;
                if (ageHours > 24) {
                    setShowForgiveness(true);
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [currentTask]);

    const currentStep = getCurrentStep();
    const progress = getProgress();

    // Handle step completion
    const handleComplete = async () => {
        if (!currentStep) return;

        setIsCompleting(true);
        haptics.success();

        // Small delay for animation feel
        await new Promise((resolve) => setTimeout(resolve, 300));

        completeCurrentStep();

        // Check if task is complete
        const newProgress = getProgress();
        if (newProgress.percentage === 100) {
            // Delay task complete modal slightly
            setTimeout(() => {
                haptics.heavy();

                // Calculate final XP display (basic 50 + potential bet bonus)
                // Note: The store handles the actual add logic, this is just for display
                let bonus = 0;
                if (currentTask?.betStartTime && currentTask.betDurationMinutes) {
                    const elapsed = (Date.now() - currentTask.betStartTime) / 60000;
                    if (elapsed <= currentTask.betDurationMinutes) bonus = 50; // Won bet (total 100)
                }

                setEarnedXp(50 + bonus);
                setShowTaskComplete(true);
            }, 500);
        }

        setIsCompleting(false);
    };

    const finishTask = (moodAtEnd: 1 | 2 | 3 | 4 | 5) => {
        completeTask(moodAtEnd);
        setMood(moodAtEnd);
        setShowTaskComplete(false);

        // Schedule streak reminder since user is active now
        NotificationService.scheduleStreakReminder();
    };

    const handleSkip = () => {
        haptics.light();
        skipCurrentStep();
    };

    const handleCandy = () => {
        haptics.medium();
        jumpToCandy();
    };

    const handleNewTask = () => {
        router.push('/(main)/new-task');
    };

    const handleOpenHistory = () => {
        router.push('/(main)/history');
    };

    const handleOpenSettings = () => {
        router.push('/(main)/settings');
    };

    const styles = createStyles(colors);

    // Empty state - no active task
    if (!currentTask || !currentStep) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <BatteryIndicator level={currentMood} size="sm" showLabel />
                    <View style={styles.headerRight}>
                        <View style={styles.miniXpContainer}>
                            <Text style={styles.miniLevelText}>{language === 'tr' ? 'Seviye' : 'Lvl'} {level}</Text>
                            <View style={styles.miniXpBar}>
                                <View style={[styles.miniXpFill, { width: `${xpPercent}%` }]} />
                            </View>
                        </View>
                        <Pressable onPress={handleOpenSettings} style={styles.iconButton}>
                            <Settings size={22} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.emptyState}>
                    <Wind size={64} color={colors.action} style={styles.emptyIcon} />
                    <Text style={styles.emptyTitle}>{t.focus.allClear}</Text>
                    <Text style={styles.emptySubtitle}>
                        {t.focus.noTasks}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleNewTask}
                    >
                        {t.focus.newBtn}
                    </HapticButton>

                    {!isPremium && (
                        <Text style={styles.breakdownsRemaining}>
                            {remainingBreakdowns} {language === 'tr' ? 'analiz hakkın kaldı' : `free breakdown${remainingBreakdowns !== 1 ? 's' : ''} remaining today`}
                        </Text>
                    )}

                    <HapticButton
                        variant="ghost"
                        size="md"
                        onPress={handleOpenHistory}
                        style={styles.historyButton}
                    >
                        {t.focus.historyBtn}
                    </HapticButton>
                </View>

                <LevelUpModal
                    visible={showLevelUp}
                    level={level}
                    onClose={() => setShowLevelUp(false)}
                />

                <TaskCompleteModal
                    visible={showTaskComplete}
                    xpEarned={earnedXp}
                    onComplete={finishTask}
                />
            </SafeAreaView >
        );
    }

    // Active task state
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <BatteryIndicator level={currentMood} size="sm" showLabel />

                {/* Active Bet Timer (if active) */}
                <ActiveBetTimer />

                <View style={styles.headerRight}>
                    <View style={styles.miniXpContainer}>
                        <Text style={styles.miniLevelText}>{language === 'tr' ? 'Seviye' : 'Lvl'} {level}</Text>
                        <View style={styles.miniXpBar}>
                            <View style={[styles.miniXpFill, { width: `${xpPercent}%` }]} />
                        </View>
                    </View>
                    <Pressable onPress={handleOpenSettings} style={styles.iconButton}>
                        <Settings size={22} color={colors.textSecondary} />
                    </Pressable>
                </View>
            </View>

            {/* Task Title */}
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle} numberOfLines={1}>
                    {currentTask.originalText}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${progress.percentage}%` }
                        ]}
                    />
                </View>
            </View>

            {/* Current Step */}
            <View style={styles.stepContainer}>
                {isCompleting ? (
                    <SkeletonStepCard />
                ) : (
                    <StepCard
                        step={currentStep}
                        stepNumber={currentTask.currentStepIndex + 1}
                        totalSteps={currentTask.microSteps.length}
                        onComplete={handleComplete}
                        onSkip={handleSkip}
                        isCompleting={isCompleting}
                    />
                )}
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
                <HapticButton
                    variant="secondary"
                    size="md"
                    onPress={handleNewTask}
                    leftIcon={<Plus size={18} color={colors.text} />}
                >
                    {language === 'tr' ? 'Yeni Görev' : 'New Task'}
                </HapticButton>

                <HapticButton
                    variant="secondary"
                    size="md"
                    onPress={handleCandy}
                    leftIcon={<Zap size={18} color={colors.action} />}
                >
                    {t.focus.easyWin}
                </HapticButton>
            </View>


            {/* Modals */}
            <LevelUpModal
                visible={showLevelUp}
                level={level}
                onClose={() => setShowLevelUp(false)}
            />

            <TaskCompleteModal
                visible={showTaskComplete}
                xpEarned={earnedXp}
                onComplete={finishTask}
            />

            <TimeBetModal
                visible={showTimeBet}
                onClose={() => setShowTimeBet(false)}
            />

            <ForgivenessModal
                visible={showForgiveness}
                taskTitle={currentTask?.originalText || ''}
                onClose={() => setShowForgiveness(false)}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        padding: spacing.sm,
    },
    settingsIcon: {
        fontSize: 24,
    },
    taskHeader: {
        marginBottom: spacing.lg,
    },
    taskTitle: {
        fontSize: typography.lg,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.action,
        borderRadius: 2,
    },
    stepContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    bottomActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xl,
    },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyIcon: {
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography['3xl'],
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: typography.lg,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        paddingBottom: spacing.xl,
    },
    breakdownsRemaining: {
        textAlign: 'center',
        color: colors.muted,
        fontSize: typography.sm,
        marginTop: spacing.md,
    },
    historyButton: {
        marginTop: spacing.md,
        alignSelf: 'center',
    },

    // Mini XP Indicator
    miniXpContainer: {
        marginRight: spacing.md,
        alignItems: 'flex-end',
    },
    miniLevelText: {
        fontSize: typography.xs,
        fontWeight: '700',
        color: colors.action,
        marginBottom: 2,
    },
    miniXpBar: {
        width: 60,
        height: 4,
        backgroundColor: colors.surface,
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniXpFill: {
        height: '100%',
        backgroundColor: colors.action,
        borderRadius: 2,
    },
    floatingContainer: {
        position: 'absolute',
        bottom: 150,
        right: 24,
    },
});

