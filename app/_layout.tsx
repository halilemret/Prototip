// ============================================
// ONYX - Root Layout (iOS Only)
// ============================================

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useUserStore } from '@/stores/user.store';
import { useTaskStore } from '@/stores/task.store';
import { useAuthStore } from '@/stores/auth.store';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { StorageService } from '@/services/storage.service';
import { NotificationService } from '@/services/notification.service';
import { ErrorBoundary } from '@/components';
import { colors } from '@/constants/theme';
import '../global.css';

function AppContent() {
    const [isReady, setIsReady] = useState(false);

    const hydrateUser = useUserStore((state) => state.hydrate);
    const hydrateTask = useTaskStore((state) => state.hydrate);
    const initAuth = useAuthStore((state) => state.initialize);
    const initSubscription = useSubscriptionStore((state) => state.initialize);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                // Hydrate AsyncStorage cache first
                await StorageService.hydrate();

                // Then hydrate stores from cache
                hydrateUser();
                hydrateTask();

                // Initialize Auth & RevenueCat (non-blocking)
                initAuth().catch(console.warn);
                initSubscription().catch(console.warn);

                // Notifications Setup
                // 1. Request permissions (silent on Android usually, needed for iOS)
                NotificationService.requestPermissions().then((granted: boolean) => {
                    if (granted) {
                        // 2. Cancel any pending "come back" reminders since user is here
                        NotificationService.cancelAllNotifications();
                    }
                });


                setIsReady(true);
            } catch (error) {
                console.error('[RootLayout] Initialization failed:', error);
                setIsReady(true); // Continue anyway
            }
        };

        initializeApp();
    }, [hydrateUser, hydrateTask, initAuth, initSubscription]);

    if (!isReady) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.action} />
                <StatusBar style="light" />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" backgroundColor={colors.bg} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.bg },
                    animation: 'fade',
                }}
            />
        </>
    );
}

export default function RootLayout() {
    return (
        <ErrorBoundary>
            <AppContent />
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
