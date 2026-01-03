
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { HapticButton } from '../HapticButton';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { useHaptics } from '@/hooks/useHaptics';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles } from 'lucide-react-native';

interface LevelUpModalProps {
    visible: boolean;
    level: number;
    onClose: () => void;
}

export const LevelUpModal = ({ visible, level, onClose }: LevelUpModalProps) => {
    const { t } = useTranslation();
    const haptics = useHaptics();
    const cannonRef = useRef<ConfettiCannon>(null);

    useEffect(() => {
        if (visible) {
            haptics.heavy();
            // Fire confetti slightly delayed
            setTimeout(() => {
                cannonRef.current?.start();
            }, 300);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Sparkles size={64} color={colors.action} style={{ marginBottom: spacing.md }} />
                    <Text style={styles.title}>{t.modals.levelUp}</Text>
                    <Text style={styles.subtitle}>{t.modals.reached}</Text>

                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{level}</Text>
                    </View>

                    <Text style={styles.description}>
                        {t.modals.keepGoing}
                    </Text>

                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={onClose}
                        style={styles.button}
                    >
                        {t.common.continue}
                    </HapticButton>
                </View>

                {visible && (
                    <ConfettiCannon
                        ref={cannonRef}
                        count={200}
                        origin={{ x: -10, y: 0 }}
                        autoStart={false}
                        fadeOut={true}
                    />
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.xl,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.action,
        // Glow effect shim
        shadowColor: colors.action,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    emoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: '900',
        color: colors.action,
        marginBottom: spacing.xs,
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: typography.lg,
        color: colors.muted,
        marginBottom: spacing.lg,
    },
    levelBadge: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.action,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
        borderWidth: 4,
        borderColor: colors.bg,
    },
    levelText: {
        fontSize: 48,
        fontWeight: '800',
        color: colors.bg,
    },
    description: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginBottom: spacing.xl,
        fontSize: typography.base,
        lineHeight: 24,
    },
    button: {
        marginTop: spacing.md,
    },
});
