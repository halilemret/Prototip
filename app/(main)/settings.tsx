// ============================================
// ONYX - Settings Screen
// ============================================

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Switch,
    Pressable,
    Alert,
    Linking,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/user.store';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { useAuthStore } from '@/stores/auth.store';
import { usePremiumFeature } from '@/hooks/usePremiumFeature';
import { StorageService } from '@/services/storage.service';
import { AIService } from '@/services/ai.service';
import { RevenueCatService } from '@/services/revenuecat.service';
import { HapticButton, SkeletonSettings, GlassSurface } from '@/components';
import { spacing, typography, borderRadius, glassTokens } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { PREMIUM_FEATURES } from '@/constants/app';
import { useTranslation } from '@/hooks/useTranslation';
import {
    ChevronLeft,
    Flame,
    Crown,
    Settings as SettingsIcon,
    ChevronRight,
    LogOut,
    Trash2,
    Shield,
    FileText,
    Globe,
    Zap,
    BarChart3,
    Infinity as InfinityIcon,
    AlertOctagon,
    Trophy
} from 'lucide-react-native';

export default function SettingsScreen() {
    const { colors } = useTheme();
    const { t, language, setLanguage } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);
    const [isRestoring, setIsRestoring] = useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    // User state
    const hapticsEnabled = useUserStore((state) => state.hapticsEnabled);
    const setHapticsEnabled = useUserStore((state) => state.setHapticsEnabled);
    const dailyBreakdownsUsed = useUserStore((state) => state.dailyBreakdownsUsed);
    const theme = useUserStore((state) => state.theme);
    const setTheme = useUserStore((state) => state.setTheme);

    const styles = createStyles(colors);

    // Subscription state
    const isPremium = useSubscriptionStore((state) => state.isPremium);
    const subscriptionInfo = useSubscriptionStore((state) => state.subscriptionInfo);
    const isConfigured = useSubscriptionStore((state) => state.isConfigured);
    const restore = useSubscriptionStore((state) => state.restore);

    // Premium feature hook
    const showPaywall = usePremiumFeature().showPaywall;

    const handleUpgrade = async () => {
        await showPaywall();
    };

    const handleBack = () => {
        router.back();
    };

    const handleRestore = async () => {
        setIsRestoring(true);
        try {
            const success = await restore();
            if (success) {
                Alert.alert('Success', 'Your purchases have been restored!');
            } else {
                Alert.alert('No Purchases', 'No previous purchases found.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to restore purchases. Please try again.');
        } finally {
            setIsRestoring(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will reset the app to its initial state. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: () => {
                        StorageService.clearAll();
                        Alert.alert('Done', 'All data has been cleared. Please restart the app.');
                    },
                },
            ]
        );
    };

    const handlePrivacy = () => {
        Linking.openURL('https://example.com/privacy');
    };

    const handleTerms = () => {
        Linking.openURL('https://example.com/terms');
    };

    const renderSettingRow = (
        label: string,
        value?: React.ReactNode,
        onPress?: () => void
    ) => (
        <Pressable
            style={styles.settingRow}
            onPress={onPress}
            disabled={!onPress}
        >
            <Text style={styles.settingLabel}>{label}</Text>
            {value}
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </Pressable>
                <Text style={styles.screenTitle}>
                    {language === 'tr' ? 'Ayarlar' : 'Settings'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            {isLoading ? (
                <SkeletonSettings />
            ) : (
                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Profile & Level Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.settings.profile}</Text>

                        <GlassSurface variant="card" intensity="medium" style={styles.profileCard}>
                            <View style={styles.profileHeader}>
                                <View style={styles.levelBadge}>
                                    <Text style={styles.levelText}>{useUserStore.getState().level}</Text>
                                </View>
                                <View style={styles.profileInfo}>
                                    <Text style={styles.profileName}>
                                        {language === 'tr' ? 'Kaşif' : 'Explorer'}
                                    </Text>
                                    <Text style={styles.profileXp}>{useUserStore.getState().xp} XP</Text>
                                </View>
                                <View style={styles.streakContainer}>
                                    <Flame size={18} color="#FF9500" />
                                    <Text style={styles.streakCount}>{useUserStore.getState().streak}</Text>
                                </View>
                            </View>

                            {/* Level Progress Bar */}
                            <View style={styles.levelProgressContainer}>
                                <View style={styles.levelProgressBar}>
                                    <View
                                        style={[
                                            styles.levelProgressFill,
                                            { width: `${Math.min(100, (useUserStore.getState().xp / (100 * Math.pow(useUserStore.getState().level, 2))) * 100)}%` }
                                        ]}
                                    />
                                </View>
                                <Text style={styles.levelNext}>
                                    {language === 'tr' ? 'Sonraki Seviye' : 'Next Level'}: {100 * Math.pow(useUserStore.getState().level, 2)} XP
                                </Text>
                            </View>
                        </GlassSurface>

                        {/* Museum Link - Separate GlassSurface */}
                        <GlassSurface
                            variant="card"
                            intensity="light"
                            accentGlow
                            style={styles.museumCard}
                        >
                            <Pressable
                                style={styles.museumLink}
                                onPress={() => router.push('/(main)/museum' as any)}
                            >
                                <Trophy size={22} color={colors.action} />
                                <View style={styles.museumTextContainer}>
                                    <Text style={styles.museumLinkText}>
                                        {language === 'tr' ? 'Başarı Müzesi' : 'Museum of Done'}
                                    </Text>
                                    <Text style={styles.museumSubtext}>
                                        {language === 'tr' ? 'Rozetlerini gör' : 'View your achievements'}
                                    </Text>
                                </View>
                                <ChevronRight size={22} color={colors.action} />
                            </Pressable>
                        </GlassSurface>
                    </View>

                    {/* Subscription Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.settings.subscription}</Text>

                        <View style={styles.subscriptionCard}>
                            <View style={styles.subscriptionHeader}>
                                <Text style={styles.subscriptionTitle}>
                                    {isPremium ? 'Onyx Pro' : 'Free Plan'}
                                </Text>
                                {isPremium && <Text style={styles.proBadge}>PRO</Text>}
                            </View>

                            {!isPremium && (
                                <>
                                    <Text style={styles.subscriptionInfo}>
                                        {dailyBreakdownsUsed}/3 breakdowns used today
                                    </Text>

                                    <View style={styles.premiumFeatures}>
                                        {PREMIUM_FEATURES.map((feature) => (
                                            <View key={feature.id} style={styles.premiumFeature}>
                                                <View style={styles.featureIconContainer}>
                                                    {feature.icon === 'Infinity' && <InfinityIcon size={16} color={colors.action} />}
                                                    {feature.icon === 'BarChart3' && <BarChart3 size={16} color={colors.action} />}
                                                    {feature.icon === 'AlertOctagon' && <AlertOctagon size={16} color={colors.action} />}
                                                </View>
                                                <Text style={styles.featureName}>{feature.name}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <HapticButton
                                        variant="primary"
                                        size="md"
                                        fullWidth
                                        onPress={showPaywall}
                                    >
                                        Upgrade to Pro
                                    </HapticButton>
                                </>
                            )}

                            {isPremium && (
                                <View style={{ gap: 12 }}>
                                    <Text style={styles.subscriptionInfo}>
                                        You have access to all premium features.
                                        {subscriptionInfo?.expirationDate &&
                                            `\nRenews: ${new Date(subscriptionInfo.expirationDate).toLocaleDateString()}`
                                        }
                                    </Text>
                                    <HapticButton
                                        variant="secondary"
                                        size="sm"
                                        onPress={() => RevenueCatService.presentCustomerCenter()}
                                    >
                                        Manage Subscription
                                    </HapticButton>
                                </View>
                            )}
                        </View>

                        {isConfigured && (
                            <Pressable style={styles.restoreButton} onPress={handleRestore}>
                                <Text style={styles.restoreText}>
                                    {isRestoring ? 'Restoring...' : 'Restore Purchases'}
                                </Text>
                            </Pressable>
                        )}
                    </View>

                    {/* Preferences Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.settings.preferences}</Text>

                        {renderSettingRow(
                            t.settings.hapticFeedback,
                            <Switch
                                value={hapticsEnabled}
                                onValueChange={setHapticsEnabled}
                                trackColor={{ false: colors.border, true: colors.action }}
                                thumbColor={colors.text}
                            />
                        )}

                        {renderSettingRow(
                            'Language',
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Pressable
                                    onPress={() => setLanguage('en')}
                                    style={[styles.themeBadge, language === 'en' && styles.themeBadgeActive]}
                                >
                                    <Text style={[styles.themeBadgeText, language === 'en' && { color: colors.bg }]}>EN</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setLanguage('tr')}
                                    style={[styles.themeBadge, language === 'tr' && styles.themeBadgeActive]}
                                >
                                    <Text style={[styles.themeBadgeText, language === 'tr' && { color: colors.bg }]}>TR</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Appearance Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.settings.appearance}</Text>

                        {renderSettingRow(
                            t.settings.theme,
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <Pressable
                                    onPress={() => setTheme('dark')}
                                    style={[styles.themeBadge, theme === 'dark' && styles.themeBadgeActive]}
                                >
                                    <Text style={[styles.themeBadgeText, theme === 'dark' && { color: colors.bg }]}>Dark</Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => setTheme('light')}
                                    style={[styles.themeBadge, theme === 'light' && styles.themeBadgeActive]}
                                >
                                    <Text style={[styles.themeBadgeText, theme === 'light' && { color: colors.bg }]}>Light</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>

                    {/* Status Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.settings.status}</Text>

                        {renderSettingRow(
                            'AI Service',
                            <Text style={[
                                styles.statusBadge,
                                { backgroundColor: AIService.isConfigured() ? colors.successMuted : colors.dangerMuted },
                                { color: AIService.isConfigured() ? colors.success : colors.danger },
                            ]}>
                                {AIService.isConfigured() ? 'Connected' : 'Not Configured'}
                            </Text>
                        )}

                        {renderSettingRow(
                            'RevenueCat',
                            <Text style={[
                                styles.statusBadge,
                                { backgroundColor: isConfigured ? colors.successMuted : colors.warningMuted },
                                { color: isConfigured ? colors.success : colors.warning },
                            ]}>
                                {isConfigured ? 'Connected' : 'Dev Mode'}
                            </Text>
                        )}
                    </View>

                    {/* Legal Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>{t.settings.legal}</Text>

                        {renderSettingRow(
                            'Privacy Policy',
                            <Shield size={18} color={colors.muted} />,
                            handlePrivacy
                        )}

                        {renderSettingRow(
                            'Terms of Service',
                            <FileText size={18} color={colors.muted} />,
                            handleTerms
                        )}
                    </View>

                    {/* Danger Zone */}
                    <View style={[styles.section, { marginBottom: 40 }]}>
                        <Text style={styles.sectionTitle}>{t.settings.dataAccount}</Text>

                        <HapticButton
                            variant="ghost"
                            size="md"
                            onPress={handleClearData}
                            style={{ marginBottom: 12 }}
                        >
                            {t.settings.clearData}
                        </HapticButton>

                        <HapticButton
                            variant="secondary" // Changed to secondary for visual hierarchy
                            size="md"
                            onPress={async () => {
                                await useAuthStore.getState().signOut();
                                router.replace('/(auth)/login');
                            }}
                        >
                            {t.settings.signOut}
                        </HapticButton>
                    </View>

                    {/* Version Info */}
                    <View style={styles.appInfo}>
                        <Text style={styles.appName}>Onyx</Text>
                        <Text style={styles.appVersion}>Version 1.0.0</Text>
                    </View>
                </ScrollView>
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
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    section: {
        marginTop: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.xs,
        fontWeight: '600',
        color: colors.muted,
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    settingLabel: {
        fontSize: typography.base,
        color: colors.text,
    },
    linkIcon: {
        fontSize: 18,
        color: colors.muted,
    },

    // Subscription card
    subscriptionCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    subscriptionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    subscriptionTitle: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
    },
    proBadge: {
        marginLeft: spacing.sm,
        backgroundColor: colors.action,
        color: colors.text,
        fontSize: typography.xs,
        fontWeight: '700',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    subscriptionInfo: {
        fontSize: typography.sm,
        color: colors.muted,
        marginBottom: spacing.md,
    },
    premiumFeatures: {
        marginBottom: spacing.lg,
    },
    premiumFeature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    featureIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    featureIconContainer: {
        width: 24,
        marginRight: spacing.sm,
        alignItems: 'center',
    },
    featureName: {
        fontSize: typography.sm,
        color: colors.textSecondary,
    },
    upgradeButton: {
        marginTop: spacing.sm,
    },
    restoreButton: {
        alignItems: 'center',
        padding: spacing.md,
    },
    restoreText: {
        fontSize: typography.sm,
        color: colors.action,
        fontWeight: '500',
    },

    // Status badges
    statusBadge: {
        fontSize: typography.xs,
        fontWeight: '600',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        overflow: 'hidden',
    },

    // Profile Card
    profileCard: {
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    levelBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.action,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    levelText: {
        fontSize: typography.xl,
        fontWeight: '800',
        color: colors.bg,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: typography.lg,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 2,
    },
    profileXp: {
        fontSize: typography.sm,
        color: colors.muted,
        fontWeight: '500',
    },
    streakContainer: {
        alignItems: 'center',
        backgroundColor: colors.bg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    streakIcon: {
        fontSize: 16,
        marginBottom: 2,
    },
    streakCount: {
        fontSize: typography.lg,
        fontWeight: '700',
        color: '#FF9500', // Fire color
    },
    levelProgressContainer: {
        gap: spacing.xs,
    },
    levelProgressBar: {
        height: 8,
        backgroundColor: colors.bg,
        borderRadius: 4,
        overflow: 'hidden',
    },
    levelProgressFill: {
        height: '100%',
        backgroundColor: colors.action,
        borderRadius: 4,
    },
    levelNext: {
        fontSize: typography.xs,
        color: colors.muted,
        textAlign: 'right',
    },

    // App info
    appInfo: {
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    appName: {
        fontSize: typography.lg,
        fontWeight: '700',
        color: colors.muted,
    },
    appVersion: {
        fontSize: typography.sm,
        color: colors.muted,
        marginTop: spacing.xs,
    },
    // Theme Badges
    themeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.elevated,
        borderWidth: 1,
        borderColor: colors.border,
    },
    themeBadgeActive: {
        backgroundColor: colors.text,
        borderColor: colors.text,
    },
    themeBadgeText: {
        fontSize: typography.xs,
        fontWeight: '600',
        color: colors.muted,
    },

    // Museum Link
    museumCard: {
        marginTop: spacing.md,
        padding: spacing.md,
    },
    museumLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    museumTextContainer: {
        flex: 1,
    },
    museumLinkText: {
        fontSize: typography.base,
        fontWeight: '700',
        color: colors.action,
    },
    museumSubtext: {
        fontSize: typography.xs,
        color: colors.muted,
        marginTop: 2,
    },
});
