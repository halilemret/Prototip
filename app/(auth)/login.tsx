// ============================================
// ONYX - Login Screen (Email/Password)
// ============================================

import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HapticButton } from '@/components';
import { useAuthStore } from '@/stores/auth.store';
import { useUserStore } from '@/stores/user.store';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';

export default function LoginScreen() {
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = useAuthStore((state) => state.signIn);
    const signUp = useAuthStore((state) => state.signUp);
    const isLoading = useAuthStore((state) => state.isLoading);
    const completeOnboarding = useUserStore((state) => state.completeOnboarding);

    const handleSubmit = async () => {
        if (!email.includes('@') || password.length < 6) {
            Alert.alert('Invalid Input', 'Please check your email and password (min 6 chars).');
            return;
        }

        let result;
        if (mode === 'signup') {
            result = await signUp(email, password);
        } else {
            result = await signIn(email, password);
        }

        if (result.error) {
            Alert.alert('Error', result.error.message);
        } else {
            if (mode === 'signup') {
                // Check if email confirmation is required
                const isConfirmed = result.data?.session; // If session exists, auto-confirmed
                if (!isConfirmed) {
                    Alert.alert(
                        'Account Created',
                        'Please verify your email address to continue.',
                        [{ text: 'OK', onPress: () => setMode('signin') }]
                    );
                    return;
                }
            }

            // Success
            completeOnboarding();
            router.replace('/(main)');
        }
    };

    const handleSkip = () => {
        completeOnboarding();
        router.replace('/(main)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {mode === 'signin' ? 'Welcome back' : 'Create Account'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {mode === 'signin'
                            ? 'Sign in to access your pro features and history.'
                            : 'Join Onyx to start your journey.'}
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={colors.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor={colors.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <HapticButton
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={handleSubmit}
                        isLoading={isLoading}
                        style={styles.button}
                    >
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </HapticButton>

                    <Pressable
                        onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        style={styles.toggleButton}
                    >
                        <Text style={styles.toggleText}>
                            {mode === 'signin'
                                ? "Don't have an account? Sign Up"
                                : "Already have an account? Sign In"}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <HapticButton
                        variant="secondary"
                        size="md"
                        onPress={handleSkip}
                    >
                        Skip for now
                    </HapticButton>
                </View>
            </KeyboardAvoidingView>
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
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: typography['3xl'],
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.base,
        color: colors.muted,
        lineHeight: 24,
    },
    form: {
        gap: spacing.lg,
    },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        fontSize: typography.lg,
        color: colors.text,
    },
    button: {
        marginTop: spacing.md,
    },
    toggleButton: {
        alignSelf: 'center',
        padding: spacing.sm,
    },
    toggleText: {
        color: colors.muted,
        fontSize: typography.base,
        fontWeight: '600',
    },
    footer: {
        marginTop: spacing['3xl'],
        alignItems: 'center',
    },
});
