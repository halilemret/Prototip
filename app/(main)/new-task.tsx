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
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Brain, Rocket, X } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton, SkeletonStepCard, ErrorView } from '@/components';
import { useUserStore } from '@/stores/user.store';
import { useTaskStore } from '@/stores/task.store';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { AIService } from '@/services/ai.service';
import { StorageService } from '@/services/storage.service';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { MAX_TASK_LENGTH } from '@/constants/app';

export default function NewTaskModal() {
    const { colors } = useTheme();
    const { t, language } = useTranslation();
    const [task, setTask] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{ code: string; message: string } | null>(null);

    const currentMood = useUserStore((state) => state.currentMood);
    const incrementBreakdownCount = useUserStore((state) => state.incrementBreakdownCount);
    const dailyBreakdownsUsed = useUserStore((state) => state.dailyBreakdownsUsed);

    const createTaskFromBreakdown = useTaskStore((state) => state.createTaskFromBreakdown);
    const abandonTask = useTaskStore((state) => state.abandonTask);
    const hasActiveTask = useTaskStore((state) => state.hasActiveTask);

    const shouldShowPaywall = useSubscriptionStore((state) => state.shouldShowPaywall);
    const { isPremium, remainingBreakdowns, canUseBreakdown, showPaywall } = usePremiumFeature();

    const styles = createStyles(colors);

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
        setError(null);

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
                setError(result.error);
                // Log for debugging
                console.warn('[NewTask] Breakdown failed:', result.error);
            }
        } catch (err) {
            setError({
                code: 'UNKNOWN',
                message: 'Something unexpected happened. Please try again.'
            });
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
                    <HapticButton variant="ghost" size="sm" onPress={() => router.back()}>
                        <X size={20} color={colors.muted} />
                    </HapticButton>
                    <Text style={styles.title}>{t.newTask.title.replace(' 🧠', '')}</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Content */}
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.content}>
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>{t.newTask.analyzing}</Text>
                                <Text style={styles.loadingSubText}>{t.newTask.extracting}</Text>
                                <SkeletonStepCard />
                            </View>
                        ) : error ? (
                            <ErrorView
                                title={error.code === 'RATE_LIMIT' ? (language === 'tr' ? "Yapay zeka dinleniyor" : "AI is catching its breath") : (language === 'tr' ? "Analiz Başarısız" : "Analysis Failed")}
                                message={error.message}
                                onRetry={startBreakdown}
                                retryLabel={t.common.retry}
                            />
                        ) : (
                            <>
                                <View style={styles.promptHeader}>
                                    <Brain size={24} color={colors.action} style={{ marginBottom: spacing.sm }} />
                                    <Text style={styles.prompt}>
                                        {t.newTask.prompt}{"\n"}
                                        <Text style={styles.promptSub}>{t.newTask.promptSub}</Text>
                                    </Text>
                                </View>

                                <TextInput
                                    style={[styles.input, isOverLimit && styles.inputError]}
                                    placeholder={t.newTask.placeholder}
                                    placeholderTextColor={colors.textSecondary}
                                    value={task}
                                    onChangeText={(text) => {
                                        setTask(text);
                                        if (error) setError(null);
                                    }}
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
                                            {remainingBreakdowns} {language === 'tr' ? 'analiz hakkın kaldı' : 'analysis left today'}
                                        </Text>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </ScrollView>

                {/* Footer */}
                {!isLoading && !error && (
                    <View style={styles.footer}>
                        <HapticButton
                            variant={canUseBreakdown ? "primary" : "secondary"}
                            size="lg"
                            fullWidth
                            onPress={handleBreakdown}
                            disabled={!task.trim() || isOverLimit}
                            leftIcon={canUseBreakdown ? <Rocket size={20} color={colors.bg} /> : undefined}
                        >
                            {canUseBreakdown ? t.newTask.analyze.replace(' 🚀', '') : t.newTask.unlock}
                        </HapticButton>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    cancelText: {
        fontSize: typography.base,
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
        flex: 1,
    },
    promptHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: spacing.md,
        marginBottom: spacing.md,
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
    scrollContent: {
        flexGrow: 1,
    },
});
