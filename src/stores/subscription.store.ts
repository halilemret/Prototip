// ============================================
// ONYX - Subscription Store (Zustand)
// ============================================

import { create } from 'zustand';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { RevenueCatService } from '@/services/revenuecat.service';
import { supabase } from '@/lib/supabase';
import { FREE_DAILY_BREAKDOWNS, REVENUECAT_ENTITLEMENT_ID } from '@/constants/app';

interface SubscriptionInfo {
    active: boolean;
    planIdentifier: string | null; // e.g., 'rc_monthly'
    expirationDate: string | null; // ISO string
    willRenew: boolean;
}

interface SubscriptionState {
    // State
    isPremium: boolean;
    subscriptionInfo: SubscriptionInfo | null;
    isLoading: boolean;
    offerings: PurchasesOffering | null;
    isConfigured: boolean;
    isInitialized: boolean;

    // Actions
    initialize: () => Promise<void>;
    checkSubscription: () => Promise<boolean>;
    checkEntitlement: () => Promise<boolean>; // Alias for checkSubscription
    fetchOfferings: () => Promise<PurchasesOffering | null>;
    purchase: (pkg: PurchasesPackage) => Promise<boolean>;
    restore: () => Promise<boolean>;
    setCustomerInfo: (info: any) => void;

    // Helpers
    shouldShowPaywall: (breakdownsUsed: number) => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    // Initial state
    isPremium: false,
    subscriptionInfo: null,
    isLoading: false,
    offerings: null,
    isConfigured: RevenueCatService.isConfigured(),
    isInitialized: false,

    // Initialize RevenueCat
    initialize: async () => {
        if (get().isInitialized) return;

        set({ isLoading: true });

        try {
            const success = await RevenueCatService.initialize();

            if (success) {
                // Helper to parse info
                const parseCustomerInfo = (info: any) => {
                    const entitlement = info.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
                    const isActive = !!entitlement;

                    return {
                        isPremium: isActive,
                        subscriptionInfo: isActive ? {
                            active: true,
                            planIdentifier: entitlement.productIdentifier,
                            expirationDate: entitlement.expirationDate,
                            willRenew: entitlement.willRenew,
                        } : null
                    };
                };

                // Initial check
                const customerInfo = await RevenueCatService.getCustomerInfo();
                if (customerInfo) {
                    set(parseCustomerInfo(customerInfo));
                }

                // Set up listener for real-time updates
                RevenueCatService.addCustomerInfoUpdateListener((info) => {
                    console.log('[SubscriptionStore] Info updated');
                    set(parseCustomerInfo(info));
                });

                set({
                    isInitialized: true,
                    isConfigured: true,
                });
            } else {
                set({ isInitialized: true });
            }
        } catch (error) {
            console.error('[SubscriptionStore] Init failed:', error);
        } finally {
            set({ isLoading: false });
        }
    },

    setCustomerInfo: (info: any) => {
        // Log detailed info for debugging
        console.log('[SubscriptionStore] Raw Entitlements:', JSON.stringify(info?.entitlements?.active, null, 2));

        const entitlement = info?.entitlements?.active[REVENUECAT_ENTITLEMENT_ID];
        const isActive = !!entitlement;

        console.log(`[SubscriptionStore] Checking entitlement '${REVENUECAT_ENTITLEMENT_ID}':`, isActive);

        // Sync with Supabase (fire and forget)
        if (isActive) {
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    supabase.from('subscriptions').upsert({
                        user_id: user.id,
                        status: 'active',
                        plan_id: entitlement.productIdentifier,
                        expiration_date: entitlement.expirationDate,
                        updated_at: new Date().toISOString(),
                    }).then(({ error }) => {
                        if (error) console.error('[SubscriptionStore] Failed to sync with Supabase:', error);
                        else console.log('[SubscriptionStore] Synced with Supabase');
                    });
                }
            });
        }

        set({
            isPremium: isActive,
            subscriptionInfo: isActive ? {
                active: true,
                planIdentifier: entitlement.productIdentifier,
                expirationDate: entitlement.expirationDate,
                willRenew: entitlement.willRenew,
            } : null
        });
    },

    // Check subscription status
    checkSubscription: async () => {
        set({ isLoading: true });

        try {
            const isPremium = await RevenueCatService.isPremium();
            set({ isPremium });
            return isPremium;
        } catch (error) {
            console.error('[SubscriptionStore] Check failed:', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    // Alias for checkSubscription (used by usePremiumFeature hook)
    checkEntitlement: async () => {
        return get().checkSubscription();
    },

    // Fetch available offerings
    fetchOfferings: async () => {
        set({ isLoading: true });

        try {
            const offerings = await RevenueCatService.getOfferings();
            set({ offerings });
            return offerings;
        } catch (error) {
            console.error('[SubscriptionStore] Fetch offerings failed:', error);
            return null;
        } finally {
            set({ isLoading: false });
        }
    },

    // Purchase a package
    purchase: async (pkg: PurchasesPackage) => {
        set({ isLoading: true });

        try {
            const customerInfo = await RevenueCatService.purchasePackage(pkg);
            if (customerInfo) {
                get().setCustomerInfo(customerInfo);
                return true;
            }
            return false;
        } catch (error) {
            console.error('[SubscriptionStore] Purchase failed:', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    // Restore purchases
    restore: async () => {
        set({ isLoading: true });

        try {
            const success = await RevenueCatService.restorePurchases();
            if (success) {
                set({ isPremium: true });
            }
            return success;
        } catch (error) {
            console.error('[SubscriptionStore] Restore failed:', error);
            return false;
        } finally {
            set({ isLoading: false });
        }
    },

    // Determine if paywall should be shown
    shouldShowPaywall: (breakdownsUsed: number) => {
        const { isPremium } = get();

        // Premium users never see paywall
        if (isPremium) return false;

        // Show paywall when free limit is reached (4th attempt)
        return breakdownsUsed >= FREE_DAILY_BREAKDOWNS;
    },
}));

export default useSubscriptionStore;
