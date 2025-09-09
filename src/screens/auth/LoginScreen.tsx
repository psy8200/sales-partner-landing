import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { lightTheme } from '../../styles/theme';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import SuccessModal from '../../components/native/modals/SuccessModal';
import ErrorModal from '../../components/native/modals/ErrorModal';
import WarningModal from '../../components/native/modals/WarningModal';

export const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setModalMessage('전화번호와 비밀번호를 입력해주세요.');
      setShowWarningModal(true);
      return;
    }

    if (phone.length !== 8) {
      setModalMessage('8자리 전화번호를 입력해주세요.');
      setShowWarningModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(phone, password);
      if (success) {
        // 로그인 성공 시 /member 페이지로 자동 이동
        setModalMessage('로그인에 성공했습니다!');
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push('/member');
        }, 1500);
      } else {
        setModalMessage('전화번호 또는 비밀번호가 올바르지 않습니다.');
        setShowErrorModal(true);
      }
    } catch (error) {
      setModalMessage('로그인 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sales Partner</Text>
          <Text style={styles.subtitle}>회원 로그인</Text>
        </View>

        <Card style={styles.formCard} shadow="lg">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>전화번호 (뒤 8자리로 로그인)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={(value: string) => {
                // 숫자와 하이픈만 허용
                const cleanValue = value.replace(/[^0-9-]/g, '');
                setPhone(cleanValue);
              }}
              placeholder="010-0000-0000 또는 00000000"
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.helperText}>
              전체 전화번호 또는 뒤 8자리 모두 입력 가능합니다
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(value: string) => setPassword(value)}
              placeholder="비밀번호를 입력하세요"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title="로그인"
            onPress={handleLogin}
            loading={isLoading}
            style={styles.loginButton}
          />
        </Card>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            계정이 없으신가요?{' '}
            <Text style={styles.linkText}>회원가입</Text>
          </Text>
        </View>
      </View>

      {/* 모달들 */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={modalMessage}
      />

      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={modalMessage}
      />

      <WarningModal
        visible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        message={modalMessage}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: lightTheme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: lightTheme.spacing.xxl,
  },
  title: {
    fontSize: lightTheme.typography.fontSize.xxxl,
    fontWeight: lightTheme.typography.fontWeight.bold,
    color: lightTheme.colors.primary,
    marginBottom: lightTheme.spacing.sm,
  },
  subtitle: {
    fontSize: lightTheme.typography.fontSize.lg,
    color: lightTheme.colors.textSecondary,
  },
  formCard: {
    marginBottom: lightTheme.spacing.xl,
  },
  inputGroup: {
    marginBottom: lightTheme.spacing.lg,
  },
  label: {
    fontSize: lightTheme.typography.fontSize.sm,
    fontWeight: lightTheme.typography.fontWeight.medium,
    color: lightTheme.colors.text,
    marginBottom: lightTheme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: lightTheme.colors.border,
    borderRadius: lightTheme.borderRadius.md,
    paddingHorizontal: lightTheme.spacing.md,
    paddingVertical: lightTheme.spacing.md,
    fontSize: lightTheme.typography.fontSize.md,
    color: lightTheme.colors.text,
    backgroundColor: lightTheme.colors.background,
  },
  loginButton: {
    marginTop: lightTheme.spacing.md,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: lightTheme.typography.fontSize.sm,
    color: lightTheme.colors.textSecondary,
  },
  linkText: {
    color: lightTheme.colors.primary,
    fontWeight: lightTheme.typography.fontWeight.medium,
  },
});
