// ============================================
// ONYX - Entry Redirect
// ============================================

import { Redirect } from 'expo-router';
import { useUserStore } from '@/stores/user.store';

export default function Index() {
    const hasOnboarded = useUserStore((state) => state.hasOnboarded);
    const isHydrated = useUserStore((state) => state.isHydrated);

    // Wait for hydration
    if (!isHydrated) {
        return null;
    }

    // Route based on onboarding status
    if (hasOnboarded) {
        return <Redirect href="/(main)" />;
    }

    return <Redirect href="/(onboarding)/mood-check" />;
}
