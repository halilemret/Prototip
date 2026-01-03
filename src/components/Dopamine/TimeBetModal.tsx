
import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useTaskStore } from '@/stores/task.store';
import { useTranslation } from '@/hooks/useTranslation';
import { Timer } from 'lucide-react-native';

interface TimeBetModalProps {
    visible: boolean;
    onClose: () => void;
}

export const TimeBetModal = ({ visible, onClose }: TimeBetModalProps) => {
    const { t, language } = useTranslation();
    const placeBet = useTaskStore((state) => state.placeBet);

    const BET_OPTIONS = [
        { label: language === 'tr' ? '10 dk' : '10m', value: 10 },
        { label: language === 'tr' ? '25 dk' : '25m', value: 25 },
        { label: language === 'tr' ? '45 dk' : '45m', value: 45 },
    ];

    const handleBet = (minutes: number) => {
        placeBet(minutes);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

                <View style={styles.container}>
                    <Timer size={44} color={colors.action} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.title}>{t.timeBet.title}</Text>
                    <Text style={styles.subtitle}>
                        {t.timeBet.subtitle} <Text style={{ color: colors.action }}>2x XP</Text>.
                        {'\n'}{t.timeBet.failNote}
                    </Text>

                    <View style={styles.optionsContainer}>
                        {BET_OPTIONS.map((opt) => (
                            <TouchableOpacity
                                key={opt.value}
                                style={styles.optionButton}
                                onPress={() => handleBet(opt.value)}
                            >
                                <Text style={styles.optionLabel}>{opt.label}</Text>
                                <Text style={styles.optionValue}>{t.timeBet.xpLabel} 100 XP</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                        <Text style={styles.skipText}>{t.timeBet.skip}</Text>
                    </TouchableOpacity>
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
        padding: spacing.lg,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    emoji: {
        fontSize: 40,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
        width: '100%',
        justifyContent: 'center',
    },
    optionButton: {
        flex: 1,
        backgroundColor: colors.elevated,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    optionLabel: {
        fontSize: typography.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    optionValue: {
        fontSize: typography.xs,
        color: colors.action,
        fontWeight: '600',
    },
    skipButton: {
        padding: spacing.sm,
    },
    skipText: {
        color: colors.muted,
        fontSize: typography.sm,
    },
});
