
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/constants/theme';
import { useTaskStore } from '@/stores/task.store';

export const ActiveBetTimer = () => {
    const currentTask = useTaskStore((state) => state.currentTask);
    const [timeLeft, setTimeLeft] = useState<string | null>(null);
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        if (!currentTask?.betStartTime || !currentTask?.betDurationMinutes) {
            setTimeLeft(null);
            return;
        }

        const endTime = currentTask.betStartTime + (currentTask.betDurationMinutes * 60000);

        const tick = () => {
            const now = Date.now();
            const diff = endTime - now;

            if (diff <= 0) {
                setTimeLeft("00:00");
                setIsUrgent(true);
                return;
            }

            const m = Math.floor(diff / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
            setIsUrgent(diff < 60000); // Red if < 1 minute
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [currentTask]);

    if (!timeLeft) return null;

    return (
        <View style={[styles.container, isUrgent && styles.urgentContainer]}>
            <Text style={styles.icon}>{isUrgent ? '🔥' : '⏱️'}</Text>
            <Text style={[styles.time, isUrgent && styles.urgentTime]}>
                {timeLeft}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.elevated,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.border,
        gap: 6,
    },
    urgentContainer: {
        borderColor: colors.danger,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    icon: {
        fontSize: 12,
    },
    time: {
        fontSize: typography.sm,
        fontWeight: '700',
        color: colors.textSecondary,
        fontVariant: ['tabular-nums'],
    },
    urgentTime: {
        color: colors.danger,
    },
});
