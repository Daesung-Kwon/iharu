/**
 * 오픈소스 라이센스 모달
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { OPEN_SOURCE_LICENSES, FONT_LICENSES } from '../data/licenses';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
  link: '#2196F3', // Blue
};

interface LicenseModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LicenseModal({ visible, onClose }: LicenseModalProps) {
  const handleOpenURL = async (url?: string) => {
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={styles.container}
        edges={Platform.OS === 'android' ? ['top', 'bottom'] : ['top']}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>오픈소스 라이센스</Text>
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
          {/* 오픈소스 라이브러리 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오픈소스 라이브러리</Text>
            {OPEN_SOURCE_LICENSES.map((license, index) => (
              <View key={index} style={styles.licenseItem}>
                <View style={styles.licenseHeader}>
                  <Text style={styles.licenseName}>{license.name}</Text>
                  {license.version && (
                    <Text style={styles.licenseVersion}>{license.version}</Text>
                  )}
                </View>
                <View style={styles.licenseMeta}>
                  <View style={styles.licenseTag}>
                    <Text style={styles.licenseTagText}>{license.license}</Text>
                  </View>
                  {license.url && (
                    <Pressable
                      onPress={() => handleOpenURL(license.url)}
                      style={styles.linkButton}
                    >
                      <MaterialIcons
                        name="open-in-new"
                        size={16}
                        color={SoftPopColors.link}
                      />
                      <Text style={styles.linkText}>웹사이트</Text>
                    </Pressable>
                  )}
                </View>
                {license.description && (
                  <Text style={styles.licenseDescription}>{license.description}</Text>
                )}
              </View>
            ))}
          </View>

          {/* 폰트 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>폰트</Text>
            {FONT_LICENSES.map((font, index) => (
              <View key={index} style={styles.licenseItem}>
                <View style={styles.licenseHeader}>
                  <Text style={styles.licenseName}>{font.name}</Text>
                </View>
                <View style={styles.licenseMeta}>
                  <View style={styles.licenseTag}>
                    <Text style={styles.licenseTagText}>{font.license}</Text>
                  </View>
                  {font.url && (
                    <Pressable
                      onPress={() => handleOpenURL(font.url)}
                      style={styles.linkButton}
                    >
                      <MaterialIcons
                        name="open-in-new"
                        size={16}
                        color={SoftPopColors.link}
                      />
                      <Text style={styles.linkText}>웹사이트</Text>
                    </Pressable>
                  )}
                </View>
                {font.description && (
                  <Text style={styles.licenseDescription}>{font.description}</Text>
                )}
              </View>
            ))}
          </View>

          {/* 안내 문구 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              각 오픈소스의 상세 라이센스 내용은 해당 프로젝트의 저장소에서 확인하실 수 있습니다.
            </Text>
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    lineHeight: 32,
    fontFamily: 'BMJUA',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
  },
  closeButtonPressed: {
    backgroundColor: '#E8E8E8',
    transform: [{ scale: 0.95 }],
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    marginBottom: 20,
    lineHeight: 28,
    fontFamily: 'BMJUA',
  },
  licenseItem: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  licenseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  licenseName: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? 'normal' : '600',
    color: SoftPopColors.text,
    flex: 1,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  licenseVersion: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    marginLeft: 12,
    fontFamily: 'BMJUA',
  },
  licenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  licenseTag: {
    backgroundColor: SoftPopColors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  licenseTagText: {
    fontSize: 14,
    fontWeight: Platform.OS === 'android' ? 'normal' : '600',
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.link,
    textDecorationLine: 'underline',
    fontFamily: 'BMJUA',
  },
  licenseDescription: {
    fontSize: 14,
    color: SoftPopColors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: 'BMJUA',
  },
  footer: {
    marginTop: 16,
    padding: 20,
    backgroundColor: SoftPopColors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
  },
  footerText: {
    fontSize: 14,
    color: SoftPopColors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: 'BMJUA',
  },
});
