'use client';

import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from '@react-native-community/blur'; // 또는 expo-blur

interface DuplicateErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorType: 'email' | 'phone';
}

/**
 * 네이티브용 중복 오류 모달 컴포넌트
 * 웹과 동일한 사용자 경험을 제공
 */
export const DuplicateErrorModal: React.FC<DuplicateErrorModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  errorType
}) => {
  const getErrorMessage = () => {
    switch (errorType) {
      case 'email':
        return '이미 등록된 이메일입니다.';
      case 'phone':
        return '이미 등록된 전화번호입니다.';
      default:
        return '중복된 정보가 있습니다.';
    }
  };

  const getFieldName = () => {
    switch (errorType) {
      case 'email':
        return '이메일';
      case 'phone':
        return '전화번호';
      default:
        return '정보';
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <BlurView
          style={styles.blurView}
          blurType="dark"
          blurAmount={10}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>⚠️</Text>
              </View>

              {/* 제목 */}
              <Text style={styles.title}>중복 오류</Text>

              {/* 메시지 */}
              <View style={styles.messageContainer}>
                <Text style={styles.errorMessage}>{getErrorMessage()}</Text>
                <Text style={styles.subMessage}>
                  {getFieldName()}을 정확하게 입력해주세요.
                </Text>
              </View>

              {/* 버튼들 */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={onRetry}
                >
                  <Text style={styles.retryButtonText}>다시 입력하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#FEF2F2',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  messageContainer: {
    marginBottom: 24,
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  retryButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default DuplicateErrorModal;
