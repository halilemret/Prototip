// ============================================
// ONYX - Achievement Unlock Toast
// Animated notification when user unlocks a badge
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import {
    Flame, Trophy, Crown, Footprints, ListChecks, Rocket,
    Sparkles, Award, Candy, Timer, Heart, Moon, Sun, X
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { useAchievementStore, UnlockedAchievement } from '@/stores/achievement.store';
import { useTheme } from '@/hooks/useTheme';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing, typography, borderRadius, glassTokens } from '@/constants/theme';

const iconMap: Record<string, React.FC<any>> = {
    Flame, Trophy, Crown, Footprints, ListChecks, Rocket,
    Sparkles, Award, Candy, Timer, Heart, Moon, Sun,
};

export const AchievementUnlockToast: React.FC = () => {
    const { colors, theme } = useTheme();
    const { language } = useTranslation();
    const haptics = useHaptics();
    const isDark = theme === 'dark';

    const recentlyUnlocked = useAchievementStore((state) => state.recentlyUnlocked);
    const clearRecentlyUnlocked = useAchievementStore((state) => state.clearRecentlyUnlocked);

    const slideAnim = useRef(new Animated.Value(-150)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (recentlyUnlocked) {
            // Trigger haptic
            haptics.achievementUnlocked();

            // Animate in
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss after 4 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [recentlyUnlocked]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -150,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            clearRecentlyUnlocked();
        });
    };

    if (!recentlyUnlocked) return null;

    const IconComponent = iconMap[recentlyUnlocked.icon] || Award;
    const name = language === 'tr' ? recentlyUnlocked.nameTr : recentlyUnlocked.name;

    const styles = createStyles(colors, isDark);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                },
            ]}
        >
            <BlurView
                intensity={glassTokens.blur.heavy}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.overlay} />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <IconComponent size={24} color={colors.action} />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.label}>
                        {language === 'tr' ? '🎉 Rozet Kazanıldı!' : '🎉 Achievement Unlocked!'}
                    </Text>
                    <Text style={styles.name}>{name}</Text>
                </View>

                <Pressable onPress={handleDismiss} style={styles.dismissButton}>
                    <X size={18} color={colors.muted} />
                </Pressable>
            </View>
        </Animated.View>
    );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60,
        left: spacing.md,
        right: spacing.md,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...glassTokens.glassShadow,
        borderWidth: 1,
        borderColor: isDark ? glassTokens.borderGlow.dark : glassTokens.borderGlow.light,
        zIndex: 9999,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: isDark
            ? `rgba(20, 20, 20, ${glassTokens.darkOpacity.primary})`
            : `rgba(255, 255, 255, ${glassTokens.lightOpacity.primary})`,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.full,
        backgroundColor: colors.actionMuted,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.action,
    },
    textContainer: {
        flex: 1,
        marginLeft: spacing.md,
    },
    label: {
        fontSize: typography.xs,
        fontWeight: '600',
        color: colors.action,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    name: {
        fontSize: typography.base,
        fontWeight: '700',
        color: colors.text,
        marginTop: 2,
    },
    dismissButton: {
        padding: spacing.xs,
    },
});

export default AchievementUnlockToast;
