/**
 * 이용약관 모달
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TERMS_OF_SERVICE } from '../data/terms';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
};

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function TermsModal({ visible, onClose }: TermsModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>이용약관</Text>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.closeButtonPressed
            ]}
            onPress={onClose}
            accessibilityLabel="닫기"
          >
            <MaterialIcons 
              name="close" 
              size={24} 
              color={SoftPopColors.text} 
            />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.text}>{TERMS_OF_SERVICE}</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SoftPopColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
    borderBottomWidth: 2,
    borderBottomColor: SoftPopColors.background,
    backgroundColor: SoftPopColors.white,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: SoftPopColors.text,
    lineHeight: 32,
    fontFamily: 'BMJUA',
  },
  closeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 24, // rounded-full
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 32,
  },
  text: {
    fontSize: 16,
    fontWeight: '400',
    color: SoftPopColors.text,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
});
