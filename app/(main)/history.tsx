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
import {
    ChevronLeft,
    ClipboardList,
    Check,
    Lock,
    Lightbulb,
    BarChart3,
    TrendingUp,
    Zap,
    Battery,
    BatteryFull,
    BatteryMedium,
    BatteryLow,
    BatteryWarning
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '@/stores/task.store';
import { useUserStore } from '@/stores/user.store';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { CompletedTask } from '@/types';
import { spacing, typography, borderRadius } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { MOOD_EMOJIS } from '@/constants/app';
import { HapticButton, SkeletonHistory } from '@/components';
import { useTranslation } from '@/hooks/useTranslation';

const MoodIconRenderer = ({ name, size = 16, color }: { name: string, size?: number, color?: string }) => {
    const { colors } = useTheme();
    const iconColor = color || colors.text;
    switch (name) {
        case 'BatteryLow': return <BatteryLow size={size} color={iconColor} />;
        case 'BatteryMedium': return <BatteryMedium size={size} color={iconColor} />;
        case 'BatteryFull': return <BatteryFull size={size} color={iconColor} />;
        case 'Zap': return <Zap size={size} color={iconColor} />;
        default: return <Battery size={size} color={iconColor} />;
    }
};

export default function HistoryScreen() {
    const { colors } = useTheme();
    const { t, language } = useTranslation();
    const [isLoading, setIsLoading] = React.useState(true);
    const completedTasks = useTaskStore((state) => state.completedTasks);
    const isHydrated = useTaskStore((state) => state.isHydrated);
    const { isPremium } = usePremiumFeature();

    const styles = createStyles(colors);

    React.useEffect(() => {
        if (isHydrated) {
            // Add a tiny artificial delay for smoothness
            const timer = setTimeout(() => setIsLoading(false), 600);
            return () => clearTimeout(timer);
        }
    }, [isHydrated]);

    const handleBack = () => {
        router.back();
    };

    const formatDate = (timestamp: number): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return language === 'tr' ? 'Bugün' : 'Today';
        if (days === 1) return language === 'tr' ? 'Dün' : 'Yesterday';
        if (days < 7) return language === 'tr' ? `${days} gün önce` : `${days} days ago`;

        return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDuration = (minutes: number): string => {
        if (minutes < 1) return language === 'tr' ? '<1 dk' : '<1 min';
        if (minutes < 60) return `${minutes} ${language === 'tr' ? 'dk' : 'min'}`;
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
                    <Text style={styles.metaLabel}>{language === 'tr' ? 'Adım' : 'Steps'}</Text>
                    <Text style={styles.metaValue}>
                        {item.completedSteps}/{item.totalSteps}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>{language === 'tr' ? 'Süre' : 'Duration'}</Text>
                    <Text style={styles.metaValue}>
                        {formatDuration(item.durationMinutes)}
                    </Text>
                </View>

                <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>{language === 'tr' ? 'Mod' : 'Mood'}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <MoodIconRenderer name={MOOD_EMOJIS[item.moodAtStart]} size={14} color={colors.muted} />
                        <Text style={styles.metaValue}>→</Text>
                        <MoodIconRenderer
                            name={item.moodAtEnd ? MOOD_EMOJIS[item.moodAtEnd] : 'Battery'}
                            size={14}
                            color={item.moodAtEnd ? colors.text : colors.muted}
                        />
                    </View>
                </View>
            </View>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyState}>
            <ClipboardList size={64} color={colors.muted} style={{ marginBottom: spacing.md }} />
            <Text style={styles.emptyTitle}>{t.history.noTasks}</Text>
            <Text style={styles.emptySubtitle}>
                {t.history.completeFirst}
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
                label: d.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'narrow' }),
                isActive: hasTask,
                isToday: i === 0
            });
        }
        return days;
    };

    const totalMinutes = completedTasks.reduce((acc, t) => acc + t.durationMinutes, 0);

    const formatTotalFocus = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    };

    const getPersonalRank = () => {
        const { level, streak } = useUserStore.getState();
        if (streak > 5) return language === 'tr' ? 'Efsane' : 'Legendary';
        if (level > 10) return language === 'tr' ? 'Usta' : 'Elite';
        if (completedTasks.length > 20) return language === 'tr' ? 'İstikrarlı' : 'Consistent';
        return language === 'tr' ? 'Çaylak' : 'Focusing';
    };

    const getMoodInsight = () => {
        if (completedTasks.length === 0) return null;
        const lastMoods = completedTasks.slice(0, 5).map(t => t.moodAtEnd || t.moodAtStart);
        const avgMood = lastMoods.reduce((a, b) => a + (b as number), 0) / lastMoods.length;

        if (avgMood >= 4) return language === 'tr' ? 'Harika gidiyorsun, modun oldukça yüksek! 🔥' : "You're on fire! Your mood is consistently high. 🔥";
        if (avgMood <= 2) return language === 'tr' ? 'Enerjin düşük görünüyor, bugün hafif görevler alabilirsin. 🧘' : "Energy seems low. Consider smaller, easier tasks today. 🧘";
        return language === 'tr' ? 'Dengeli ilerliyorsun. İstikrar en büyük gücün! ✨' : "Keeping it steady. Consistency is your greatest strength! ✨";
    };

    const renderHeader = () => {
        const weeklyActivity = getWeeklyActivity();
        const insight = getMoodInsight();

        return (
            <View>
                {/* Streak Calendar */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>{t.history.last7Days}</Text>
                    <View style={styles.calendarContainer}>
                        {weeklyActivity.map((day, index) => (
                            <View key={index} style={styles.dayColumn}>
                                <View style={[
                                    styles.dayBubble,
                                    day.isActive && styles.dayBubbleActive,
                                    !day.isActive && day.isToday && styles.dayBubbleToday,
                                ]}>
                                    {day.isActive && <Check size={14} color="#FFF" strokeWidth={3} />}
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
                        <Text style={styles.statLabel}>{t.history.totalTasks}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatTotalFocus(totalMinutes)}</Text>
                        <Text style={styles.statLabel}>{t.history.totalFocus}</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{getPersonalRank()}</Text>
                        <Text style={styles.statLabel}>{t.history.rank}</Text>
                    </View>
                </View>

                {!isPremium && (
                    <View style={styles.premiumBanner}>
                        <View style={styles.row}>
                            <BarChart3 size={20} color={colors.action} />
                            <Text style={[styles.premiumTitle, { marginLeft: spacing.sm, marginBottom: 0 }]}>
                                {language === 'tr' ? 'Aylık Trendleri Aç' : 'Unlock Monthly Trends'}
                            </Text>
                        </View>
                        <Text style={[styles.premiumText, { marginTop: spacing.xs }]}>
                            {language === 'tr' ? 'Modunuzun görev tamamlama ile ilişkisini görün.' : 'See how your mood correlates with task completion.'}
                        </Text>
                    </View>
                )}

                <View style={styles.sectionContainer}>
                    <View style={styles.row}>
                        <TrendingUp size={16} color={colors.muted} />
                        <Text style={[styles.sectionTitle, { marginBottom: 0, marginLeft: spacing.xs }]}>
                            {t.history.moodFlow}
                        </Text>
                        {!isPremium && <Lock size={14} color={colors.muted} />}
                    </View>

                    <View style={[styles.chartContainer, !isPremium && styles.chartLocked]}>
                        {completedTasks.slice(0, 7).reverse().map((t, i) => (
                            <View key={t.id} style={styles.chartColumn}>
                                <View style={[
                                    styles.chartBar,
                                    {
                                        height: Math.max(20, (t.moodAtEnd || t.moodAtStart) * 15),
                                        backgroundColor: (t.moodAtEnd || t.moodAtStart) >= 4 ? colors.success :
                                            (t.moodAtEnd || t.moodAtStart) === 3 ? colors.action :
                                                colors.danger
                                    }
                                ]} />
                                <MoodIconRenderer
                                    name={MOOD_EMOJIS[t.moodAtEnd || t.moodAtStart]}
                                    size={14}
                                    color={colors.muted}
                                />
                            </View>
                        ))}
                        {completedTasks.length === 0 && (
                            <Text style={styles.chartEmpty}>{language === 'tr' ? 'Henüz veri yok' : 'No data yet'}</Text>
                        )}

                        {!isPremium && (
                            <View style={[styles.lockedOverlay, StyleSheet.absoluteFill]}>
                                <View style={styles.lockIconContainer}>
                                    <Lock size={20} color={colors.text} />
                                </View>
                                <Text style={styles.premiumTitle}>{language === 'tr' ? 'Trendleri Aç' : 'Unlock Trends'}</Text>
                                <Text style={styles.premiumText}>{language === 'tr' ? 'Mod örüntülerinizi görün' : 'See your mood patterns'}</Text>
                            </View>
                        )}
                    </View>
                    {isPremium && insight && (
                        <View style={styles.insightContainer}>
                            <Lightbulb size={18} color={colors.action} style={{ marginBottom: spacing.xs }} />
                            <Text style={styles.insightText}>{insight}</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.sectionTitle}>{t.history.recentHistory} ({completedTasks.length})</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </Pressable>
                <Text style={styles.screenTitle}>{t.history.title}</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.list}>
                    <SkeletonHistory />
                </View>
            ) : (
                <FlatList
                    data={completedTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListEmptyComponent={renderEmpty}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    insightContainer: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.elevated,
        borderRadius: borderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.action,
    },
    insightText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
});
