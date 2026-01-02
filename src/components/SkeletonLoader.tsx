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
});

export default Skeleton;
