// ============================================
// ONYX - Personalization Screen (Onboarding Phase 4)
// Sunk Cost Investment - Creates commitment before main app
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton } from '@/components';
import { useUserStore } from '@/stores/user.store';
import { useHaptics } from '@/hooks/useHaptics';
import { storage } from '@/services/storage.service';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import {
    Rocket,
    Target,
    CheckCircle2,
    AlertCircle,
    Zap,
    Wind,
    RefreshCcw,
    Heart,
    Dumbbell
} from 'lucide-react-native';

type PreferenceOption = {
    id: string;
    iconName: string;
    label: string;
};

const CHALLENGE_OPTIONS: PreferenceOption[] = [
    { id: 'starting', iconName: 'Rocket', label: 'Starting tasks' },
    { id: 'focus', iconName: 'Target', label: 'Staying focused' },
    { id: 'finishing', iconName: 'CheckCircle2', label: 'Finishing tasks' },
    { id: 'overwhelm', iconName: 'AlertCircle', label: 'Feeling overwhelmed' },
];

const GOAL_OPTIONS: PreferenceOption[] = [
    { id: 'productivity', iconName: 'Zap', label: 'Be more productive' },
    { id: 'anxiety', iconName: 'Wind', label: 'Reduce task anxiety' },
    { id: 'habits', iconName: 'RefreshCcw', label: 'Build better habits' },
    { id: 'peace', iconName: 'Heart', label: 'Find peace of mind' },
];

const IconRenderer = ({ name, color }: { name: string, color: string }) => {
    const size = 20;
    switch (name) {
        case 'Rocket': return <Rocket size={size} color={color} />;
        case 'Target': return <Target size={size} color={color} />;
        case 'CheckCircle2': return <CheckCircle2 size={size} color={color} />;
        case 'AlertCircle': return <AlertCircle size={size} color={color} />;
        case 'Zap': return <Zap size={size} color={color} />;
        case 'Wind': return <Wind size={size} color={color} />;
        case 'RefreshCcw': return <RefreshCcw size={size} color={color} />;
        case 'Heart': return <Heart size={size} color={color} />;
        default: return null;
    }
};

export default function PersonalizeScreen() {
    const haptics = useHaptics();
    const completeOnboarding = useUserStore((state) => state.completeOnboarding);

    const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
    const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');

    const handleSelectChallenge = (id: string) => {
        haptics.selection();
        setSelectedChallenge(id);
    };

    const handleSelectGoal = (id: string) => {
        haptics.selection();
        setSelectedGoal(id);
    };

    const handleContinue = () => {
        // Save personalization data (Sunk Cost created!)
        const personalization = {
            challenge: selectedChallenge,
            goal: selectedGoal,
            nickname: nickname.trim() || undefined,
            savedAt: Date.now(),
        };

        // Store personalization (could be used for analytics/customization)
        storage.set('onyx:personalization', JSON.stringify(personalization));

        // Navigate to login screen
        router.push('/(auth)/login');
    };

    const canContinue = selectedChallenge && selectedGoal;

    const OptionCard: React.FC<{
        option: PreferenceOption;
        isSelected: boolean;
        onPress: () => void;
    }> = ({ option, isSelected, onPress }) => (
        <Pressable
            style={[
                styles.optionCard,
                isSelected && styles.optionCardSelected,
            ]}
            onPress={onPress}
        >
            <View style={styles.optionIcon}>
                <IconRenderer
                    name={option.iconName}
                    color={isSelected ? colors.action : colors.muted}
                />
            </View>
            <Text style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
            ]}>
                {option.label}
            </Text>
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Let's personalize</Text>
                    <Text style={styles.subtitle}>
                        Help me understand you better
                    </Text>
                </View>

                {/* Challenge Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        What's your biggest challenge?
                    </Text>
                    <View style={styles.optionsGrid}>
                        {CHALLENGE_OPTIONS.map((option) => (
                            <OptionCard
                                key={option.id}
                                option={option}
                                isSelected={selectedChallenge === option.id}
                                onPress={() => handleSelectChallenge(option.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Goal Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        What do you want to achieve?
                    </Text>
                    <View style={styles.optionsGrid}>
                        {GOAL_OPTIONS.map((option) => (
                            <OptionCard
                                key={option.id}
                                option={option}
                                isSelected={selectedGoal === option.id}
                                onPress={() => handleSelectGoal(option.id)}
                            />
                        ))}
                    </View>
                </View>

                {/* Optional Nickname */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitleOptional}>
                        What should I call you? <Text style={styles.optional}>(optional)</Text>
                    </Text>
                    <TextInput
                        style={styles.nicknameInput}
                        placeholder="Your name"
                        placeholderTextColor={colors.muted}
                        value={nickname}
                        onChangeText={setNickname}
                        maxLength={20}
                        autoCapitalize="words"
                    />
                </View>

                {/* CTA */}
                <View style={styles.footer}>
                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        hapticType="heavy"
                        onPress={handleContinue}
                        isDisabled={!canContinue}
                        leftIcon={<Dumbbell size={20} color={colors.bg} />}
                    >
                        Start Crushing It
                    </HapticButton>

                    <Text style={styles.privacyNote}>
                        Your data stays on your device
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.xl,
    },
    header: {
        paddingTop: spacing.lg,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: '700',
        color: colors.text,
    },
    subtitle: {
        fontSize: typography.lg,
        color: colors.muted,
        marginTop: spacing.xs,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    sectionTitleOptional: {
        fontSize: typography.base,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    optional: {
        color: colors.muted,
        fontWeight: '400',
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    optionCard: {
        width: '48%',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 2,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionCardSelected: {
        borderColor: colors.action,
        backgroundColor: 'rgba(255, 107, 53, 0.05)',
    },
    optionIcon: {
        marginRight: spacing.sm,
    },
    optionLabel: {
        fontSize: typography.sm,
        color: colors.textSecondary,
        flex: 1,
    },
    optionLabelSelected: {
        color: colors.text,
        fontWeight: '500',
    },
    nicknameInput: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        fontSize: typography.base,
        color: colors.text,
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: spacing.xl,
    },
    privacyNote: {
        textAlign: 'center',
        color: colors.muted,
        fontSize: typography.xs,
        marginTop: spacing.md,
    },
});
