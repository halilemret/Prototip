
import { Platform } from 'react-native';

// CRITICAL HOTFIX:
// The 'expo-notifications' module requires native linking which seems missing or broken in the current build.
// We are completely disabling the module import to prevent the [Error: Cannot find native module] crash.
// To re-enable, the app needs to be rebuilt with `npx expo run:ios` or `npx expo run:android`.

export const NotificationService = {
    async requestPermissions(): Promise<boolean> {
        console.warn('[NotificationService] Module disabled to prevent crash. Please rebuild native app.');
        return false;
    },

    async scheduleStreakReminder() {
        // No-op
    },

    getRandomMessage(type: 'streak_risk' | 'inactive_3d' | 'inactive_7d'): string {
        // Return dummy strings for safe usage if needed elsewhere
        const messages = {
            streak_risk: "Keep the streak alive!",
            inactive_3d: "Come back and focus.",
            inactive_7d: "We miss you!"
        };
        return messages[type];
    },

    async cancelAllNotifications() {
        // No-op
    }
};
