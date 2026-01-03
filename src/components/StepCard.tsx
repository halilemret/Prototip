import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Candy, Circle, Zap } from 'lucide-react-native';
import { MicroStep } from '@/types';
import { spacing, borderRadius, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import HapticButton from './HapticButton';
import { GlassSurface } from './Glass';
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
    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = createStyles(colors);

    const getDifficultyIndicator = () => {
        if (step.isCandy) {
            return <Candy size={20} color={colors.action} />;
        }

        switch (step.difficultyScore) {
            case 1:
                return <Circle size={18} color={colors.success} fill={colors.success} />;
            case 2:
                return <Circle size={18} color={colors.warning} fill={colors.warning} />;
            case 3:
                return <Circle size={18} color={colors.danger} fill={colors.danger} />;
            default:
                return null;
        }
    };

    return (
        <GlassSurface
            variant="card"
            intensity="medium"
            accentGlow={step.isCandy}
            style={styles.container}
        >
            {/* Progress indicator */}
            <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                    {t.focus.stepLabel} {stepNumber} {t.focus.ofLabel} {totalSteps}
                </Text>
                <View style={styles.difficultyIcon}>
                    {getDifficultyIndicator()}
                </View>
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
                    <Zap size={14} color={colors.action} />
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
        </GlassSurface>
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
    const { colors } = useTheme();
    const styles = createStyles(colors);

    return (
        <GlassSurface
            variant="surface"
            intensity="light"
            noShadow
            style={isBlurred
                ? { ...styles.previewContainer, ...styles.previewBlurred }
                : styles.previewContainer
            }
        >
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
                <Candy size={16} color={colors.action} />
            )}
        </GlassSurface>
    );
};

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        padding: spacing.xl,
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
        textTransform: 'uppercase',
    },
    difficultyIcon: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
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
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: colors.actionMuted,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        marginBottom: spacing.lg,
        gap: spacing.xs,
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
        padding: spacing.md,
        marginBottom: spacing.sm,
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
});

export default StepCard;
