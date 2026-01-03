import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useShakeDetector } from '@/hooks/useShakeDetector';
import { ShakeUnstuckModal } from '@/components/Dopamine/ShakeUnstuckModal';

export default function MainLayout() {
    const [isShakeModalVisible, setShakeModalVisible] = useState(false);

    // Hook into Shake Detection
    useShakeDetector(() => {
        setShakeModalVisible(true);
    });

    return (
        <>
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

            <ShakeUnstuckModal
                visible={isShakeModalVisible}
                onClose={() => setShakeModalVisible(false)}
            />
        </>
    );
}
