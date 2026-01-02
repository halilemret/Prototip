// ============================================
// ONYX - Battery Indicator Component
// ============================================

import React from 'react';
import { View, Pressable, StyleSheet, Text } from 'react-native';
import { MoodLevel } from '@/types';
import { colors, spacing, borderRadius } from '@/constants/theme';
import { MOOD_LABELS } from '@/constants/app';
import { useHaptics } from '@/hooks/useHaptics';

interface BatteryIndicatorProps {
    level: MoodLevel;
    onPress?: (level: MoodLevel) => void;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    interactive?: boolean;
}

interface BatteryCellProps {
    filled: boolean;
    level: MoodLevel;
    cellIndex: number;
    size: 'sm' | 'md' | 'lg';
    onPress?: () => void;
    interactive: boolean;
}

const BatteryCell: React.FC<BatteryCellProps> = ({
    filled,
    level,
    cellIndex,
    size,
    onPress,
    interactive,
}) => {
    const haptics = useHaptics();

    const getColor = (): string => {
        if (!filled) return colors.border;
        return colors.battery[level];
    };

    const cellSizes = {
        sm: { width: 16, height: 20 },
        md: { width: 24, height: 32 },
        lg: { width: 32, height: 44 },
    };

    const handlePress = () => {
        if (!interactive) return;
        haptics.selection();
        onPress?.();
    };

    const CellContent = (
        <View
            style={[
                styles.cell,
                cellSizes[size],
                { backgroundColor: getColor() },
                cellIndex === 0 && styles.cellFirst,
                cellIndex === 4 && styles.cellLast,
            ]}
        />
    );

    if (interactive) {
        return (
            <Pressable onPress={handlePress} style={styles.cellWrapper}>
                {CellContent}
            </Pressable>
        );
    }

    return <View style={styles.cellWrapper}>{CellContent}</View>;
};

export const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({
    level,
    onPress,
    size = 'md',
    showLabel = false,
    interactive = false,
}) => {
    const cells: MoodLevel[] = [1, 2, 3, 4, 5];

    return (
        <View style={styles.container}>
            <View style={styles.batteryBody}>
                {cells.map((cellLevel) => (
                    <BatteryCell
                        key={cellLevel}
                        filled={cellLevel <= level}
                        level={level}
                        cellIndex={cellLevel - 1}
                        size={size}
                        onPress={() => onPress?.(cellLevel)}
                        interactive={interactive}
                    />
                ))}
            </View>
            <View style={[styles.batteryTip, { height: size === 'sm' ? 10 : size === 'md' ? 14 : 20 }]} />

            {showLabel && (
                <Text style={[styles.label, { color: colors.battery[level] }]}>
                    {MOOD_LABELS[level]}
                </Text>
            )}
        </View>
    );
};

// Selectable version for onboarding
interface BatterySelectorProps {
    value: MoodLevel;
    onChange: (level: MoodLevel) => void;
}

export const BatterySelector: React.FC<BatterySelectorProps> = ({
    value,
    onChange,
}) => {
    const haptics = useHaptics();
    const levels: MoodLevel[] = [1, 2, 3, 4, 5];

    const handleSelect = (level: MoodLevel) => {
        haptics.medium();
        onChange(level);
    };

    return (
        <View style={styles.selectorContainer}>
            {levels.map((level) => (
                <Pressable
                    key={level}
                    onPress={() => handleSelect(level)}
                    style={[
                        styles.selectorCell,
                        value === level && styles.selectorCellSelected,
                        { borderColor: value === level ? colors.battery[level] : colors.border },
                    ]}
                >
                    <View
                        style={[
                            styles.selectorInner,
                            {
                                backgroundColor: value >= level ? colors.battery[level] : colors.surface,
                                opacity: value >= level ? 1 : 0.3,
                            },
                        ]}
                    />
                    <Text
                        style={[
                            styles.selectorLabel,
                            { color: value === level ? colors.battery[level] : colors.muted },
                        ]}
                    >
                        {level}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    batteryBody: {
        flexDirection: 'row',
        gap: 2,
    },
    cellWrapper: {
        padding: 1,
    },
    cell: {
        borderRadius: 2,
    },
    cellFirst: {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    },
    cellLast: {
        borderTopRightRadius: 4,
        borderBottomRightRadius: 4,
    },
    batteryTip: {
        width: 4,
        backgroundColor: colors.border,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
        marginLeft: 2,
    },
    label: {
        marginLeft: spacing.sm,
        fontSize: 14,
        fontWeight: '600',
    },

    // Selector styles
    selectorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.md,
    },
    selectorCell: {
        width: 56,
        height: 72,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    selectorCellSelected: {
        borderWidth: 3,
    },
    selectorInner: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.sm,
    },
    selectorLabel: {
        marginTop: spacing.xs,
        fontSize: 12,
        fontWeight: '700',
    },
});

export default BatteryIndicator;
