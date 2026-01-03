
import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { HapticButton } from '../HapticButton';
import { useHaptics } from '@/hooks/useHaptics';
import { useTaskStore } from '@/stores/task.store';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles } from 'lucide-react-native';

interface ForgivenessModalProps {
    visible: boolean;
    taskTitle: string;
    onClose: () => void;
}

export const ForgivenessModal = ({ visible, taskTitle, onClose }: ForgivenessModalProps) => {
    const { t } = useTranslation();
    const haptics = useHaptics();
    const forgiveTask = useTaskStore((state) => state.forgiveTask);

    const handleForgive = () => {
        haptics.success();
        forgiveTask();
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.container}>
                    <Sparkles size={48} color={colors.action} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.title}>{t.forgiveness.title}</Text>
                    <Text style={styles.subtitle}>
                        {t.forgiveness.subtitle}
                        {'\n'}"<Text style={styles.taskHighlight}>{taskTitle}</Text>"
                    </Text>

                    <Text style={styles.description}>
                        {t.forgiveness.description}
                    </Text>

                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleForgive}
                        style={styles.button}
                    >
                        {t.forgiveness.action}
                    </HapticButton>

                    <HapticButton
                        variant="ghost"
                        size="md"
                        onPress={onClose}
                    >
                        {t.forgiveness.cancel}
                    </HapticButton>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    container: {
        width: '100%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    emoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.lg,
    },
    taskHighlight: {
        color: colors.action,
        fontWeight: '700',
        fontStyle: 'italic',
    },
    description: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    button: {
        marginBottom: spacing.md,
    },
});
