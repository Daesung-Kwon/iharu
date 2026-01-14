/**
 * DraggableActivityCard 컴포넌트
 * 드래그 가능한 활동 카드 (일정 만들기 화면용)
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Activity } from '../types';
import { ActivityEmojis } from '../constants/emojis';
import { ActivityMaterialColors } from '../constants/materialDesign';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
    background: '#FFF9F0', // Cream
    primary: '#FF6B6B', // Soft Red
    secondary: '#FFD93D', // Banana Yellow
    text: '#2D3436', // Soft Black
    textSecondary: '#636E72', // Soft Gray
    white: '#FFFFFF',
};

interface DraggableActivityCardProps {
    activity: Activity;
    onDragStart?: () => void;
    onDragEnd?: () => void;
    onPress?: () => void;
    isDragging?: boolean;
}

export default function DraggableActivityCard({
    activity,
    onDragStart,
    onDragEnd,
    onPress,
    isDragging = false
}: DraggableActivityCardProps) {
    const emoji = ActivityEmojis[activity.emojiKey] || activity.emojiKey;
    const colorScheme = ActivityMaterialColors[activity.colorKey];

    const scaleAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        console.log('Card pressed, isDragging:', isDragging);
        if (!isDragging) {
            onPress?.();
        }
    };

    const handleLongPress = () => {
        console.log('Card long pressed:', activity.name);
        onDragStart?.();
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1.1,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0.7,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        if (isDragging) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1.1,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0.7,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
            onDragEnd?.();
        }
    }, [isDragging]);

    const animatedStyle = {
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
    };

    return (
        <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            delayLongPress={500}
        >
            {({ pressed }) => (
                <Animated.View
                    style={[
                        styles.card,
                        { backgroundColor: colorScheme.surface || SoftPopColors.white },
                        animatedStyle,
                        isDragging && styles.cardDragging,
                        pressed && !isDragging && styles.cardPressed
                    ]}
                >
                    {/* Dragging Badge */}
                    {isDragging && (
                        <View style={styles.draggingBadge}>
                            <Text style={styles.draggingBadgeText}>선택 됨</Text>
                        </View>
                    )}

                    {/* Drag Handle + Emoji Group (붙여서 배치) */}
                    <View style={styles.leftGroup}>
                        <View style={styles.dragHandle}>
                            <MaterialIcons
                                name="drag-handle"
                                size={22}
                                color={isDragging ? SoftPopColors.primary : SoftPopColors.textSecondary}
                            />
                        </View>
                        <View style={styles.emojiContainer}>
                            <Text style={styles.emoji}>{emoji}</Text>
                        </View>
                    </View>

                    {/* Info (텍스트 영역 - 최대한 넓게) */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.name} numberOfLines={2}>
                            {activity.name}
                        </Text>
                        <View style={styles.durationContainer}>
                            <MaterialIcons
                                name="schedule"
                                size={16}
                                color={SoftPopColors.textSecondary}
                            />
                            <Text style={styles.duration}>
                                {activity.durationMinutes}분
                            </Text>
                        </View>
                    </View>
                </Animated.View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 24, // rounded-3xl
        padding: 20,
        marginBottom: 12,
        backgroundColor: SoftPopColors.white,
        borderWidth: 2,
        borderColor: SoftPopColors.white,
        // Soft floating effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        minHeight: 88,
    },
    cardPressed: {
        transform: [{ translateY: 2 }],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    leftGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4, // 드래그 핸들과 이모지를 최대한 붙임
    },
    dragHandle: {
        justifyContent: 'center',
        paddingRight: 0, // 패딩 제거
    },
    emojiContainer: {
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: SoftPopColors.background,
        borderRadius: 16,
    },
    emoji: {
        fontSize: 36,
    },
    infoContainer: {
        flex: 1,
        gap: 8,
        marginLeft: 12, // 왼쪽 그룹과 텍스트 영역 사이 간격만 유지
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        color: SoftPopColors.text,
        lineHeight: 24,
        fontFamily: 'BMJUA',
    },
    durationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    duration: {
        fontSize: 14,
        color: SoftPopColors.textSecondary,
        lineHeight: 20,
        fontFamily: 'BMJUA',
    },
    cardDragging: {
        borderWidth: 4,
        borderColor: SoftPopColors.primary,
        backgroundColor: '#FFF0F0',
        // Strong shadow for dragging
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 10,
    },
    draggingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: SoftPopColors.primary,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
        // 3D effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    draggingBadgeText: {
        fontSize: 12,
        color: SoftPopColors.white,
        fontWeight: '700',
    },
});

