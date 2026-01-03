
import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Shuffle, Zap, Plus, Sparkles } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius, glassTokens } from '@/constants/theme';
import { useTaskStore } from '@/stores/task.store';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';
import { router } from 'expo-router';

interface ShakeUnstuckModalProps {
    visible: boolean;
    onClose: () => void;
}

export const ShakeUnstuckModal = ({ visible, onClose }: ShakeUnstuckModalProps) => {
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const haptics = useHaptics();
    const { language } = useTranslation();

    // Store access
    const currentTask = useTaskStore((state) => state.currentTask);
    const backlog = useTaskStore((state) => state.backlog);
    const jumpToCandy = useTaskStore((state) => state.jumpToCandy);
    const resumeFromBacklog = useTaskStore((state) => state.resumeFromBacklog);

    // Determine what to suggest
    const hasCurrentTask = !!currentTask;
    const hasCandyStep = currentTask?.microSteps.some(s => !s.isCompleted && (s.isCandy || s.difficultyScore === 1));
    const hasBacklog = backlog.length > 0;
    const randomBacklogTask = hasBacklog ? backlog[Math.floor(Math.random() * backlog.length)] : null;

    useEffect(() => {
        if (visible) {
            // Shake haptic feedback
            haptics.shake();

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

    const handleJumpToCandy = () => {
        jumpToCandy();
        haptics.candyJump();
        onClose();
    };

    const handleResumeBacklog = () => {
        if (randomBacklogTask) {
            resumeFromBacklog(randomBacklogTask.id);
            haptics.medium();
            onClose();
        }
    };

    const handleCreateNew = () => {
        router.push('/(main)/new-task');
        onClose();
    };

    // State 1: Has current task with candy step
    if (hasCurrentTask && hasCandyStep) {
        return (
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    <Animated.View style={[styles.container, { transform: [{ scale: shakeAnim }] }]}>
                        <View style={styles.iconContainer}>
                            <Zap size={32} color={colors.action} />
                        </View>
                        <Text style={styles.label}>{language === 'tr' ? 'SALLAMA TESPİT EDİLDİ' : 'SHAKE DETECTED'}</Text>
                        <Text style={styles.title}>
                            {language === 'tr' ? 'Takıldın mı? Kolay olanı yap!' : 'Stuck? Jump to the easy one!'}
                        </Text>
                        <Text style={styles.subtitle}>
                            {language === 'tr' ? 'Görevindeki en kolay adıma atla.' : 'Skip to the candy step in your task.'}
                        </Text>

                        <TouchableOpacity style={styles.primaryButton} onPress={handleJumpToCandy}>
                            <Zap size={18} color="#FFF" />
                            <Text style={styles.primaryButtonText}>
                                {language === 'tr' ? 'Kolay Adıma Atla' : 'Jump to Easy Win'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                            <Text style={styles.secondaryButtonText}>
                                {language === 'tr' ? 'Hayır, devam' : 'Nah, I\'m fine'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    // State 2: Has backlog tasks
    if (hasBacklog && randomBacklogTask) {
        return (
            <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
                <View style={styles.overlay}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                    <Animated.View style={[styles.container, { transform: [{ scale: shakeAnim }] }]}>
                        <View style={styles.iconContainer}>
                            <Shuffle size={32} color={colors.action} />
                        </View>
                        <Text style={styles.label}>{language === 'tr' ? 'RASTGELE GÖREV' : 'RANDOM TASK'}</Text>
                        <Text style={styles.title}>
                            {language === 'tr' ? 'Bunu dene!' : 'Try this one!'}
                        </Text>

                        <View style={styles.card}>
                            <Text style={styles.taskTitle} numberOfLines={2}>{randomBacklogTask.originalText}</Text>
                            <View style={styles.metaRow}>
                                {randomBacklogTask.estimatedMinutes && (
                                    <Text style={styles.metaTag}>⏱ {randomBacklogTask.estimatedMinutes}m</Text>
                                )}
                                <Text style={styles.metaTag}>
                                    {randomBacklogTask.microSteps.length} {language === 'tr' ? 'adım' : 'steps'}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.primaryButton} onPress={handleResumeBacklog}>
                            <Sparkles size={18} color="#FFF" />
                            <Text style={styles.primaryButtonText}>
                                {language === 'tr' ? 'Hadi Başla!' : 'Let\'s Do It!'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                            <Text style={styles.secondaryButtonText}>
                                {language === 'tr' ? 'Başka zaman' : 'Maybe later'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        );
    }

    // State 3: No tasks - encourage creating new one
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                <Animated.View style={[styles.container, { transform: [{ scale: shakeAnim }] }]}>
                    <View style={styles.iconContainer}>
                        <Plus size={32} color={colors.action} />
                    </View>
                    <Text style={styles.label}>{language === 'tr' ? 'TEMİZ SAYFA' : 'CLEAN SLATE'}</Text>
                    <Text style={styles.title}>
                        {language === 'tr' ? 'Harika! Tüm işler tamam.' : 'All caught up!'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {language === 'tr' ? 'Yeni bir şey başlatmak ister misin?' : 'Want to start something new?'}
                    </Text>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleCreateNew}>
                        <Plus size={18} color="#FFF" />
                        <Text style={styles.primaryButtonText}>
                            {language === 'tr' ? 'Yeni Görev Oluştur' : 'Create New Task'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                        <Text style={styles.secondaryButtonText}>
                            {language === 'tr' ? 'Şimdilik yok' : 'Nope, I\'m good'}
                        </Text>
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
        flexDirection: 'row',
        backgroundColor: colors.action,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
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
