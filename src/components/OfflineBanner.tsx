// ============================================
// ONYX - Offline Banner Component
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography } from '@/constants/theme';

// Note: For full offline detection, you'd use @react-native-community/netinfo
// This is a simplified version that can be enhanced

interface OfflineBannerProps {
    isOffline?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline = false }) => {
    const [slideAnim] = useState(new Animated.Value(-50));
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (isOffline) {
            setVisible(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -50,
                duration: 200,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        }
    }, [isOffline, slideAnim]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY: slideAnim }] },
            ]}
        >
            <Text style={styles.icon}>📡</Text>
            <Text style={styles.text}>No internet connection</Text>
        </Animated.View>
    );
};

// Hook for manual offline state management
export const useOfflineState = () => {
    const [isOffline, setIsOffline] = useState(false);

    // You can enhance this with NetInfo:
    // useEffect(() => {
    //   const unsubscribe = NetInfo.addEventListener(state => {
    //     setIsOffline(!state.isConnected);
    //   });
    //   return () => unsubscribe();
    // }, []);

    return { isOffline, setIsOffline };
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.warning,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        zIndex: 1000,
    },
    icon: {
        fontSize: 14,
        marginRight: spacing.sm,
    },
    text: {
        color: colors.bg,
        fontSize: typography.sm,
        fontWeight: '600',
    },
});

export default OfflineBanner;
