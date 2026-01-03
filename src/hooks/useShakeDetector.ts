import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Constants
const SHAKE_THRESHOLD = 1.78; // G-force threshold
const SHAKE_DELAY = 3000; // Time between shakes (ms)
const CHECK_INTERVAL = 100; // Sensor update interval (ms)

const getAccelerometer = () => {
    try {
        return require('expo-sensors').Accelerometer;
    } catch {
        return null;
    }
};

export const useShakeDetector = (onShake: () => void) => {
    const [isAvailable, setIsAvailable] = useState(false);
    const lastShakeRef = useRef<number>(0);
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        if (Platform.OS === 'web') return;

        const checkAvailability = async () => {
            try {
                const Accelerometer = getAccelerometer();
                if (!Accelerometer) return;
                const available = await Accelerometer.isAvailableAsync();
                setIsAvailable(available);
            } catch (error) {
                console.warn('[ShakeDetector] Sensor module unavailable:', error);
                setIsAvailable(false);
            }
        };

        checkAvailability();
    }, []);

    useEffect(() => {
        const Accelerometer = getAccelerometer();
        if (!isAvailable || !Accelerometer) return;

        try {
            Accelerometer.setUpdateInterval(CHECK_INTERVAL);

            subscriptionRef.current = Accelerometer.addListener(({ x, y, z }: { x: number, y: number, z: number }) => {
                const totalForce = Math.sqrt(x * x + y * y + z * z);

                if (totalForce > SHAKE_THRESHOLD) {
                    const now = Date.now();

                    if (now - lastShakeRef.current > SHAKE_DELAY) {
                        console.log('[Shake] Detected! Force:', totalForce.toFixed(2));
                        lastShakeRef.current = now;
                        onShake();
                    }
                }
            });
        } catch (error) {
            console.error('[ShakeDetector] Setup error:', error);
        }

        return () => {
            if (subscriptionRef.current) {
                try {
                    subscriptionRef.current.remove();
                } catch (e) { }
                subscriptionRef.current = null;
            }
        };
    }, [isAvailable, onShake]);

    return { isAvailable };
};

