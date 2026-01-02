// ============================================
// ONYX - History Screen
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
import { useTaskStore } from '@/stores/task.store';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { CompletedTask } from '@/types';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MOOD_EMOJIS } from '@/constants/app';
import { HapticButton } from '@/components';

export default function HistoryScreen() {
    const completedTasks = useTaskStore((state) => state.completedTasks);
    const { isPremium } = usePremiumFeature();

    const handleBack = () => {
        router.back();
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 1) return '<1 min';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const renderItem = ({ item }: { item: CompletedTask }) => (
        <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
                <Text style={styles.taskTitle} numberOfLines={2}>
                    {item.originalText}
                </Text>
                <Text style={styles.taskDate}>{formatDate(item.completedAt)}</Text>
            </View>

            <View style={styles.taskMeta}>
                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Steps</Text>
                    <Text style={styles.metaValue}>
                        {item.completedSteps}/{item.totalSteps}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Duration</Text>
                    <Text style={styles.metaValue}>
                        {formatDuration(item.durationMinutes)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Mood</Text>
                    <Text style={styles.metaValue}>
                        {MOOD_EMOJIS[item.moodAtStart]} → {item.moodAtEnd ? MOOD_EMOJIS[item.moodAtEnd] : '?'}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No completed tasks yet</Text>
            <Text style={styles.emptySubtitle}>
                Complete your first task to see it here.
            </Text>
        </View>
    );

    // Analytics Logic
    const getWeeklyActivity = () => {
        const days = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toDateString();

            const hasTask = completedTasks.some(t => {
                const tDate = new Date(t.completedAt);
                return tDate.toDateString() === dateStr;
            });

            days.push({
                label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                isActive: hasTask,
                isToday: i === 0
            });
        }
        return days;
    };

    const totalMinutes = completedTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const renderHeader = () => {
        const weeklyActivity = getWeeklyActivity();

        return (
            <View>
                {/* Streak Calendar */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Last 7 Days</Text>
                    <View style={styles.calendarContainer}>
                        {weeklyActivity.map((day, index) => (
                            <View key={index} style={styles.dayColumn}>
                                <View style={[
                                    styles.dayBubble,
                                    day.isActive && styles.dayBubbleActive,
                                    !day.isActive && day.isToday && styles.dayBubbleToday,
                                ]}>
                                    {day.isActive && <Text style={styles.checkIcon}>✓</Text>}
                                </View>
                                <Text style={[
                                    styles.dayLabel,
                                    day.isToday && styles.dayLabelToday
                                ]}>{day.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Overall Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{completedTasks.length}</Text>
                        <Text style={styles.statLabel}>Tasks</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{totalHours}h</Text>
                        <Text style={styles.statLabel}>Focus</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{isPremium ? 'Top 10%' : 'Locked'}</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                    </View>
                </View>

                {/* Premium Banner (only if not premium) */}
                {!isPremium && (
                    <View style={styles.premiumBanner}>
                        <Text style={styles.premiumTitle}>📊 Unlock Monthly Trends</Text>
                        <Text style={styles.premiumText}>
                            See how your mood correlates with task completion.
                        </Text>
                    </View>
                )}

                {/* Mood Trends (Premium) */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Mood Flow {isPremium ? '' : '🔒'}</Text>
                    <View style={[styles.chartContainer, !isPremium && styles.chartLocked]}>
                        {completedTasks.slice(0, 7).reverse().map((t, i) => (
                            <View key={t.id} style={styles.chartColumn}>
                                <View style={[
                                    styles.chartBar,
                                    {
                                        height: Math.max(20, t.moodAtStart * 15),
                                        backgroundColor: t.moodAtStart >= 4 ? colors.success :
                                            t.moodAtStart === 3 ? colors.action :
                                                colors.danger
                                    }
                                ]} />
                                <Text style={styles.chartLabel}>{MOOD_EMOJIS[t.moodAtStart]}</Text>
                            </View>
                        ))}
                        {completedTasks.length === 0 && (
                            <Text style={styles.chartEmpty}>No data yet</Text>
                        )}

                        {!isPremium && (
                            <View style={[styles.lockedOverlay, StyleSheet.absoluteFill]}>
                                <View style={styles.lockIconContainer}>
                                    <Text style={styles.lockIcon}>🔒</Text>
                                </View>
                                <Text style={styles.premiumTitle}>Unlock Trends</Text>
                                <Text style={styles.premiumText}>See your mood patterns</Text>
                            </View>
                        )}
                    </View>
                </View>



                <Text style={styles.sectionTitle}>Recent History ({completedTasks.length})</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backIcon}>←</Text>
                </Pressable>
                <Text style={styles.screenTitle}>History</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <FlatList
                data={completedTasks}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={renderEmpty}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        padding: spacing.sm,
    },
    backIcon: {
        fontSize: 24,
        color: colors.text,
    },
    screenTitle: {
        fontSize: typography.lg,
        fontWeight: '600',
        color: colors.text,
    },
    placeholder: {
        width: 40,
    },
    list: {
        padding: spacing.lg,
        flexGrow: 1,
    },
    taskCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    taskHeader: {
        marginBottom: spacing.md,
    },
    taskTitle: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    taskDate: {
        fontSize: typography.sm,
        color: colors.muted,
    },
    taskMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaItem: {
        alignItems: 'center',
    },
    metaLabel: {
        fontSize: typography.xs,
        color: colors.muted,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: typography.sm,
        color: colors.text,
        fontWeight: '500',
    },

    // Empty state
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: typography.xl,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: typography.base,
        color: colors.muted,
        textAlign: 'center',
    },

    // Premium banner
    premiumBanner: {
        backgroundColor: colors.actionMuted,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.action,
    },
    premiumTitle: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.action,
        marginBottom: spacing.xs,
    },
    premiumText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    sectionContainer: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.xs,
        fontWeight: '700',
        color: colors.muted,
        marginBottom: spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    calendarContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    dayColumn: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    dayBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    dayBubbleActive: {
        backgroundColor: colors.action,
        borderColor: colors.action,
    },
    dayBubbleToday: {
        borderColor: colors.action,
        borderWidth: 2,
    },
    checkIcon: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dayLabel: {
        fontSize: typography.xs,
        color: colors.muted,
        fontWeight: '500',
    },
    dayLabelToday: {
        color: colors.action,
        fontWeight: '700',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.xl,
        justifyContent: 'space-around',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: typography['2xl'],
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: typography.xs,
        color: colors.muted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: colors.border,
    },
    // Chart Styles
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-end',
        height: 140,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    chartLocked: {
        opacity: 0.8,
    },
    chartColumn: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
        gap: spacing.xs,
    },
    chartBar: {
        width: 12,
        borderRadius: 6,
        minHeight: 20,
    },
    chartLabel: {
        fontSize: 12,
        color: colors.muted,
    },
    chartEmpty: {
        color: colors.muted,
        position: 'absolute',
        top: '45%',
        alignSelf: 'center',
    },
    lockedOverlay: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    lockIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xs,
    },
    lockIcon: {
        fontSize: 20,
    },
});
