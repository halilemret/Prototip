// ============================================
// ONYX - First Task Screen (Onboarding Phase 2)
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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton } from '@/components';
import { useUserStore } from '@/stores/user.store';
import { useTaskStore } from '@/stores/task.store';
import { AIService } from '@/services/ai.service';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MAX_TASK_LENGTH } from '@/constants/app';
import { Sparkles } from 'lucide-react-native';

export default function FirstTaskScreen() {
    const [task, setTask] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const currentMood = useUserStore((state) => state.currentMood);
    const incrementBreakdownCount = useUserStore((state) => state.incrementBreakdownCount);
    const createTaskFromBreakdown = useTaskStore((state) => state.createTaskFromBreakdown);

    const placeholders = [
        "Clean my room",
        "Do my laundry",
        "Start that project",
        "Reply to emails",
        "Go to the gym",
    ];

    const [placeholder] = useState(
        placeholders[Math.floor(Math.random() * placeholders.length)]
    );

    const handleBreakdown = async () => {
        if (!task.trim()) {
            Alert.alert('Wait', "Tell me what's been haunting you first.");
            return;
        }

        if (!AIService.isConfigured()) {
            Alert.alert(
                'Setup Required',
                'Gemini API key is not configured. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.',
                [{ text: 'OK' }]
            );
            return;
        }

        setIsLoading(true);

        try {
            const result = await AIService.magicBreakdown({
                taskText: task.trim(),
                moodLevel: currentMood,
                preferEasyFirst: true,
            });

            if (result.success) {
                // Create task from breakdown
                createTaskFromBreakdown(result.data, currentMood);

                // Increment usage counter
                incrementBreakdownCount();

                // Navigate to breakdown preview
                router.push('/(onboarding)/first-breakdown');
            } else {
                Alert.alert('Oops', result.error.message);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
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
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>
                            What's been{'\n'}haunting you?
                        </Text>
                        <Text style={styles.subtitle}>
                            That task you keep avoiding. Say it.
                        </Text>
                    </View>

                    {/* Input */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={[
                                styles.input,
                                isOverLimit && styles.inputError,
                            ]}
                            placeholder={placeholder}
                            placeholderTextColor={colors.muted}
                            value={task}
                            onChangeText={setTask}
                            multiline
                            maxLength={MAX_TASK_LENGTH + 20}
                            autoFocus
                            returnKeyType="done"
                        />
                        <Text style={[
                            styles.charCount,
                            isOverLimit && styles.charCountError,
                        ]}>
                            {charCount}/{MAX_TASK_LENGTH}
                        </Text>
                    </View>

                    {/* CTA */}
                    <View style={styles.footer}>
                        <HapticButton
                            variant="primary"
                            size="lg"
                            fullWidth
                            hapticType="heavy"
                            onPress={handleBreakdown}
                            isLoading={isLoading}
                            isDisabled={!task.trim() || isOverLimit}
                            leftIcon={<Sparkles size={20} color={colors.bg} />}
                        >
                            Break it down
                        </HapticButton>

                        <Text style={styles.hint}>
                            I'll turn this into tiny, stupid-simple steps.
                        </Text>
                    </View>
                </View>
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
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
        justifyContent: 'space-between',
    },
    header: {
        paddingTop: spacing.xl,
    },
    title: {
        fontSize: typography['4xl'],
        fontWeight: '700',
        color: colors.text,
        lineHeight: 44,
    },
    subtitle: {
        fontSize: typography.lg,
        color: colors.muted,
        marginTop: spacing.md,
    },
    inputContainer: {
        flex: 1,
        justifyContent: 'center',
        marginVertical: spacing.xl,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.border,
        padding: spacing.lg,
        fontSize: typography.xl,
        color: colors.text,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: colors.danger,
    },
    charCount: {
        alignSelf: 'flex-end',
        marginTop: spacing.sm,
        fontSize: typography.sm,
        color: colors.muted,
    },
    charCountError: {
        color: colors.danger,
    },
    footer: {
        paddingBottom: spacing.xl,
    },
    hint: {
        textAlign: 'center',
        color: colors.muted,
        fontSize: typography.sm,
        marginTop: spacing.md,
    },
});
