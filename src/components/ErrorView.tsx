
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { HapticButton } from './HapticButton';

interface ErrorViewProps {
    title?: string;
    message: string;
    onRetry?: () => void;
    retryLabel?: string;
}

export const ErrorView = ({
    title = "Something went wrong",
    message,
    onRetry,
    retryLabel = "Try Again"
}: ErrorViewProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>⚠️</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <HapticButton
                    variant="secondary"
                    size="md"
                    onPress={onRetry}
                    style={styles.button}
                >
                    {retryLabel}
                </HapticButton>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    icon: {
        fontSize: 32,
    },
    title: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    message: {
        fontSize: typography.base,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.xl,
        lineHeight: 22,
    },
    button: {
        paddingHorizontal: spacing.xl,
    },
});
