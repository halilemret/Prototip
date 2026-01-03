// ============================================
// ONYX - Museum of Done (Achievements Screen)
// Liquid Glass styled gallery of earned badges
// ============================================

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Trophy } from 'lucide-react-native';
import { useAchievementStore, ACHIEVEMENTS } from '@/stores/achievement.store';
import { AchievementBadge } from '@/components/Gamification/AchievementBadge';
import { GlassSurface } from '@/components/Glass';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { spacing, typography, borderRadius } from '@/constants/theme';

export default function MuseumScreen() {
    const { colors } = useTheme();
    const { language } = useTranslation();
    const { unlockedAchievements, getProgress, isHydrated } = useAchievementStore();

    // Hydrate achievement store if not already
    React.useEffect(() => {
        if (!isHydrated) {
            useAchievementStore.getState().hydrate();
        }
    }, [isHydrated]);

    const styles = createStyles(colors);

    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);

    const handleBack = () => {
        router.back();
    };

    const renderBadge = ({ item }: { item: typeof ACHIEVEMENTS[0] }) => {
        const isUnlocked = unlockedAchievements.some(u => u.id === item.id);
        const progress = getProgress(item.id);

        return (
            <AchievementBadge
                achievement={item}
                isUnlocked={isUnlocked}
                progress={progress}
                language={language}
            />
        );
    };

    // Group achievements by category
    const streakAchievements = ACHIEVEMENTS.filter(a => a.category === 'streak');
    const taskAchievements = ACHIEVEMENTS.filter(a => a.category === 'task');
    const specialAchievements = ACHIEVEMENTS.filter(a => a.category === 'special');

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>
                    {language === 'tr' ? 'Başarı Müzesi' : 'Museum of Done'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            {/* Overall Progress */}
            <GlassSurface variant="card" intensity="medium" style={styles.progressCard}>
                <View style={styles.progressHeader}>
                    <Trophy size={24} color={colors.action} />
                    <View style={styles.progressInfo}>
                        <Text style={styles.progressTitle}>
                            {language === 'tr' ? 'Genel İlerleme' : 'Overall Progress'}
                        </Text>
                        <Text style={styles.progressStats}>
                            {unlockedCount} / {totalCount} {language === 'tr' ? 'kazanıldı' : 'unlocked'}
                        </Text>
                    </View>
                    <Text style={styles.progressPercent}>{progressPercent}%</Text>
                </View>
                <View style={styles.progressBarLarge}>
                    <View style={[styles.progressFillLarge, { width: `${progressPercent}%` }]} />
                </View>
            </GlassSurface>

            {/* Achievement Categories */}
            <FlatList
                data={[
                    { key: 'streak', title: language === 'tr' ? 'Seri Başarıları' : 'Streak Achievements', data: streakAchievements },
                    { key: 'task', title: language === 'tr' ? 'Görev Başarıları' : 'Task Achievements', data: taskAchievements },
                    { key: 'special', title: language === 'tr' ? 'Özel Başarılar' : 'Special Achievements', data: specialAchievements },
                ]}
                keyExtractor={(item) => item.key}
                renderItem={({ item: section }) => (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.badgeGrid}>
                            {section.data.map(achievement => (
                                <AchievementBadge
                                    key={achievement.id}
                                    achievement={achievement}
                                    isUnlocked={unlockedAchievements.some(u => u.id === achievement.id)}
                                    progress={getProgress(achievement.id)}
                                    language={language}
                                />
                            ))}
                        </View>
                    </View>
                )}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const createStyles = (colors: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    progressCard: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        padding: spacing.md,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    progressInfo: {
        flex: 1,
        marginLeft: spacing.md,
    },
    progressTitle: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.text,
    },
    progressStats: {
        fontSize: typography.sm,
        color: colors.muted,
    },
    progressPercent: {
        fontSize: typography['2xl'],
        fontWeight: '700',
        color: colors.action,
    },
    progressBarLarge: {
        height: 8,
        backgroundColor: colors.border,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFillLarge: {
        height: '100%',
        backgroundColor: colors.action,
        borderRadius: 4,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.xxl,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.lg,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
        marginLeft: spacing.xs,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
});
