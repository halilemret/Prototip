// ============================================
// ONYX - Haptics Hook
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

    return {
        trigger,
        light: () => trigger('light'),
        medium: () => trigger('medium'),
        heavy: () => trigger('heavy'),
        success: () => trigger('success'),
        warning: () => trigger('warning'),
        error: () => trigger('error'),
        selection: () => trigger('selection'),
    };
};

export default useHaptics;
