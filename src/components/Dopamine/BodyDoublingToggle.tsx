
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { ambientAudioService, AmbientSoundType } from '@/services/audio.service';
import { useSubscriptionStore } from '@/stores/subscription.store';
import { HapticButton } from '../HapticButton';
import { useHaptics } from '@/hooks/useHaptics';
import { VolumeX, Coffee, CloudRain, Brain } from 'lucide-react-native';

const SOUND_OPTIONS: { type: AmbientSoundType; label: string; iconName: string; isPremium: boolean }[] = [
    { type: 'none', label: 'Silence', iconName: 'VolumeX', isPremium: false },
    { type: 'coffee', label: 'Coffee Shop', iconName: 'Coffee', isPremium: false },
    { type: 'rain', label: 'Rain Storm', iconName: 'CloudRain', isPremium: true },
    { type: 'focus', label: 'Deep Focus', iconName: 'Brain', isPremium: true },
];

const IconRenderer = ({ name, size = 24, color = colors.text }: { name: string, size?: number, color?: string }) => {
    switch (name) {
        case 'VolumeX': return <VolumeX size={size} color={color} />;
        case 'Coffee': return <Coffee size={size} color={color} />;
        case 'CloudRain': return <CloudRain size={size} color={color} />;
        case 'Brain': return <Brain size={size} color={color} />;
        default: return <VolumeX size={size} color={color} />;
    }
};

export const BodyDoublingToggle = () => {
    const haptics = useHaptics();
    const isPremium = useSubscriptionStore((state) => state.isPremium);
    const [isVisible, setIsVisible] = useState(false);
    const [activeSound, setActiveSound] = useState<AmbientSoundType>(ambientAudioService.getCurrentType());

    const handleSelect = async (type: AmbientSoundType, needsPremium: boolean) => {
        if (needsPremium && !isPremium) {
            haptics.error();
            // TODO: Show paywall
            return;
        }

        haptics.light();
        await ambientAudioService.playAmbient(type);
        setActiveSound(type);
        setIsVisible(false);
    };

    const currentOption = SOUND_OPTIONS.find(o => o.type === activeSound) || SOUND_OPTIONS[0];

    return (
        <>
            <TouchableOpacity
                style={[styles.floatingButton, activeSound !== 'none' && styles.activeButton]}
                onPress={() => setIsVisible(true)}
            >
                <IconRenderer
                    name={currentOption.iconName}
                    color={activeSound !== 'none' ? colors.action : colors.textSecondary}
                    size={22}
                />
            </TouchableOpacity>

            <Modal visible={isVisible} transparent animationType="slide" onRequestClose={() => setIsVisible(false)}>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ambient Focus</Text>
                            <TouchableOpacity onPress={() => setIsVisible(false)}>
                                <Text style={styles.closeText}>Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent}>
                            {SOUND_OPTIONS.map((opt) => {
                                const isLocked = opt.isPremium && !isPremium;
                                const isActive = activeSound === opt.type;

                                return (
                                    <TouchableOpacity
                                        key={opt.type}
                                        style={[
                                            styles.optionCard,
                                            isActive && styles.activeOptionCard,
                                            isLocked && styles.lockedOptionCard
                                        ]}
                                        onPress={() => handleSelect(opt.type, opt.isPremium)}
                                    >
                                        <View style={styles.optionLeft}>
                                            <IconRenderer
                                                name={opt.iconName}
                                                color={isActive ? colors.action : colors.muted}
                                                size={24}
                                            />
                                            <View>
                                                <Text style={[styles.optionLabel, isActive && styles.activeLabel]}>
                                                    {opt.label}
                                                </Text>
                                                {isLocked && <Text style={styles.premiumBadge}>PREMIUM</Text>}
                                            </View>
                                        </View>
                                        {isActive && <View style={styles.activeDot} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    activeButton: {
        borderColor: colors.action,
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingBottom: 40,
        maxHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
    },
    closeText: {
        color: colors.action,
        fontWeight: '600',
        fontSize: typography.base,
    },
    scrollContent: {
        padding: spacing.md,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
        borderRadius: borderRadius.lg,
        backgroundColor: colors.elevated,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    activeOptionCard: {
        borderColor: colors.action,
        backgroundColor: 'rgba(255, 107, 53, 0.05)',
    },
    lockedOptionCard: {
        opacity: 0.7,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    optionLabel: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.text,
    },
    activeLabel: {
        color: colors.action,
    },
    premiumBadge: {
        fontSize: 10,
        fontWeight: '800',
        color: colors.action,
        marginTop: 2,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.action,
    },
});
