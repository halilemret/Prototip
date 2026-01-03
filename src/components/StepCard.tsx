import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MicroStep } from '@/types';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';
import HapticButton from './HapticButton';
import { useTranslation } from '@/hooks/useTranslation';

interface StepCardProps {
    step: MicroStep;
    stepNumber: number;
    totalSteps: number;
    onComplete: () => void;
    onSkip: () => void;
    isCompleting?: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({
    step,
    stepNumber,
    totalSteps,
    onComplete,
    onSkip,
    isCompleting = false,
}) => {
    const { t } = useTranslation();

    const getDifficultyIndicator = () => {
        if (step.isCandy) return '🍬';

        switch (step.difficultyScore) {
            case 1: return '💚';
            case 2: return '💛';
            case 3: return '🧡';
            default: return '';
        }
    };

    return (
        <View style={styles.container}>
            {/* Progress indicator */}
            <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                    {t.focus.stepLabel} {stepNumber} {t.focus.ofLabel} {totalSteps}
                </Text>
                <Text style={styles.difficultyIcon}>
                    {getDifficultyIndicator()}
                </Text>
            </View>

            {/* Step content */}
            <View style={styles.content}>
                <Text style={styles.stepText}>
                    {step.text}
                </Text>
            </View>

            {/* Candy badge */}
            {step.isCandy && (
                <View style={styles.candyBadge}>
                    <Text style={styles.candyText}>{t.focus.easyWinBadge}</Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                <HapticButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    hapticType="heavy"
                    onPress={onComplete}
                    isLoading={isCompleting}
                >
                    {t.focus.doneAction}
                </HapticButton>

                <HapticButton
                    variant="ghost"
                    size="md"
                    hapticType="light"
                    onPress={onSkip}
                    style={styles.skipButton}
                >
                    {t.focus.skipAction}
                </HapticButton>
            </View>
        </View>
    );
};

// Compact version for previews
interface StepPreviewProps {
    step: Omit<MicroStep, 'isCompleted' | 'completedAt'>;
    index: number;
    isBlurred?: boolean;
}

export const StepPreview: React.FC<StepPreviewProps> = ({
    step,
    index,
    isBlurred = false,
}) => {
    return (
        <View style={[styles.previewContainer, isBlurred && styles.previewBlurred]}>
            <View style={styles.previewNumber}>
                <Text style={styles.previewNumberText}>{index + 1}</Text>
            </View>
            <Text
                style={[styles.previewText, isBlurred && styles.previewTextBlurred]}
                numberOfLines={2}
            >
                {step.text}
            </Text>
            {step.isCandy && (
                <Text style={styles.previewCandy}>🍬</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        ...shadows.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    progressText: {
        fontSize: typography.sm,
        color: colors.muted,
        fontWeight: '600',
        letterSpacing: 2,
    },
    difficultyIcon: {
        fontSize: 20,
    },
    content: {
        paddingVertical: spacing.xl,
        minHeight: 120,
        justifyContent: 'center',
    },
    stepText: {
        fontSize: typography['2xl'],
        color: colors.text,
        fontWeight: '500',
        lineHeight: 34,
        textAlign: 'center',
    },
    candyBadge: {
        alignSelf: 'center',
        backgroundColor: colors.actionMuted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginBottom: spacing.lg,
    },
    candyText: {
        color: colors.action,
        fontSize: typography.sm,
        fontWeight: '600',
    },
    actions: {
        marginTop: spacing.lg,
    },
    skipButton: {
        marginTop: spacing.md,
        alignSelf: 'center',
    },

    // Preview styles
    previewContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    previewBlurred: {
        opacity: 0.4,
    },
    previewNumber: {
        width: 28,
        height: 28,
        borderRadius: borderRadius.full,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    previewNumberText: {
        color: colors.muted,
        fontSize: typography.sm,
        fontWeight: '700',
    },
    previewText: {
        flex: 1,
        color: colors.text,
        fontSize: typography.base,
    },
    previewTextBlurred: {
        color: colors.muted,
    },
    previewCandy: {
        marginLeft: spacing.sm,
        fontSize: 16,
    },
});

export default StepCard;
