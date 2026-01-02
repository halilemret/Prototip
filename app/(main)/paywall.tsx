// ============================================
// ONYX - Paywall Screen
// ============================================

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton } from '@/components';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { RevenueCatService } from '@/services/revenuecat.service';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { PREMIUM_FEATURES } from '@/constants/app';

export default function PaywallScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [offerings, setOfferings] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const isPremium = useSubscriptionStore((state) => state.isPremium);
    const checkEntitlement = useSubscriptionStore((state) => state.checkEntitlement);

    useEffect(() => {
        loadOfferings();
    }, []);

    useEffect(() => {
        // If user becomes premium, close paywall
        if (isPremium) {
            router.back();
        }
    }, [isPremium]);

    const loadOfferings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const offering = await RevenueCatService.getOfferings();
            setOfferings(offering);
        } catch (err) {
            console.error('[Paywall] Failed to load offerings:', err);
            setError('Failed to load subscription options');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePurchase = async (pkg: any) => {
        try {
            setIsPurchasing(true);
            const success = await RevenueCatService.purchasePackage(pkg);
            if (success) {
                await checkEntitlement();
                router.back();
            }
        } catch (err) {
            console.error('[Paywall] Purchase failed:', err);
            setError('Purchase failed. Please try again.');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleRestore = async () => {
        try {
            setIsPurchasing(true);
            const success = await RevenueCatService.restorePurchases();
            if (success) {
                await checkEntitlement();
                router.back();
            } else {
                setError('No previous purchases found');
            }
        } catch (err) {
            console.error('[Paywall] Restore failed:', err);
            setError('Failed to restore purchases');
        } finally {
            setIsPurchasing(false);
        }
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeIcon}>✕</Text>
                </Pressable>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroEmoji}>⚡</Text>
                    <Text style={styles.heroTitle}>Unlock Onyx Pro</Text>
                    <Text style={styles.heroSubtitle}>
                        Take control of your tasks with unlimited AI breakdowns
                    </Text>
                </View>

                {/* Features */}
                <View style={styles.features}>
                    {PREMIUM_FEATURES.map((feature) => (
                        <View key={feature.id} style={styles.featureRow}>
                            <Text style={styles.featureIcon}>{feature.icon}</Text>
                            <View style={styles.featureText}>
                                <Text style={styles.featureName}>{feature.name}</Text>
                                <Text style={styles.featureDescription}>
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Pricing */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.action} />
                        <Text style={styles.loadingText}>Loading offers...</Text>
                    </View>
                ) : error && !offerings ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <HapticButton
                            variant="secondary"
                            size="md"
                            onPress={loadOfferings}
                        >
                            Try Again
                        </HapticButton>
                    </View>
                ) : (
                    <View style={styles.packagesContainer}>
                        {offerings?.availablePackages?.map((pkg: any) => (
                            <Pressable
                                key={pkg.identifier}
                                style={styles.packageCard}
                                onPress={() => handlePurchase(pkg)}
                                disabled={isPurchasing}
                            >
                                <View style={styles.packageHeader}>
                                    <Text style={styles.packageTitle}>
                                        {pkg.packageType === 'MONTHLY' ? 'Monthly' :
                                            pkg.packageType === 'ANNUAL' ? 'Annual' :
                                                pkg.product?.title || 'Premium'}
                                    </Text>
                                    {pkg.packageType === 'ANNUAL' && (
                                        <View style={styles.saveBadge}>
                                            <Text style={styles.saveText}>SAVE 50%</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={styles.packagePrice}>
                                    {pkg.product?.priceString || '$4.99'}
                                </Text>
                                <Text style={styles.packagePeriod}>
                                    {pkg.packageType === 'MONTHLY' ? '/month' :
                                        pkg.packageType === 'ANNUAL' ? '/year' : ''}
                                </Text>
                            </Pressable>
                        )) || (
                                // Fallback when no offerings available (dev mode)
                                <View style={styles.devModeNotice}>
                                    <Text style={styles.devModeTitle}>🛠️ Development Mode</Text>
                                    <Text style={styles.devModeText}>
                                        RevenueCat offerings not configured.{'\n'}
                                        Add your products in RevenueCat dashboard.
                                    </Text>
                                </View>
                            )}
                    </View>
                )}

                {/* Error message */}
                {error && offerings && (
                    <Text style={styles.inlineError}>{error}</Text>
                )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <HapticButton
                    variant="primary"
                    size="lg"
                    fullWidth
                    hapticType="heavy"
                    isLoading={isPurchasing}
                    onPress={() => {
                        if (offerings?.availablePackages?.[0]) {
                            handlePurchase(offerings.availablePackages[0]);
                        }
                    }}
                    isDisabled={!offerings?.availablePackages?.length}
                >
                    {isPurchasing ? 'Processing...' : 'Start Free Trial'}
                </HapticButton>

                <Pressable onPress={handleRestore} style={styles.restoreButton}>
                    <Text style={styles.restoreText}>Restore Purchases</Text>
                </Pressable>

                <Text style={styles.legalText}>
                    Cancel anytime. Terms apply.
                </Text>
            </View>
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
        justifyContent: 'flex-end',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    closeButton: {
        padding: spacing.sm,
    },
    closeIcon: {
        fontSize: 20,
        color: colors.muted,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: spacing.xl,
    },

    // Hero
    hero: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    heroEmoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    heroTitle: {
        fontSize: typography['3xl'],
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    heroSubtitle: {
        fontSize: typography.lg,
        color: colors.muted,
        textAlign: 'center',
        lineHeight: 26,
    },

    // Features
    features: {
        marginVertical: spacing.xl,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    featureIcon: {
        fontSize: 24,
        marginRight: spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureName: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: typography.sm,
        color: colors.muted,
    },

    // Loading
    loadingContainer: {
        alignItems: 'center',
        padding: spacing.xl,
    },
    loadingText: {
        marginTop: spacing.md,
        color: colors.muted,
    },

    // Error
    errorContainer: {
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        color: colors.danger,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    inlineError: {
        color: colors.danger,
        textAlign: 'center',
        marginTop: spacing.md,
    },

    // Packages
    packagesContainer: {
        marginBottom: spacing.lg,
    },
    packageCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        marginBottom: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
    },
    packageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.sm,
    },
    packageTitle: {
        fontSize: typography.lg,
        fontWeight: '600',
        color: colors.text,
    },
    saveBadge: {
        backgroundColor: colors.action,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    saveText: {
        fontSize: typography.xs,
        fontWeight: '700',
        color: colors.text,
    },
    packagePrice: {
        fontSize: typography['2xl'],
        fontWeight: '700',
        color: colors.action,
    },
    packagePeriod: {
        fontSize: typography.sm,
        color: colors.muted,
    },

    // Dev mode
    devModeNotice: {
        backgroundColor: colors.warningMuted,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.warning,
    },
    devModeTitle: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.warning,
        marginBottom: spacing.sm,
    },
    devModeText: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },

    // Footer
    footer: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
    },
    restoreButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    restoreText: {
        fontSize: typography.sm,
        color: colors.action,
        fontWeight: '500',
    },
    legalText: {
        fontSize: typography.xs,
        color: colors.muted,
        textAlign: 'center',
    },
});
