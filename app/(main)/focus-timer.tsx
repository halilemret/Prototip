// ============================================
// ONYX - Focus Timer Screen (Pomodoro)
// Circular progress, timer controls, motivational messages
// ============================================

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, AppState } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import {
    ChevronLeft, Play, Pause, RotateCcw, SkipForward,
    Coffee, Brain, Settings, Trophy, Flame
} from 'lucide-react-native';
import { useTimerStore, formatTime, getProgress, BREAK_MESSAGES, FOCUS_START_MESSAGES } from '@/stores/timer.store';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/hooks/useTranslation';
import { useHaptics } from '@/hooks/useHaptics';
import { GlassSurface } from '@/components';
import { spacing, typography, borderRadius } from '@/constants/theme';

const CIRCLE_SIZE = 280;
const STROKE_WIDTH = 12;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function FocusTimerScreen() {
    const { colors, theme } = useTheme();
    const { language } = useTranslation();
    const haptics = useHaptics();
    const isDark = theme === 'dark';

    const [motivationalMessage, setMotivationalMessage] = useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Timer store
    const mode = useTimerStore((s) => s.mode);
    const isRunning = useTimerStore((s) => s.isRunning);
    const isPaused = useTimerStore((s) => s.isPaused);
    const remainingSeconds = useTimerStore((s) => s.remainingSeconds);
    const totalSeconds = useTimerStore((s) => s.totalSeconds);
    const currentPomodoroCount = useTimerStore((s) => s.currentPomodoroCount);
    const stats = useTimerStore((s) => s.stats);

    const start = useTimerStore((s) => s.start);
    const pause = useTimerStore((s) => s.pause);
    const resume = useTimerStore((s) => s.resume);
    const reset = useTimerStore((s) => s.reset);
    const skip = useTimerStore((s) => s.skip);
    const tick = useTimerStore((s) => s.tick);
    const hydrate = useTimerStore((s) => s.hydrate);

    const styles = createStyles(colors, isDark);

    // Hydrate on mount
    useEffect(() => {
        hydrate();
    }, []);


    // Pulse animation when running
    useEffect(() => {
        if (isRunning) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.02,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRunning]);

    // Update motivational message on mode change
    useEffect(() => {
        const messages = mode === 'focus'
            ? FOCUS_START_MESSAGES[language]
            : BREAK_MESSAGES[language];
        setMotivationalMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, [mode, language]);

    // Timer completed detection
    useEffect(() => {
        if (remainingSeconds === 0 && !isRunning && mode !== 'idle') {
            haptics.taskComplete();
        }
    }, [remainingSeconds, isRunning, mode]);

    const handleBack = () => {
        router.back();
    };

    const handleStartPause = () => {
        if (mode === 'idle' || remainingSeconds === 0) {
            haptics.medium();
            start('focus');
        } else if (isRunning) {
            haptics.light();
            pause();
        } else {
            haptics.medium();
            resume();
        }
    };

    const handleReset = () => {
        haptics.light();
        reset();
    };

    const handleSkip = () => {
        haptics.medium();
        skip();
    };

    const progress = getProgress(remainingSeconds, totalSeconds);
    const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

    const getModeLabel = () => {
        switch (mode) {
            case 'focus':
                return language === 'tr' ? 'ODAKLAN' : 'FOCUS';
            case 'shortBreak':
                return language === 'tr' ? 'KISA MOLA' : 'SHORT BREAK';
            case 'longBreak':
                return language === 'tr' ? 'UZUN MOLA' : 'LONG BREAK';
            default:
                return language === 'tr' ? 'HAZIR' : 'READY';
        }
    };

    const getModeColor = () => {
        switch (mode) {
            case 'focus':
                return colors.action;
            case 'shortBreak':
                return colors.success;
            case 'longBreak':
                return '#9B59B6'; // Purple
            default:
                return colors.muted;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <ChevronLeft size={28} color={colors.text} />
                </Pressable>
                <Text style={styles.screenTitle}>
                    {language === 'tr' ? 'Pomodoro' : 'Focus Timer'}
                </Text>
                <Pressable style={styles.settingsButton}>
                    <Settings size={22} color={colors.muted} />
                </Pressable>
            </View>

            {/* Stats Bar */}
            <GlassSurface variant="card" intensity="light" style={styles.statsBar}>
                <View style={styles.statItem}>
                    <Trophy size={16} color={colors.action} />
                    <Text style={styles.statValue}>{stats.todayPomodoros}</Text>
                    <Text style={styles.statLabel}>
                        {language === 'tr' ? 'Bugün' : 'Today'}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Flame size={16} color="#FF9500" />
                    <Text style={styles.statValue}>{currentPomodoroCount}</Text>
                    <Text style={styles.statLabel}>
                        {language === 'tr' ? 'Seri' : 'Streak'}
                    </Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Brain size={16} color={colors.success} />
                    <Text style={styles.statValue}>{stats.todayFocusMinutes}</Text>
                    <Text style={styles.statLabel}>
                        {language === 'tr' ? 'Dakika' : 'Minutes'}
                    </Text>
                </View>
            </GlassSurface>

            {/* Timer Circle */}
            <View style={styles.timerContainer}>
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                        {/* Background circle */}
                        <Circle
                            cx={CIRCLE_SIZE / 2}
                            cy={CIRCLE_SIZE / 2}
                            r={RADIUS}
                            stroke={colors.border}
                            strokeWidth={STROKE_WIDTH}
                            fill="transparent"
                        />
                        {/* Progress circle */}
                        <Circle
                            cx={CIRCLE_SIZE / 2}
                            cy={CIRCLE_SIZE / 2}
                            r={RADIUS}
                            stroke={getModeColor()}
                            strokeWidth={STROKE_WIDTH}
                            fill="transparent"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2}`}
                        />
                    </Svg>

                    {/* Timer display */}
                    <View style={styles.timerDisplay}>
                        <Text style={[styles.modeLabel, { color: getModeColor() }]}>
                            {getModeLabel()}
                        </Text>
                        <Text style={styles.timerText}>
                            {formatTime(remainingSeconds)}
                        </Text>
                        {mode !== 'idle' && (
                            <View style={styles.iconContainer}>
                                {mode === 'focus' ? (
                                    <Brain size={24} color={colors.muted} />
                                ) : (
                                    <Coffee size={24} color={colors.muted} />
                                )}
                            </View>
                        )}
                    </View>
                </Animated.View>
            </View>

            {/* Motivational Message */}
            <GlassSurface variant="floating" intensity="light" style={styles.messageCard}>
                <Text style={styles.messageText}>{motivationalMessage}</Text>
            </GlassSurface>

            {/* Controls */}
            <View style={styles.controls}>
                <Pressable onPress={handleReset} style={styles.secondaryButton}>
                    <RotateCcw size={24} color={colors.muted} />
                </Pressable>

                <Pressable
                    onPress={handleStartPause}
                    style={[styles.primaryButton, { backgroundColor: getModeColor() }]}
                >
                    {isRunning ? (
                        <Pause size={32} color="#FFF" fill="#FFF" />
                    ) : (
                        <Play size={32} color="#FFF" fill="#FFF" />
                    )}
                </Pressable>

                <Pressable
                    onPress={handleSkip}
                    style={[styles.secondaryButton, mode === 'idle' && styles.disabledButton]}
                    disabled={mode === 'idle'}
                >
                    <SkipForward size={24} color={mode === 'idle' ? colors.border : colors.muted} />
                </Pressable>
            </View>

            {/* XP Bonus Info */}
            <Text style={styles.xpInfo}>
                {language === 'tr'
                    ? `🎯 Pomodoro tamamla = +15 XP`
                    : `🎯 Complete pomodoro = +15 XP`}
            </Text>
        </SafeAreaView>
    );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
    },
    screenTitle: {
        fontSize: typography.xl,
        fontWeight: '700',
        color: colors.text,
    },
    settingsButton: {
        padding: spacing.xs,
    },

    // Stats bar
    statsBar: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: typography.xl,
        fontWeight: '800',
        color: colors.text,
    },
    statLabel: {
        fontSize: typography.xs,
        color: colors.muted,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.border,
    },

    // Timer
    timerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerDisplay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modeLabel: {
        fontSize: typography.sm,
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: spacing.xs,
    },
    timerText: {
        fontSize: 64,
        fontWeight: '200',
        color: colors.text,
        fontVariant: ['tabular-nums'],
    },
    iconContainer: {
        marginTop: spacing.sm,
    },

    // Message
    messageCard: {
        marginHorizontal: spacing.xl,
        marginBottom: spacing.xl,
        padding: spacing.md,
        alignItems: 'center',
    },
    messageText: {
        fontSize: typography.base,
        color: colors.text,
        textAlign: 'center',
        lineHeight: 22,
    },

    // Controls
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xl,
        marginBottom: spacing.xl,
    },
    primaryButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    secondaryButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    disabledButton: {
        opacity: 0.4,
    },

    // XP Info
    xpInfo: {
        fontSize: typography.sm,
        color: colors.muted,
        textAlign: 'center',
        marginBottom: spacing.xl,
    },
});
