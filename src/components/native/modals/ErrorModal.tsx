import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';

interface ErrorModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
}

const { width, height } = Dimensions.get('window');

export default function ErrorModal({ 
  visible, 
  onClose, 
  title = "오류 발생",
  message, 
  onConfirm,
  confirmText = "확인"
}: ErrorModalProps) {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <View style={styles.modalContainer}>
            {/* 아이콘 */}
            <View style={styles.iconContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.xMark}>✕</Text>
              </View>
            </View>

            {/* 제목 */}
            <Text style={styles.title}>❌ {title}</Text>
            
            {/* 메시지 */}
            <Text style={styles.message}>{message}</Text>

            {/* 확인 버튼 */}
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: width * 0.9,
    width: '100%',
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
    alignItems: 'center',
    marginBottom: 16,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xMark: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});


