// ============================================
// ONYX - RevenueCat Service (iOS Only)
// Remote Paywalls + Fallback for Expo Go
// ============================================

import Purchases, {
    CustomerInfo,
    PurchasesOffering,
    PurchasesPackage,
    LOG_LEVEL,
} from 'react-native-purchases';
import { Alert } from 'react-native';
import { REVENUECAT_ENTITLEMENT_ID } from '@/constants/app';

// Track initialization state
let isInitialized = false;
let isExpoGo = false;

// Check if running in Expo Go
const checkExpoGo = (): boolean => {
    try {
        // In Expo Go, Constants.appOwnership will be 'expo'
        const Constants = require('expo-constants').default;
        return Constants.appOwnership === 'expo';
    } catch {
        return false;
    }
};

// Get iOS API key
const getApiKey = (): string => {
    const key = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;

    if (!key || key.includes('your_revenuecat')) {
        console.warn('[RevenueCat] API key not configured. Subscription features will be disabled.');
        return '';
    }

    return key;
};

export const RevenueCatService = {
    // Initialize RevenueCat SDK
    async initialize(): Promise<boolean> {
        if (isInitialized) return true;

        isExpoGo = checkExpoGo();

        const apiKey = getApiKey();
        if (!apiKey) {
            console.warn('[RevenueCat] Skipping initialization - no API key');
            return false;
        }

        try {
            Purchases.setLogLevel(LOG_LEVEL.DEBUG);
            await Purchases.configure({ apiKey });
            isInitialized = true;
            console.log('[RevenueCat] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[RevenueCat] Initialization failed:', error);
            return false;
        }
    },

    // ==========================================
    // PAYWALLS
    // ==========================================

    /**
     * Present paywall - uses RevenueCatUI in production, fallback Alert in Expo Go
     * Returns true if user made a purchase
     */
    async presentPaywall(): Promise<boolean> {
        if (!isInitialized) {
            await RevenueCatService.initialize();
        }

        if (!isInitialized) {
            console.warn('[RevenueCat] Cannot present paywall - not initialized');
            return false;
        }

        // In Expo Go, RevenueCatUI doesn't work - show fallback
        if (isExpoGo) {
            return RevenueCatService.presentFallbackPaywall();
        }

        try {
            // Try to use RevenueCatUI for native paywall
            const RevenueCatUI = require('react-native-purchases-ui').default;
            const { PAYWALL_RESULT } = require('react-native-purchases-ui');

            const result = await RevenueCatUI.presentPaywall();

            switch (result) {
                case PAYWALL_RESULT.PURCHASED:
                case PAYWALL_RESULT.RESTORED:
                    console.log('[RevenueCat] Paywall: Purchase/Restore successful');
                    return true;
                case PAYWALL_RESULT.CANCELLED:
                    console.log('[RevenueCat] Paywall: User cancelled');
                    return false;
                case PAYWALL_RESULT.ERROR:
                    console.error('[RevenueCat] Paywall: Error occurred');
                    return RevenueCatService.presentFallbackPaywall();
                default:
                    return false;
            }
        } catch (error) {
            console.warn('[RevenueCat] RevenueCatUI not available, using fallback');
            return RevenueCatService.presentFallbackPaywall();
        }
    },

    /**
     * Present customer center (self-service subscription management)
     */
    async presentCustomerCenter(): Promise<void> {
        if (!isInitialized) return;

        // Fallback for Expo Go or if UI not available
        if (isExpoGo) {
            const url = 'https://apps.apple.com/account/subscriptions';
            const Linking = require('react-native').Linking;
            await Linking.openURL(url);
            return;
        }

        try {
            const RevenueCatUI = require('react-native-purchases-ui').default;
            await RevenueCatUI.presentCustomerCenter();
        } catch (error) {
            console.warn('[RevenueCat] Customer Center not available, using fallback url');
            const url = 'https://apps.apple.com/account/subscriptions';
            const Linking = require('react-native').Linking;
            await Linking.openURL(url);
        }
    },

    /**
     * Fallback paywall for Expo Go - shows Alert with purchase option
     */
    async presentFallbackPaywall(): Promise<boolean> {
        return new Promise((resolve) => {
            Alert.alert(
                '⚡ Upgrade to Onyx Pro',
                'Unlimited AI task breakdowns\n✓ Unlimited daily breakdowns\n✓ Priority AI processing\n✓ Mood analytics\n\n$4.99/month or $29.99/year',
                [
                    {
                        text: 'Not Now',
                        style: 'cancel',
                        onPress: () => resolve(false)
                    },
                    {
                        text: 'Restore',
                        onPress: async () => {
                            const restored = await RevenueCatService.restorePurchases();
                            resolve(restored);
                        }
                    },
                    {
                        text: 'Subscribe',
                        onPress: async () => {
                            const offerings = await RevenueCatService.getOfferings();
                            if (offerings?.availablePackages?.[0]) {
                                const info = await RevenueCatService.purchasePackage(
                                    offerings.availablePackages[0]
                                );
                                resolve(!!info?.entitlements.active[REVENUECAT_ENTITLEMENT_ID]);
                            } else {
                                Alert.alert('Error', 'No subscription packages available');
                                resolve(false);
                            }
                        }
                    },
                ]
            );
        });
    },

    /**
     * Present paywall only if user doesn't have the entitlement
     */
    async presentPaywallIfNeeded(): Promise<boolean> {
        // Check if already premium
        const isPremium = await RevenueCatService.isPremium();
        if (isPremium) {
            console.log('[RevenueCat] User already has entitlement');
            return true;
        }

        return RevenueCatService.presentPaywall();
    },

    // ==========================================
    // ENTITLEMENTS & INFO
    // ==========================================

    // Check if user has premium entitlement
    async isPremium(): Promise<boolean> {
        if (!isInitialized) {
            await RevenueCatService.initialize();
        }

        if (!isInitialized) return false;

        try {
            const customerInfo = await Purchases.getCustomerInfo();
            return !!customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
        } catch (error) {
            console.error('[RevenueCat] Failed to check entitlements:', error);
            return false;
        }
    },

    // Listen for customer info updates
    addCustomerInfoUpdateListener(callback: (info: CustomerInfo) => void) {
        Purchases.addCustomerInfoUpdateListener(callback);
    },

    // Get customer info
    async getCustomerInfo(): Promise<CustomerInfo | null> {
        if (!isInitialized) {
            await RevenueCatService.initialize();
        }

        if (!isInitialized) return null;

        try {
            return await Purchases.getCustomerInfo();
        } catch (error) {
            console.error('[RevenueCat] Failed to get customer info:', error);
            return null;
        }
    },

    // Get available offerings
    async getOfferings(): Promise<PurchasesOffering | null> {
        if (!isInitialized) {
            await RevenueCatService.initialize();
        }

        if (!isInitialized) return null;

        try {
            const offerings = await Purchases.getOfferings();
            return offerings.current;
        } catch (error) {
            console.error('[RevenueCat] Failed to get offerings:', error);
            return null;
        }
    },

    // Purchase a package
    async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo | null> {
        if (!isInitialized) return null;

        try {
            const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
            return customerInfo;
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'userCancelled' in error) {
                return null;
            }
            console.error('[RevenueCat] Purchase failed:', error);
            throw error;
        }
    },

    // Restore purchases
    async restorePurchases(): Promise<boolean> {
        if (!isInitialized) {
            await RevenueCatService.initialize();
        }

        if (!isInitialized) return false;

        try {
            const customerInfo = await Purchases.restorePurchases();
            return !!customerInfo.entitlements.active[REVENUECAT_ENTITLEMENT_ID];
        } catch (error) {
            console.error('[RevenueCat] Restore failed:', error);
            return false;
        }
    },

    // Set user ID for attribution and identify user
    async setUserId(userId: string): Promise<CustomerInfo | null> {
        if (!isInitialized) {
            await RevenueCatService.initialize();
        }

        if (!isInitialized) return null;

        try {
            const { customerInfo } = await Purchases.logIn(userId);
            console.log('[RevenueCat] User identified:', userId);
            return customerInfo;
        } catch (error) {
            console.error('[RevenueCat] Failed to set user ID:', error);
            return null;
        }
    },

    // Set user email attribute
    async setEmail(email: string): Promise<void> {
        if (!isInitialized) return;

        try {
            await Purchases.setEmail(email);
            console.log('[RevenueCat] Email set:', email);
        } catch (error) {
            console.error('[RevenueCat] Failed to set email:', error);
        }
    },

    // Log out current user
    async logOut(): Promise<void> {
        if (!isInitialized) return;

        try {
            const isAnonymous = await Purchases.isAnonymous();
            if (isAnonymous) {
                console.log('[RevenueCat] User is already anonymous, skipping logOut');
                return;
            }

            await Purchases.logOut();
            console.log('[RevenueCat] Logged out successfully');
        } catch (error) {
            console.error('[RevenueCat] Failed to log out:', error);
        }
    },

    // Check if SDK is configured
    isConfigured(): boolean {
        return !!getApiKey();
    },

    // Check if SDK is ready
    isReady(): boolean {
        return isInitialized;
    },

    // Check if running in Expo Go
    isExpoGo(): boolean {
        return isExpoGo;
    },
};

export default RevenueCatService;
