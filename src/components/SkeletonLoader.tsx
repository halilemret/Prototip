// ============================================
// ONYX - Skeleton Loader Component
// ============================================

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { colors, borderRadius } from '@/constants/theme';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius: customRadius = borderRadius.sm,
    style,
}) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false, // opacity animation works better with false for layout
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: false,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: customRadius,
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Preset skeleton layouts
export const SkeletonStepCard: React.FC = () => (
    <View style={styles.stepCardSkeleton}>
        <View style={styles.stepCardHeader}>
            <Skeleton width={120} height={14} />
            <Skeleton width={24} height={24} borderRadius={12} />
        </View>
        <View style={styles.stepCardContent}>
            <Skeleton width="90%" height={28} style={{ marginBottom: 12 }} />
            <Skeleton width="70%" height={28} />
        </View>
        <View style={styles.stepCardActions}>
            <Skeleton width="100%" height={56} borderRadius={borderRadius.md} />
            <Skeleton width={120} height={20} style={{ alignSelf: 'center', marginTop: 16 }} />
        </View>
    </View>
);

export const SkeletonTaskList: React.FC<{ count?: number }> = ({ count = 3 }) => (
    <View style={styles.taskListSkeleton}>
        {Array.from({ length: count }).map((_, i) => (
            <View key={i} style={styles.taskItemSkeleton}>
                <Skeleton width={32} height={32} borderRadius={16} />
                <View style={styles.taskItemContent}>
                    <Skeleton width="80%" height={16} style={{ marginBottom: 8 }} />
                    <Skeleton width="50%" height={12} />
                </View>
            </View>
        ))}
    </View>
);

export const SkeletonHistory: React.FC = () => (
    <View style={{ gap: 20 }}>
        {/* Stats Section Skeleton */}
        <View style={styles.statsSkeleton}>
            <Skeleton width="30%" height={60} borderRadius={borderRadius.lg} />
            <Skeleton width="30%" height={60} borderRadius={borderRadius.lg} />
            <Skeleton width="30%" height={60} borderRadius={borderRadius.lg} />
        </View>

        {/* Chart Section Skeleton */}
        <View style={styles.chartSkeleton}>
            <Skeleton width="100%" height={140} borderRadius={borderRadius.lg} />
        </View>

        {/* List Items Skeleton */}
        <View style={{ gap: 12 }}>
            <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
            {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} style={styles.historyItemSkeleton}>
                    <View style={{ flex: 1, gap: 8 }}>
                        <Skeleton width="80%" height={16} />
                        <Skeleton width="40%" height={12} />
                    </View>
                    <Skeleton width={40} height={40} borderRadius={20} />
                </View>
            ))}
        </View>
    </View>
);

export const SkeletonSettings: React.FC = () => (
    <View style={{ gap: 24, paddingHorizontal: 20, paddingTop: 20 }}>
        {/* Profile Section */}
        <View style={{ gap: 12 }}>
            <Skeleton width={80} height={12} />
            <Skeleton width="100%" height={120} borderRadius={borderRadius.lg} />
        </View>

        {/* Setting Sections */}
        {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} style={{ gap: 12 }}>
                <Skeleton width={100} height={12} />
                <View style={{ gap: 8 }}>
                    <View style={styles.settingsRowSkeleton}>
                        <Skeleton width="60%" height={16} />
                        <Skeleton width={40} height={24} borderRadius={12} />
                    </View>
                    <View style={styles.settingsRowSkeleton}>
                        <Skeleton width="40%" height={16} />
                        <Skeleton width={40} height={24} borderRadius={12} />
                    </View>
                </View>
            </View>
        ))}
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: colors.elevated,
    },

    // Step card skeleton
    stepCardSkeleton: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    stepCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    stepCardContent: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    stepCardActions: {
        marginTop: 24,
    },

    // Task list skeleton
    taskListSkeleton: {
        gap: 12,
    },
    taskItemSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    taskItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    statsSkeleton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    chartSkeleton: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    historyItemSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    settingsRowSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
});

export default Skeleton;
