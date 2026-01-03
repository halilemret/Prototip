import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useTimerStore } from '@/stores/timer.store';

export const TimerManager = () => {
    const isRunning = useTimerStore((s) => s.isRunning);
    const tick = useTimerStore((s) => s.tick);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Global Interval (Heartbeat)
    useEffect(() => {
        if (isRunning) {
            // Start ticking
            intervalRef.current = setInterval(() => {
                tick();
            }, 1000);
        } else {
            // Stop ticking
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning]);

    // App State Sync
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                // Force an immediate tick to update UI from background timestamp diff
                tick();
            }
        });

        return () => {
            subscription.remove();
        };
    }, []);

    return null; // Invisible component
};
