// ============================================
// ONYX - Haptic Button Component
// ============================================

import React from 'react';
import {
    Pressable,
    PressableProps,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { useHaptics } from '@/hooks/useHaptics';
import { colors, borderRadius, typography } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type HapticType = 'light' | 'medium' | 'heavy' | 'selection';

interface HapticButtonProps extends Omit<PressableProps, 'children' | 'style'> {
    children: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    hapticType?: HapticType;
    isLoading?: boolean;
    isDisabled?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

export const HapticButton: React.FC<HapticButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    hapticType = 'medium',
    isLoading = false,
    isDisabled = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    onPress,
    style,
    ...props
}) => {
    const haptics = useHaptics();

    const handlePress = (event: any) => {
        if (isDisabled || isLoading) return;

        haptics.trigger(hapticType);
        onPress?.(event);
    };

    const getButtonStyles = (pressed: boolean): StyleProp<ViewStyle> => {
        const baseStyles: StyleProp<ViewStyle>[] = [
            styles.base,
            variantStyles[variant],
            sizeStyles[size],
            fullWidth && styles.fullWidth,
            (isDisabled || isLoading) && styles.disabled,
            pressed && !isDisabled && pressedStyles[variant],
            style,
        ];
        return baseStyles;
    };

    const textStyles = [
        styles.text,
        textVariantStyles[variant],
        textSizeStyles[size],
    ];

    return (
        <Pressable
            onPress={handlePress}
            disabled={isDisabled || isLoading}
            style={({ pressed }) => getButtonStyles(pressed)}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.text : colors.action}
                    size="small"
                />
            ) : (
                <View style={styles.content}>
                    {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                    {typeof children === 'string' ? (
                        <Text style={textStyles}>{children}</Text>
                    ) : (
                        children
                    )}
                    {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                </View>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.md,
    },
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconLeft: {
        marginRight: 8,
    },
    iconRight: {
        marginLeft: 8,
    },
    text: {
        fontWeight: '600',
    },
});

const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
        backgroundColor: colors.action,
    },
    secondary: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    danger: {
        backgroundColor: colors.danger,
    },
};

const pressedStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
        backgroundColor: colors.actionHover,
    },
    secondary: {
        backgroundColor: colors.elevated,
    },
    ghost: {
        backgroundColor: colors.surface,
    },
    danger: {
        backgroundColor: '#DC2626',
    },
};

const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: {
        height: 36,
        paddingHorizontal: 12,
    },
    md: {
        height: 48,
        paddingHorizontal: 20,
    },
    lg: {
        height: 56,
        paddingHorizontal: 28,
    },
};

const textVariantStyles: Record<ButtonVariant, { color: string }> = {
    primary: { color: colors.text },
    secondary: { color: colors.text },
    ghost: { color: colors.action },
    danger: { color: colors.text },
};

const textSizeStyles: Record<ButtonSize, { fontSize: number }> = {
    sm: { fontSize: typography.sm },
    md: { fontSize: typography.base },
    lg: { fontSize: typography.lg },
};

export default HapticButton;
