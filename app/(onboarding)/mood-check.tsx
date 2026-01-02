// ============================================
// ONYX - Mood Check Screen (Onboarding Phase 1)
// ============================================

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BatterySelector, HapticButton } from '@/components';
import { useUserStore } from '@/stores/user.store';
import { MoodLevel } from '@/types';
import { colors, spacing, typography } from '@/constants/theme';

export default function MoodCheckScreen() {
    const [selectedMood, setSelectedMood] = useState<MoodLevel>(3);
    const setMood = useUserStore((state) => state.setMood);

    const handleContinue = () => {
        setMood(selectedMood);
        router.push('/(onboarding)/first-task');
    };

    const getMoodMessage = (mood: MoodLevel): string => {
        const messages: Record<MoodLevel, string> = {
            1: "That's okay. We'll take it extra slow.",
            2: "Low energy day. Small steps only.",
            3: "Neutral zone. We can work with this.",
            4: "Good energy! Let's use it wisely.",
            5: "Fully charged! Let's do this.",
        };
        return messages[mood];
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>
                        How full is your{'\n'}battery right now?
                    </Text>
                    <Text style={styles.subtitle}>
                        Be honest. This helps me calibrate.
                    </Text>
                </View>

                {/* Battery Selector */}
                <View style={styles.selectorContainer}>
                    <BatterySelector
                        value={selectedMood}
                        onChange={setSelectedMood}
                    />

                    <Text style={styles.moodMessage}>
                        {getMoodMessage(selectedMood)}
                    </Text>
                </View>

                {/* CTA */}
                <View style={styles.footer}>
                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        hapticType="medium"
                        onPress={handleContinue}
                    >
                        Continue
                    </HapticButton>
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
        justifyContent: 'space-between',
    },
    header: {
        paddingTop: spacing.xxl,
    },
    title: {
        fontSize: typography['4xl'],
        fontWeight: '700',
        color: colors.text,
        lineHeight: 44,
    },
    subtitle: {
        fontSize: typography.lg,
        color: colors.muted,
        marginTop: spacing.md,
    },
    selectorContainer: {
        alignItems: 'center',
    },
    moodMessage: {
        marginTop: spacing.xl,
        fontSize: typography.lg,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    footer: {
        paddingBottom: spacing.xl,
    },
});
