// ============================================
// ONYX - Glass Surface Component (Liquid Glass)
// iOS 26 inspired glassmorphism effect
// ============================================

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens, borderRadius } from '@/constants/theme';

type GlassIntensity = 'light' | 'medium' | 'heavy';
type GlassVariant = 'surface' | 'card' | 'modal' | 'floating';

interface GlassSurfaceProps {
    children: React.ReactNode;
    intensity?: GlassIntensity;
    variant?: GlassVariant;
    style?: ViewStyle;
    noBorder?: boolean;
    noShadow?: boolean;
    accentGlow?: boolean;
}

export const GlassSurface: React.FC<GlassSurfaceProps> = ({
    children,
    intensity = 'medium',
    variant = 'surface',
    style,
    noBorder = false,
    noShadow = false,
    accentGlow = false,
}) => {
    const { theme, colors } = useTheme();
    const isDark = theme === 'dark';

    // Get blur intensity based on prop
    const blurIntensity = glassTokens.blur[intensity];

    // Get opacity based on variant and theme
    const getOpacity = () => {
        const opacitySet = isDark ? glassTokens.darkOpacity : glassTokens.lightOpacity;
        switch (variant) {
            case 'modal':
                return opacitySet.overlay;
            case 'floating':
                return opacitySet.primary;
            case 'card':
                return opacitySet.secondary;
            default:
                return opacitySet.tertiary;
        }
    };

    // Get border radius based on variant
    const getRadius = () => {
        switch (variant) {
            case 'modal':
                return borderRadius.xl;
            case 'floating':
                return borderRadius.lg;
            case 'card':
                return borderRadius.lg;
            default:
                return borderRadius.md;
        }
    };

    const containerStyle: ViewStyle = {
        borderRadius: getRadius(),
        overflow: 'hidden',
        ...(noShadow ? {} : glassTokens.glassShadow),
        ...(accentGlow ? glassTokens.glowShadow : {}),
    };

    const borderStyle: ViewStyle = noBorder ? {} : {
        borderWidth: 1,
        borderColor: isDark ? glassTokens.borderGlow.dark : glassTokens.borderGlow.light,
    };

    const overlayStyle: ViewStyle = {
        backgroundColor: isDark
            ? `rgba(20, 20, 20, ${getOpacity()})`
            : `rgba(255, 255, 255, ${getOpacity()})`,
    };

    return (
        <View style={[containerStyle, borderStyle, style]}>
            {/* Blur layer */}
            <BlurView
                intensity={blurIntensity}
                tint={isDark ? 'dark' : 'light'}
                style={StyleSheet.absoluteFill}
            />

            {/* Tinted overlay for depth */}
            <View style={[StyleSheet.absoluteFill, overlayStyle]} />

            {/* Inner highlight for 3D effect */}
            <View
                style={[
                    StyleSheet.absoluteFill,
                    styles.innerHighlight,
                    {
                        borderColor: isDark
                            ? glassTokens.innerHighlight.dark
                            : glassTokens.innerHighlight.light
                    }
                ]}
            />

            {/* Content */}
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    innerHighlight: {
        borderTopWidth: 1,
        borderLeftWidth: 0.5,
        borderRightWidth: 0.5,
        borderBottomWidth: 0,
        borderRadius: borderRadius.lg,
    },
    content: {
        position: 'relative',
        zIndex: 1,
    },
});

export default GlassSurface;
