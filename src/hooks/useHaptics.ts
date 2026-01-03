// ============================================
// ONYX - Haptics Hook
// Calibrated feedback for different task actions
// ============================================

import * as Haptics from 'expo-haptics';
import { useUserStore } from '@/stores/user.store';

type HapticType =
    | 'light'
    | 'medium'
    | 'heavy'
    | 'success'
    | 'warning'
    | 'error'
    | 'selection';

export const useHaptics = () => {
    const hapticsEnabled = useUserStore((state) => state.hapticsEnabled);

    const trigger = async (type: HapticType = 'light') => {
        if (!hapticsEnabled) return;

        try {
            switch (type) {
                case 'light':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case 'success':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'warning':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case 'error':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                case 'selection':
                    await Haptics.selectionAsync();
                    break;
            }
        } catch (error) {
            // Silently fail - haptics not critical
            console.warn('[Haptics] Trigger failed:', error);
        }
    };

    // Helper for async delay
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // ============================================
    // Semantic Haptic Patterns (Calibrated)
    // ============================================

    // Single micro-step completed
    const stepComplete = () => trigger('success');

    // Full task completed - celebratory combo
    const taskComplete = async () => {
        if (!hapticsEnabled) return;
        await trigger('heavy');
        await wait(100);
        await trigger('success');
    };

    // Jump to easy win (candy step)
    const candyJump = () => trigger('medium');

    // Time bet placed - confirmation pulse
    const betPlaced = async () => {
        if (!hapticsEnabled) return;
        await trigger('medium');
        await wait(50);
        await trigger('light');
    };

    // Time bet won - triple celebration
    const betWon = async () => {
        if (!hapticsEnabled) return;
        for (let i = 0; i < 3; i++) {
            await trigger('success');
            await wait(80);
        }
    };

    // Time bet lost - single error
    const betLost = () => trigger('error');

    // Level up - ultimate celebration pattern
    const levelUp = async () => {
        if (!hapticsEnabled) return;
        await trigger('heavy');
        await wait(150);
        await trigger('success');
        await wait(100);
        await trigger('medium');
    };

    // Shake to unstuck - attention grabber
    const shake = () => trigger('warning');

    // Achievement unlocked - special pattern
    const achievementUnlocked = async () => {
        if (!hapticsEnabled) return;
        await trigger('success');
        await wait(100);
        await trigger('medium');
        await wait(80);
        await trigger('light');
    };

    // Forgiveness protocol activated - gentle comfort
    const forgiveness = async () => {
        if (!hapticsEnabled) return;
        await trigger('light');
        await wait(150);
        await trigger('light');
    };

    return {
        // Base triggers
        trigger,
        light: () => trigger('light'),
        medium: () => trigger('medium'),
        heavy: () => trigger('heavy'),
        success: () => trigger('success'),
        warning: () => trigger('warning'),
        error: () => trigger('error'),
        selection: () => trigger('selection'),

        // Semantic patterns (calibrated)
        stepComplete,
        taskComplete,
        candyJump,
        betPlaced,
        betWon,
        betLost,
        levelUp,
        shake,
        achievementUnlocked,
        forgiveness,
    };
};

export default useHaptics;
