// ============================================
// ONYX - First Breakdown Screen (Onboarding Phase 3)
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton, StepPreview } from '@/components';
import { useTaskStore } from '@/stores/task.store';
import { useHaptics } from '@/hooks/useHaptics';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { Sparkles, Zap } from 'lucide-react-native';

export default function FirstBreakdownScreen() {
    const { colors } = useTheme();
    const haptics = useHaptics();
    const currentTask = useTaskStore((state) => state.currentTask);

    // Animation refs for staggered reveal
    const animations = useRef<Animated.Value[]>([]).current;

    useEffect(() => {
        if (!currentTask) return;

        // Initialize animation values
        currentTask.microSteps.forEach((_, index) => {
            if (!animations[index]) {
                animations[index] = new Animated.Value(0);
            }
        });

        // Staggered animation
        const staggerAnimation = Animated.stagger(
            150,
            animations.slice(0, Math.min(currentTask.microSteps.length, 5)).map((anim) =>
                Animated.spring(anim, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                })
            )
        );

        // Small delay before starting
        setTimeout(() => {
            haptics.success();
            staggerAnimation.start();
        }, 300);
    }, [currentTask, animations, haptics]);

    const handleContinue = () => {
        // Navigate to personalization (Sunk Cost screen) instead of main
        router.push('/(onboarding)/personalize');
    };

    const styles = createStyles(colors);

    if (!currentTask) {
        return null;
    }

    const visibleSteps = currentTask.microSteps.slice(0, 5);
    const hiddenCount = Math.max(0, currentTask.microSteps.length - 5);
    const candyStep = currentTask.microSteps.find((s) => s.isCandy);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Sparkles size={48} color={colors.action} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.title}>
                        Here's your breakdown
                    </Text>
                    <Text style={styles.originalTask}>
                        "{currentTask.originalText}"
                    </Text>
                </View>

                {/* Steps Preview */}
                <View style={styles.stepsContainer}>
                    {visibleSteps.map((step, index) => (
                        <Animated.View
                            key={step.id}
                            style={{
                                opacity: animations[index] || 0,
                                transform: [
                                    {
                                        translateY: (animations[index] || new Animated.Value(0)).interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        }),
                                    },
                                ],
                            }}
                        >
                            <StepPreview
                                step={step}
                                index={index}
                                isBlurred={index > 2}
                            />
                        </Animated.View>
                    ))}

                    {hiddenCount > 0 && (
                        <View style={styles.hiddenIndicator}>
                            <Text style={styles.hiddenText}>
                                +{hiddenCount} more steps...
                            </Text>
                        </View>
                    )}
                </View>

                {/* Candy callout */}
                {candyStep && (
                    <View style={styles.candyCallout}>
                        <Zap size={24} color={colors.action} style={{ marginRight: spacing.sm }} />
                        <Text style={styles.candyText}>
                            We'll start with "{candyStep.text}" — the easy win.
                        </Text>
                    </View>
                )}

                {/* CTA */}
                <View style={styles.footer}>
                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        hapticType="heavy"
                        onPress={handleContinue}
                    >
                        This looks doable!
                    </HapticButton>

                    <Text style={styles.estimate}>
                        ~{currentTask.estimatedMinutes} min total
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    emoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
    },
    originalTask: {
        fontSize: typography.base,
        color: colors.muted,
        marginTop: spacing.sm,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    stepsContainer: {
        flex: 1,
    },
    hiddenIndicator: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    hiddenText: {
        color: colors.muted,
        fontSize: typography.sm,
    },
    candyCallout: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.actionMuted,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.xl,
    },
    candyEmoji: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    candyText: {
        flex: 1,
        color: colors.action,
        fontSize: typography.sm,
        fontWeight: '500',
    },
    footer: {
        paddingBottom: spacing.xl,
    },
    estimate: {
        textAlign: 'center',
        color: colors.muted,
        fontSize: typography.sm,
        marginTop: spacing.md,
    },
});
