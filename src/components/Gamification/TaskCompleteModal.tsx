
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { HapticButton } from '../HapticButton';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MoodLevel } from '@/types';
import { MOOD_EMOJIS } from '@/constants/app';
import { useTranslation } from '@/hooks/useTranslation';
import { Trophy, BatteryLow, BatteryMedium, BatteryFull, Zap, Battery } from 'lucide-react-native';

const MoodIconRenderer = ({ name, size = 32, color = colors.text }: { name: string, size?: number, color?: string }) => {
    switch (name) {
        case 'BatteryLow': return <BatteryLow size={size} color={color} />;
        case 'BatteryMedium': return <BatteryMedium size={size} color={color} />;
        case 'BatteryFull': return <BatteryFull size={size} color={color} />;
        case 'Zap': return <Zap size={size} color={color} />;
        default: return <Battery size={size} color={color} />;
    }
};

interface TaskCompleteModalProps {
    visible: boolean;
    xpEarned: number;
    onComplete: (mood: MoodLevel) => void;
}

export const TaskCompleteModal = ({ visible, xpEarned, onComplete }: TaskCompleteModalProps) => {
    const { t } = useTranslation();
    const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);

    const handleConfirm = () => {
        if (selectedMood) {
            onComplete(selectedMood);
        }
    };

    const MoodButton = ({ mood, label }: { mood: MoodLevel, label: string }) => (
        <Pressable
            style={[
                styles.moodButton,
                selectedMood === mood && styles.moodButtonSelected
            ]}
            onPress={() => setSelectedMood(mood)}
        >
            <View style={{ marginBottom: spacing.sm }}>
                <MoodIconRenderer
                    name={MOOD_EMOJIS[mood]}
                    color={selectedMood === mood ? colors.action : colors.muted}
                />
            </View>
            <Text style={[
                styles.moodLabel,
                selectedMood === mood && styles.moodLabelSelected
            ]}>{label}</Text>
        </Pressable>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Trophy size={64} color={colors.action} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.title}>{t.modals.taskComplete}</Text>

                    <View style={styles.xpContainer}>
                        <Text style={styles.xpText}>+{xpEarned} XP</Text>
                    </View>

                    <Text style={styles.question}>{t.mood.question}</Text>

                    <View style={styles.moodGrid}>
                        <MoodButton mood={1} label={t.mood.m1} />
                        <MoodButton mood={3} label={t.mood.okay} />
                        <MoodButton mood={5} label={t.mood.energized} />
                    </View>

                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleConfirm}
                        isDisabled={!selectedMood}
                        style={styles.confirmButton}
                    >
                        {t.modals.collectAndFinish}
                    </HapticButton>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography['2xl'],
        fontWeight: '900',
        color: colors.text,
        marginBottom: spacing.md,
        letterSpacing: 1,
    },
    xpContainer: {
        backgroundColor: 'rgba(255, 107, 53, 0.15)', // Active color with opacity
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.action,
    },
    xpText: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.action,
    },
    question: {
        fontSize: typography.lg,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    moodGrid: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    moodButton: {
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
        minWidth: 90,
    },
    moodButtonSelected: {
        borderColor: colors.action,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
    },
    moodEmoji: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    moodLabel: {
        fontSize: typography.sm,
        color: colors.muted,
        fontWeight: '600',
    },
    moodLabelSelected: {
        color: colors.action,
    },
    confirmButton: {
        marginTop: spacing.sm,
        shadowColor: colors.action,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
        elevation: 10,
    },
});
