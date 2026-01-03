// ============================================
// ONYX - Deep Link Service
// Handles URL routing for notifications and external links
// ============================================

import * as Linking from 'expo-linking';
import { router } from 'expo-router';

type DeepLinkPath = 'new-task' | 'focus' | 'museum' | 'settings' | 'history';

const VALID_PATHS: DeepLinkPath[] = ['new-task', 'focus', 'museum', 'settings', 'history'];

export const DeepLinkService = {
    /**
     * Initialize deep link handling
     * Call this in the root _layout.tsx after app is ready
     */
    initialize: async () => {
        try {
            // Handle initial URL (app opened via link)
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                DeepLinkService.handleUrl(initialUrl);
            }

            // Listen for incoming links while app is open
            const subscription = Linking.addEventListener('url', ({ url }) => {
                DeepLinkService.handleUrl(url);
            });

            // Return cleanup function
            return () => subscription.remove();
        } catch (error) {
            console.warn('[DeepLink] Initialize failed:', error);
        }
    },

    /**
     * Handle incoming deep link URL
     * URL format: onyx://path
     */
    handleUrl: (url: string) => {
        try {
            const parsed = Linking.parse(url);
            const path = parsed.path as DeepLinkPath;

            console.log('[DeepLink] Received:', url, 'Path:', path);

            if (!path || !VALID_PATHS.includes(path)) {
                console.warn('[DeepLink] Invalid path:', path);
                return;
            }

            // Small delay to ensure navigation stack is ready
            setTimeout(() => {
                switch (path) {
                    case 'new-task':
                        router.push('/(main)/new-task');
                        break;
                    case 'focus':
                        router.replace('/(main)');
                        break;
                    case 'museum':
                        router.push('/(main)/museum' as any);
                        break;
                    case 'settings':
                        router.push('/(main)/settings');
                        break;
                    case 'history':
                        router.push('/(main)/history');
                        break;
                    default:
                        console.log('[DeepLink] Unhandled path:', path);
                }
            }, 100);
        } catch (error) {
            console.warn('[DeepLink] Handle URL failed:', error);
        }
    },

    /**
     * Create a deep link URL for the given path
     * Used when scheduling notifications with navigation data
     */
    createUrl: (path: DeepLinkPath): string => {
        return Linking.createURL(path);
    },

    /**
     * Get all valid deep link paths
     */
    getValidPaths: (): DeepLinkPath[] => {
        return [...VALID_PATHS];
    },
};

export default DeepLinkService;
