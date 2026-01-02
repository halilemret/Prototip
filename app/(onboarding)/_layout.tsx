// ============================================
// ONYX - Onboarding Layout
// ============================================

import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'slide_from_right',
                gestureEnabled: false, // Prevent back swipe during onboarding
            }}
        >
            <Stack.Screen name="mood-check" />
            <Stack.Screen name="first-task" />
            <Stack.Screen name="first-breakdown" />
            <Stack.Screen name="personalize" />
        </Stack>
    );
}
