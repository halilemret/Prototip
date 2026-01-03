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
import { useTranslation } from '@/hooks/useTranslation';
import { ShieldCheck, Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
    const { t } = useTranslation();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const signIn = useAuthStore((state) => state.signIn);
    const signUp = useAuthStore((state) => state.signUp);
    const isLoading = useAuthStore((state) => state.isLoading);
    const completeOnboarding = useUserStore((state) => state.completeOnboarding);

    const handleSubmit = async () => {
        if (!email.includes('@') || password.length < 6) {
            Alert.alert(t.common.error, mode === 'signup' ? 'Kayıt bilgileri geçersiz (min 6 karakter)' : 'Email veya şifre hatalı');
            return;
        }

        let result;
        if (mode === 'signup') {
            result = await signUp(email, password);
        } else {
            result = await signIn(email, password);
        }

        if (result.error) {
            Alert.alert(t.common.error, result.error.message);
        } else {
            if (mode === 'signup') {
                const isConfirmed = result.data?.session;
                if (!isConfirmed) {
                    Alert.alert(
                        t.auth.titleSignup,
                        'Lütfen e-posta adresinizi doğrulayın.',
                        [{ text: t.common.done, onPress: () => setMode('signin') }]
                    );
                    return;
                }
            }

            // Success
            completeOnboarding();
            router.replace('/(main)');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {mode === 'signin' ? t.auth.titleSignin : t.auth.titleSignup}
                    </Text>
                    <Text style={styles.subtitle}>
                        {mode === 'signin'
                            ? t.auth.subtitleSignin
                            : t.auth.subtitleSignup}
                    </Text>
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder={t.auth.emailPlaceholder}
                        placeholderTextColor={colors.muted}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder={t.auth.passwordPlaceholder}
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
                        {mode === 'signin' ? t.auth.signinBtn : t.auth.signupBtn}
                    </HapticButton>

                    <Pressable
                        onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        style={styles.toggleButton}
                    >
                        <Text style={styles.toggleText}>
                            {mode === 'signin'
                                ? t.auth.toggleSignin
                                : t.auth.toggleSignup}
                        </Text>
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <View style={styles.securityRow}>
                        <ShieldCheck size={16} color={colors.success} />
                        <Text style={styles.securityNote}>{t.auth.securityNote}</Text>
                    </View>
                    <Pressable style={styles.privacyButton}>
                        <Text style={styles.privacyText}>{t.auth.privacyPolicy}</Text>
                    </Pressable>
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
        marginBottom: spacing.xxl,
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
        marginTop: spacing.xxl,
        alignItems: 'center',
        gap: spacing.sm,
    },
    securityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: 4,
    },
    securityNote: {
        fontSize: typography.xs,
        color: colors.muted,
    },
    privacyButton: {
        padding: spacing.xs,
    },
    privacyText: {
        fontSize: typography.xs,
        color: colors.action,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
