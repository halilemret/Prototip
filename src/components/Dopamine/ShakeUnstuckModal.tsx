
import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useTaskStore } from '@/stores/task.store';
import { router } from 'expo-router';

interface ShakeUnstuckModalProps {
    visible: boolean;
    onClose: () => void;
}

export const ShakeUnstuckModal = ({ visible, onClose }: ShakeUnstuckModalProps) => {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Store access
    const suggestTask = useTaskStore((state) => {
        // Find a random easy or quick task
        // Use 'backlog' (or whatever array holds pending tasks)
        // If backlog is undefined, fallback to empty array
        const tasks = state.backlog || [];
        const candidates = tasks.filter((t: any) => !t.isCompleted && (t.effort === 'easy' || t.duration <= 15));
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    });

    useEffect(() => {
        if (visible) {
            // Fun bounce animation on mount
            Animated.spring(shakeAnim, {
                toValue: 1,
                friction: 4,
                tension: 40,
                useNativeDriver: true,
            }).start();
        } else {
            shakeAnim.setValue(0);
        }
    }, [visible]);

    const handleStartTask = () => {
        if (suggestTask) {
            useTaskStore.getState().setCurrentTask(suggestTask);
            router.push('/'); // Navigate to Focus view
            onClose();
        }
    };

    if (!suggestTask) {
        // Fallback UI if no easy tasks found
        return (
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    <View style={styles.container}>
                        <Text style={styles.emoji}>🤷‍♂️</Text>
                        <Text style={styles.title}>All Caught Up!</Text>
                        <Text style={styles.subtitle}>No quick wins found in your backlog. Great job!</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Text style={styles.buttonText}>Nice.</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

                <Animated.View style={[styles.container, { transform: [{ scale: shakeAnim }] }]}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.emoji}>🎲</Text>
                    </View>

                    <Text style={styles.label}>CHAOS DETECTED</Text>
                    <Text style={styles.title}>Stuck? Do this *one* thing.</Text>

                    <View style={styles.card}>
                        <Text style={styles.taskTitle}>{suggestTask.title || suggestTask.originalText}</Text>
                        <View style={styles.metaRow}>
                            {suggestTask.estimatedMinutes && <Text style={styles.metaTag}>⏱ {suggestTask.estimatedMinutes}m</Text>}
                            <Text style={styles.metaTag}>⚡ Easy Win</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleStartTask}>
                        <Text style={styles.primaryButtonText}>🚀 Just Do It</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                        <Text style={styles.secondaryButtonText}>Nah, I'm good</Text>
                    </TouchableOpacity>
                </Animated.View>
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.bg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    emoji: {
        fontSize: 32,
    },
    label: {
        fontSize: typography.xs,
        fontWeight: 'bold',
        color: colors.action,
        letterSpacing: 1.5,
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    card: {
        width: '100%',
        backgroundColor: colors.bg,
        padding: spacing.lg,
        borderRadius: borderRadius.lg,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.actionMuted,
    },
    taskTitle: {
        fontSize: typography.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.sm,
    },
    metaTag: {
        fontSize: typography.xs,
        color: colors.muted,
        backgroundColor: colors.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        overflow: 'hidden',
    },
    primaryButton: {
        width: '100%',
        backgroundColor: colors.action,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: typography.base,
        fontWeight: '600',
    },
    secondaryButton: {
        padding: spacing.sm,
    },
    secondaryButtonText: {
        color: colors.muted,
        fontSize: typography.sm,
    },
    closeButton: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.lg,
    },
    buttonText: {
        color: colors.text,
        fontWeight: '600',
    },
});
