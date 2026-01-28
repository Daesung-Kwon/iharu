import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    runOnJS,
    Easing,
    interpolateColor,
} from 'react-native-reanimated';
import { Text } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color Palette
const NIGHT_SKY = '#1a1a2e';
const MORNING_SKY = '#FFF8E7'; // App Background Color
const SUN_COLOR = '#FF9F43'; // Warm Orange

interface SplashScreenProps {
    onFinish: () => void;
}

const GLOW_COLOR = '#FFBF7F';

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    // Animation Values
    const animationProgress = useSharedValue(0);
    const sunPosition = useSharedValue(height); // Start from bottom
    const textOpacity = useSharedValue(0);
    const glowScale = useSharedValue(1);

    useEffect(() => {
        // 1. Start Animation Sequence
        animationProgress.value = withTiming(1, { duration: 2000 });

        // 2. Sun Rising (더 높은 위치로 조정 - 가로/세로 모드 모두 고려)
        const targetPosition = Math.min(height * 0.35, height / 2 - 100);
        sunPosition.value = withTiming(targetPosition, {
            duration: 1500,
            easing: Easing.out(Easing.exp),
        });

        // 3. Flame/Glow Effect (Looping)
        // Start glow after sun rises a bit
        setTimeout(() => {
            glowScale.value = withRepeat(
                withSequence(
                    withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                    withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
                ),
                -1, // Infinite
                true // Reverse
            );
        }, 800);

        // 4. Text Fading In (Delayed)
        textOpacity.value = withDelay(
            800,
            withTiming(1, { duration: 800 })
        );

        // 5. End Animation & Callback
        const timeout = setTimeout(() => {
            onFinish();
        }, 2500); // Total duration

        return () => clearTimeout(timeout);
    }, []);

    // Background Color Transition (Night -> Morning)
    const animatedBackgroundStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animationProgress.value,
            [0, 1],
            [NIGHT_SKY, MORNING_SKY]
        );
        return { backgroundColor };
    });

    // Sun Animation Style
    const animatedSunStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: sunPosition.value }],
        };
    });

    // Glow Animation Style
    const animatedGlowStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: glowScale.value }],
            opacity: 0.6,
        };
    });

    // Second Glow (Offset)
    const animatedGlow2Style = useAnimatedStyle(() => {
        return {
            transform: [{ scale: glowScale.value * 1.1 }],
            opacity: 0.3,
        };
    });

    // Text Animation Style
    const animatedTextStyle = useAnimatedStyle(() => {
        return {
            opacity: textOpacity.value,
            transform: [
                { scale: 0.8 + textOpacity.value * 0.2 }, // Slightly scale up
            ],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedBackgroundStyle]}>
            {/* Sun Container */}
            <Animated.View style={[styles.sunContainer, animatedSunStyle]}>
                {/* Glow Layers (Behind Sun) */}
                <Animated.View style={[styles.glow, animatedGlow2Style]} />
                <Animated.View style={[styles.glow, animatedGlowStyle]} />
                {/* Sun */}
                <View style={styles.sun} />
            </Animated.View>

            {/* App Title / Logo */}
            <View style={styles.textContainer}>
                <Animated.Text style={[styles.title, animatedTextStyle]}>
                    i하루
                </Animated.Text>
                <Animated.Text style={[styles.subtitle, animatedTextStyle]}>
                    매일의 소중한 기록
                </Animated.Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    sunContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
        top: 0,
        left: 0,
    },
    sun: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: SUN_COLOR,
        shadowColor: '#FF9F43',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
        zIndex: 2,
    },
    glow: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: GLOW_COLOR,
        zIndex: 1,
    },
    textContainer: {
        position: 'absolute',
        top: '50%',
        alignItems: 'center',
        transform: [{ translateY: -40 }], // 중앙에서 약간 위로
    },
    title: {
        fontSize: 48,
        fontFamily: 'BMJUA',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'BMJUA',
        color: '#666',
    },
});
