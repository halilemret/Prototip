// ============================================
// ONYX - Premium Feature Hook
// Uses RevenueCat Remote Paywalls
// ============================================

import { useCallback, useMemo } from 'react';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { useUserStore } from '@/stores/user.store';
import { RevenueCatService } from '@/services/revenuecat.service';
import { FREE_DAILY_BREAKDOWNS } from '@/constants/app';

interface UsePremiumFeatureReturn {
    isPremium: boolean;
    isConfigured: boolean;
    dailyBreakdownsUsed: number;
    remainingBreakdowns: number;
    canUseBreakdown: boolean;

    /**
     * Show RevenueCat remote paywall (from dashboard)
     * Returns true if user purchased/restored
     */
    showPaywall: () => Promise<boolean>;

    /**
     * Show paywall only if user doesn't have premium
     * Returns true if user is now premium
     */
    showPaywallIfNeeded: () => Promise<boolean>;

    /**
     * Check if should show paywall based on usage
     */
    shouldPromptPaywall: boolean;
}

export const usePremiumFeature = (): UsePremiumFeatureReturn => {
    const isPremium = useSubscriptionStore((state) => state.isPremium);
    const isConfigured = useSubscriptionStore((state) => state.isConfigured);
    const checkEntitlement = useSubscriptionStore((state) => state.checkEntitlement);

    const dailyBreakdownsUsed = useUserStore((state) => state.dailyBreakdownsUsed);

    const remainingBreakdowns = useMemo(() => {
        if (isPremium) return Infinity;
        return Math.max(0, FREE_DAILY_BREAKDOWNS - dailyBreakdownsUsed);
    }, [isPremium, dailyBreakdownsUsed]);

    const canUseBreakdown = useMemo(() => {
        return isPremium || remainingBreakdowns > 0;
    }, [isPremium, remainingBreakdowns]);

    const shouldPromptPaywall = useMemo(() => {
        // Show paywall prompt when user has used all free breakdowns
        return !isPremium && dailyBreakdownsUsed >= FREE_DAILY_BREAKDOWNS;
    }, [isPremium, dailyBreakdownsUsed]);

    /**
     * Present the RevenueCat remote paywall
     */
    const showPaywall = useCallback(async (): Promise<boolean> => {
        try {
            const result = await RevenueCatService.presentPaywall();
            if (result) {
                // Refresh entitlement status after purchase
                await checkEntitlement();
            }
            return result;
        } catch (error) {
            console.error('[usePremiumFeature] Paywall error:', error);
            return false;
        }
    }, [checkEntitlement]);

    /**
     * Present paywall only if user doesn't have premium
     */
    const showPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
        try {
            const result = await RevenueCatService.presentPaywallIfNeeded();
            if (result) {
                await checkEntitlement();
            }
            return result;
        } catch (error) {
            console.error('[usePremiumFeature] PaywallIfNeeded error:', error);
            return false;
        }
    }, [checkEntitlement]);

    return {
        isPremium,
        isConfigured,
        dailyBreakdownsUsed,
        remainingBreakdowns,
        canUseBreakdown,
        showPaywall,
        showPaywallIfNeeded,
        shouldPromptPaywall,
    };
};

export default usePremiumFeature;
