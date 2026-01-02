// ============================================
// ONYX - Auth Store (Email/Password)
// ============================================

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { RevenueCatService } from '@/services/revenuecat.service';
import { useSubscriptionStore } from '@/stores/subscription.store';

interface AuthState {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    initialized: boolean;

    initialize: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
    signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    session: null,
    user: null,
    isLoading: false,
    initialized: false,

    initialize: async () => {
        try {
            // Check current session
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                set({ session, user: session.user });
                // Identify user in RevenueCat & update subscription
                const info = await RevenueCatService.setUserId(session.user.id);
                if (info) {
                    useSubscriptionStore.getState().setCustomerInfo(info);
                }
            }

            // Listen for changes
            supabase.auth.onAuthStateChange(async (_event, session) => {
                set({ session, user: session?.user ?? null });

                if (session?.user) {
                    const info = await RevenueCatService.setUserId(session.user.id);
                    if (info) {
                        useSubscriptionStore.getState().setCustomerInfo(info);
                    }
                }
            });

            set({ initialized: true });
        } catch (error) {
            console.error('[AuthStore] Init failed:', error);
            set({ initialized: true });
        }
    },

    signIn: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (data.session?.user) {
                // Ensure RevenueCat gets the user ID immediately
                const info = await RevenueCatService.setUserId(data.session.user.id);
                if (data.session.user.email) {
                    await RevenueCatService.setEmail(data.session.user.email);
                }

                if (info) {
                    useSubscriptionStore.getState().setCustomerInfo(info);
                }
            }

            return { error };
        } finally {
            set({ isLoading: false });
        }
    },

    signUp: async (email, password) => {
        set({ isLoading: true });
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (data.session?.user) {
                // Ensure RevenueCat gets the user ID immediately
                const info = await RevenueCatService.setUserId(data.session.user.id);
                if (data.session.user.email) {
                    await RevenueCatService.setEmail(data.session.user.email);
                }

                if (info) {
                    useSubscriptionStore.getState().setCustomerInfo(info);
                }
            }

            return { data, error };
        } finally {
            set({ isLoading: false });
        }
    },

    signOut: async () => {
        set({ isLoading: true });
        try {
            await supabase.auth.signOut();
            await RevenueCatService.logOut();
            set({ session: null, user: null });

            // Reset subscription store
            useSubscriptionStore.getState().initialize();
        } finally {
            set({ isLoading: false });
        }
    },
}));
