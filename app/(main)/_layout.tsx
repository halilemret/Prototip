// ============================================
// ONYX - Main App Layout
// ============================================

import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MainLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg },
                animation: 'fade',
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen
                name="new-task"
                options={{
                    presentation: 'modal',
                    animation: 'slide_from_bottom',
                }}
            />
            <Stack.Screen name="history" />
            <Stack.Screen name="settings" />
        </Stack>
    );
}
