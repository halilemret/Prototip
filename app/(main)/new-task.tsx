// ============================================
// ONYX - New Task Modal
// ============================================

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton, SkeletonStepCard } from '@/components';
import { useUserStore } from '@/stores/user.store';
import { useTaskStore } from '@/stores/task.store';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { AIService } from '@/services/ai.service';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MAX_TASK_LENGTH } from '@/constants/app';

export default function NewTaskModal() {
    const [task, setTask] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const currentMood = useUserStore((state) => state.currentMood);
    const incrementBreakdownCount = useUserStore((state) => state.incrementBreakdownCount);
    const dailyBreakdownsUsed = useUserStore((state) => state.dailyBreakdownsUsed);

    const createTaskFromBreakdown = useTaskStore((state) => state.createTaskFromBreakdown);
    const abandonTask = useTaskStore((state) => state.abandonTask);
    const hasActiveTask = useTaskStore((state) => state.hasActiveTask);

    const shouldShowPaywall = useSubscriptionStore((state) => state.shouldShowPaywall);
    const { isPremium, remainingBreakdowns, canUseBreakdown, showPaywall } = usePremiumFeature();

    const handleClose = () => {
        router.back();
    };

    const handleBreakdown = async () => {
        if (!task.trim()) {
            Alert.alert('Hold on', 'What task do you want to break down?');
            return;
        }

        // Check paywall - show RevenueCat remote paywall if limit reached
        if (shouldShowPaywall(dailyBreakdownsUsed)) {
            const purchased = await showPaywall();
            if (!purchased) {
                // User didn't purchase, don't proceed
                return;
            }
            // User purchased, continue with breakdown
        }

        if (!AIService.isConfigured()) {
            Alert.alert(
                'Setup Required',
                'Gemini API key not configured. Add EXPO_PUBLIC_GEMINI_API_KEY to .env file.',
            );
            return;
        }

        // Warn about active task
        if (hasActiveTask()) {
            Alert.alert(
                'Active Task',
                'You have an ongoing task. Starting a new one will replace it.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Replace', style: 'destructive', onPress: () => startBreakdown() },
                ]
            );
            return;
        }

        await startBreakdown();
    };

    const startBreakdown = async () => {
        setIsLoading(true);

        try {
            const result = await AIService.magicBreakdown({
                taskText: task.trim(),
                moodLevel: currentMood,
                preferEasyFirst: true,
            });

            if (result.success) {
                // Clear any existing task
                abandonTask();

                // Create new task
                createTaskFromBreakdown(result.data, currentMood);

                // Increment counter
                incrementBreakdownCount();

                // Close modal and go to focus view
                router.back();
            } else {
                Alert.alert('Error', result.error.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to break down task. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const charCount = task.length;
    const isOverLimit = charCount > MAX_TASK_LENGTH;

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Pressable onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </Pressable>
                    <Text style={styles.title}>Brain Dump 🧠</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Analyzing your thoughts...</Text>
                            <Text style={styles.loadingSubText}>Extracting the most critical task just for you.</Text>
                            <SkeletonStepCard />
                        </View>
                    ) : (
                        <>
                            <Text style={styles.prompt}>
                                Vomit your thoughts here.{"\n"}
                                <Text style={styles.promptSub}>Don't worry about order. Just get it out.</Text>
                            </Text>

                            <TextInput
                                style={[styles.input, isOverLimit && styles.inputError]}
                                placeholder="e.g., I need to pay rent, buy cat food, email my boss about the report, and maybe clean the kitchen because it's gross..."
                                placeholderTextColor={colors.muted}
                                value={task}
                                onChangeText={setTask}
                                multiline
                                maxLength={MAX_TASK_LENGTH + 20}
                                autoFocus
                            />

                            <View style={styles.inputMeta}>
                                <Text style={[styles.charCount, isOverLimit && styles.charCountError]}>
                                    {charCount}/{MAX_TASK_LENGTH}
                                </Text>

                                {!isPremium && (
                                    <Text style={styles.remainingText}>
                                        {remainingBreakdowns} analysis left today
                                    </Text>
                                )}
                            </View>
                        </>
                    )}
                </View>

                {/* Footer */}
                {!isLoading && (
                    <View style={styles.footer}>
                        <HapticButton
                            variant={canUseBreakdown ? "primary" : "secondary"}
                            size="lg"
                            fullWidth
                            hapticType="heavy"
                            onPress={handleBreakdown}
                            isDisabled={!task.trim() || isOverLimit}
                        >
                            {canUseBreakdown ? 'Analyze & Create Action 🚀' : 'Unlock unlimited ⚡'}
                        </HapticButton>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    keyboardView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    closeButton: {
        padding: spacing.sm,
    },
    closeIcon: {
        fontSize: 20,
        color: colors.muted,
    },
    title: {
        fontSize: typography.lg,
        fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 36,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
    },
    prompt: {
        fontSize: typography.xl,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.lg,
    },
    promptSub: {
        fontSize: typography.base,
        color: colors.muted,
        fontWeight: 'normal',
        marginTop: spacing.xs,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        padding: spacing.lg,
        fontSize: typography.lg,
        color: colors.text,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: colors.danger,
    },
    inputMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    charCount: {
        fontSize: typography.sm,
        color: colors.muted,
    },
    charCountError: {
        color: colors.danger,
    },
    remainingText: {
        fontSize: typography.sm,
        color: colors.action,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: typography.lg,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    loadingSubText: {
        fontSize: typography.sm,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
});
