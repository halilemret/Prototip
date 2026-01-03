// ============================================
// ONYX - Achievement Badge Component
// Liquid Glass styled badge for Museum of Done
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import {
    Flame, Trophy, Crown, Footprints, ListChecks, Rocket,
    Sparkles, Award, Candy, Timer, Heart, Moon, Sun, Lock, X, CheckCircle2
} from 'lucide-react-native';
import { Achievement } from '@/stores/achievement.store';
import { useTheme } from '@/hooks/useTheme';
import { GlassSurface } from '@/components/Glass';
import { spacing, typography, borderRadius, glassTokens } from '@/constants/theme';

interface AchievementBadgeProps {
    achievement: Achievement;
    isUnlocked: boolean;
    progress?: number;
    language?: 'en' | 'tr';
}

const iconMap: Record<string, React.FC<any>> = {
    Flame,
    Trophy,
    Crown,
    Footprints,
    ListChecks,
    Rocket,
    Sparkles,
    Award,
    Candy,
    Timer,
    Heart,
    Moon,
    Sun,
};

// How to unlock each achievement
const unlockHints: Record<string, { en: string; tr: string }> = {
    streak_3: { en: 'Complete tasks 3 days in a row', tr: '3 gün üst üste görev tamamla' },
    streak_7: { en: 'Keep your streak going for 7 days', tr: '7 gün boyunca serini koru' },
    streak_30: { en: 'Maintain a 30-day streak!', tr: '30 günlük seri yap!' },
    first_task: { en: 'Complete your very first task', tr: 'İlk görevini tamamla' },
    tasks_10: { en: 'Complete 10 tasks total', tr: 'Toplam 10 görev tamamla' },
    tasks_25: { en: 'Complete 25 tasks total', tr: 'Toplam 25 görev tamamla' },
    tasks_50: { en: 'Complete 50 tasks total', tr: 'Toplam 50 görev tamamla' },
    tasks_100: { en: 'Complete 100 tasks - you\'re a pro!', tr: '100 görev tamamla - profesyonelsin!' },
    candy_lover: { en: 'Use "Easy Win" jump 10 times', tr: '"Kolay Kazan" atlama 10 kez kullan' },
    bet_master: { en: 'Win 5 time bets', tr: '5 zaman bahsi kazan' },
    forgiveness: { en: 'Use the Forgiveness Protocol to pause a task', tr: 'Bir görevi duraklatmak için Affetme Protokolünü kullan' },
    night_owl: { en: 'Complete a task between midnight and 5 AM', tr: 'Gece yarısı ile 05:00 arası görev tamamla' },
    early_bird: { en: 'Complete a task between 5 AM and 7 AM', tr: 'Sabah 05:00 ile 07:00 arası görev tamamla' },
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    achievement,
    isUnlocked,
    progress = 0,
    language = 'en',
}) => {
    const { colors, theme } = useTheme();
    const isDark = theme === 'dark';
    const [showModal, setShowModal] = useState(false);

    const styles = createStyles(colors, isUnlocked);

    const IconComponent = iconMap[achievement.icon] || Award;
    const name = language === 'tr' ? achievement.nameTr : achievement.name;
    const description = language === 'tr' ? achievement.descriptionTr : achievement.description;
    const hint = unlockHints[achievement.id]?.[language] || description;

    return (
        <>
            <Pressable onPress={() => setShowModal(true)} style={styles.pressable}>
                <GlassSurface
                    variant="card"
                    intensity={isUnlocked ? 'medium' : 'light'}
                    accentGlow={isUnlocked}
                    style={styles.container}
                >
                    {/* Icon Circle */}
                    <View style={styles.iconContainer}>
                        {isUnlocked ? (
                            <IconComponent
                                size={28}
                                color={colors.action}
                                fill={achievement.category === 'streak' ? colors.action : undefined}
                            />
                        ) : (
                            <View style={styles.lockedIcon}>
                                <Lock size={20} color={colors.muted} />
                            </View>
                        )}
                    </View>

                    {/* Name */}
                    <Text
                        style={[styles.name, !isUnlocked && styles.lockedText]}
                        numberOfLines={2}
                    >
                        {name}
                    </Text>

                    {/* Progress indicator for locked */}
                    {!isUnlocked && (
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{progress}%</Text>
                        </View>
                    )}

                    {/* Unlocked checkmark */}
                    {isUnlocked && (
                        <CheckCircle2 size={14} color={colors.success} style={styles.checkmark} />
                    )}
                </GlassSurface>
            </Pressable>

            {/* Detail Modal */}
            <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
                    <BlurView intensity={60} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
                        <Pressable onPress={() => setShowModal(false)} style={styles.modalClose}>
                            <X size={24} color={colors.muted} />
                        </Pressable>

                        {/* Icon */}
                        <View style={[styles.modalIcon, isUnlocked && styles.modalIconUnlocked]}>
                            <IconComponent
                                size={40}
                                color={isUnlocked ? colors.action : colors.muted}
                            />
                        </View>

                        {/* Status */}
                        <Text style={[styles.modalStatus, isUnlocked && styles.modalStatusUnlocked]}>
                            {isUnlocked
                                ? (language === 'tr' ? '✓ KAZANILDI' : '✓ UNLOCKED')
                                : (language === 'tr' ? '🔒 KİLİTLİ' : '🔒 LOCKED')
                            }
                        </Text>

                        {/* Name */}
                        <Text style={styles.modalName}>{name}</Text>

                        {/* Description */}
                        <Text style={styles.modalDescription}>{description}</Text>

                        {/* How to unlock (for locked) */}
                        {!isUnlocked && (
                            <View style={styles.hintContainer}>
                                <Text style={styles.hintLabel}>
                                    {language === 'tr' ? 'Nasıl Kazanılır?' : 'How to Unlock:'}
                                </Text>
                                <Text style={styles.hintText}>{hint}</Text>

                                {/* Progress bar */}
                                <View style={styles.modalProgressBar}>
                                    <View style={[styles.modalProgressFill, { width: `${progress}%` }]} />
                                </View>
                                <Text style={styles.modalProgressText}>
                                    {progress}% {language === 'tr' ? 'tamamlandı' : 'complete'}
                                </Text>
                            </View>
                        )}

                        {/* When unlocked */}
                        {isUnlocked && (
                            <Text style={styles.unlockedDate}>
                                🎉 {language === 'tr' ? 'Tebrikler!' : 'Congratulations!'}
                            </Text>
                        )}
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

const createStyles = (colors: any, isUnlocked: boolean) => StyleSheet.create({
    pressable: {
        width: '31%',
        margin: spacing.xs,
    },
    container: {
        width: '100%',
        aspectRatio: 0.85,
        padding: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isUnlocked ? 1 : 0.7,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: borderRadius.full,
        backgroundColor: isUnlocked ? colors.actionMuted : colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        borderWidth: isUnlocked ? 2 : 1,
        borderColor: isUnlocked ? colors.action : colors.border,
    },
    lockedIcon: {
        opacity: 0.5,
    },
    name: {
        fontSize: typography.xs,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    lockedText: {
        color: colors.muted,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '80%',
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.action,
        borderRadius: 2,
    },
    progressText: {
        fontSize: 9,
        color: colors.muted,
        marginTop: 2,
    },
    checkmark: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
    },
    lockedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    modalContent: {
        width: '100%',
        maxWidth: 320,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    modalClose: {
        position: 'absolute',
        top: spacing.md,
        right: spacing.md,
        padding: spacing.xs,
    },
    modalIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
    },
    modalIconUnlocked: {
        backgroundColor: colors.actionMuted,
        borderColor: colors.action,
    },
    modalStatus: {
        fontSize: typography.xs,
        fontWeight: '700',
        color: colors.muted,
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    modalStatusUnlocked: {
        color: colors.success,
    },
    modalName: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    modalDescription: {
        fontSize: typography.base,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    hintContainer: {
        width: '100%',
        backgroundColor: colors.elevated,
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    hintLabel: {
        fontSize: typography.xs,
        fontWeight: '600',
        color: colors.action,
        marginBottom: spacing.xs,
    },
    hintText: {
        fontSize: typography.sm,
        color: colors.text,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    modalProgressBar: {
        width: '100%',
        height: 6,
        backgroundColor: colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    modalProgressFill: {
        height: '100%',
        backgroundColor: colors.action,
        borderRadius: 3,
    },
    modalProgressText: {
        fontSize: typography.xs,
        color: colors.muted,
        marginTop: spacing.xs,
    },
    unlockedDate: {
        fontSize: typography.lg,
        color: colors.action,
        fontWeight: '600',
    },
});

export default AchievementBadge;
