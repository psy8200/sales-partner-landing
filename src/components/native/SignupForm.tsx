'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import SuccessModal from '../native/modals/SuccessModal';
import ErrorModal from '../native/modals/ErrorModal';
import DuplicateErrorModal from './DuplicateErrorModal';
import { useDuplicateError } from '@/hooks/useDuplicateError';

interface SignupFormProps {
  onSuccess?: () => void;
  onLogin?: () => void;
}

/**
 * 네이티브용 회원가입 폼 컴포넌트
 * 웹과 동일한 사용자 경험을 제공
 */
export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false,
    referralCode: ''
  });

  const [generatedReferralCode, setGeneratedReferralCode] = useState('');
  const [defaultReferralCode, setDefaultReferralCode] = useState('');
  
  // 중복 오류 처리 훅
  const { errorState, showDuplicateError, closeModal, handleRetry, handleApiError } = useDuplicateError();
  
  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  
  // 폼 필드 참조 (포커스용)
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  // 페이지 로드 시 기본 추천인코드 가져오기
  useEffect(() => {
    const loadDefaultReferralCode = async () => {
      try {
        // API에서 회사정보의 기본추천인코드 가져오기
        const response = await fetch('/api/admin/company-info');
        const data = await response.json();
        
        if (data.success && data.companyInfo && data.companyInfo.referralCodeDefault) {
          console.log('API에서 기본추천인코드 로드 성공:', data.companyInfo.referralCodeDefault);
          setDefaultReferralCode(data.companyInfo.referralCodeDefault);
        } else {
          console.log('API에서 기본추천인코드 없음');
          setDefaultReferralCode('');
        }
      } catch (error) {
        console.error('기본 추천인코드 로드 오류:', error);
        setDefaultReferralCode('');
      }
    };

    loadDefaultReferralCode();
  }, []);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 전화번호 입력 시 추천인코드 자동생성
    if (field === 'phone' && typeof value === 'string' && value.length >= 10) {
      const digits = value.replace(/\D/g, '');
      const referralCode = digits.slice(-8);
      setGeneratedReferralCode(referralCode);
    }
  };

  // 다시 입력하기 버튼 클릭 시 해당 필드에 포커스
  const handleRetryInput = () => {
    handleRetry(() => {
      // 오류 타입에 따라 해당 필드에 포커스
      if (errorState.errorType === 'email' && emailRef.current) {
        emailRef.current.focus();
      } else if (errorState.errorType === 'phone' && phoneRef.current) {
        phoneRef.current.focus();
      }
    });
  };

  const handleSubmit = async () => {
    // 추천인코드가 비어있으면 어드민에서 설정한 기본값 사용
    const finalFormData = {
      ...formData,
      referralCode: formData.referralCode || defaultReferralCode || ''
    };
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // 가입 성공
        setModalMessage(result.message);
        setShowSuccessModal(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        // 중복 오류 처리 - 새로운 모달 사용
        handleApiError(result, handleRetryInput);
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setModalMessage('회원가입 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.title}>회원가입</Text>
            <Text style={styles.subtitle}>새로운 계정을 만들어보세요</Text>
          </View>

          {/* 이름 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이름 *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="이름을 입력하세요"
              autoCapitalize="words"
            />
          </View>

          {/* 이메일 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일 *</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* 전화번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>전화번호 *</Text>
            <Text style={styles.helperText}>
              로그인시 아이디는 전화번호뒤 8자리입니다
            </Text>
            <TextInput
              ref={phoneRef}
              style={styles.input}
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="010-1234-5678"
              keyboardType="phone-pad"
            />
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="6자 이상 입력하세요"
              secureTextEntry
            />
          </View>

          {/* 비밀번호 확인 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>비밀번호 확인 *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              placeholder="비밀번호를 다시 입력하세요"
              secureTextEntry
            />
          </View>

          {/* 추천인코드 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>추천인코드 (선택)</Text>
            <TextInput
              style={styles.input}
              value={formData.referralCode}
              onChangeText={(value) => handleInputChange('referralCode', value)}
              placeholder="추천인코드를 입력하세요"
            />
          </View>

          {/* 약관 동의 */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleInputChange('agreeTerms', !formData.agreeTerms)}
            >
              <View style={[styles.checkboxBox, formData.agreeTerms && styles.checkboxChecked]}>
                {formData.agreeTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>이용약관에 동의합니다 *</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => handleInputChange('agreeMarketing', !formData.agreeMarketing)}
            >
              <View style={[styles.checkboxBox, formData.agreeMarketing && styles.checkboxChecked]}>
                {formData.agreeMarketing && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxText}>마케팅 정보 수신에 동의합니다</Text>
            </TouchableOpacity>
          </View>


          {/* 가입 버튼 */}
          <TouchableOpacity
            style={[styles.submitButton, !formData.agreeTerms && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!formData.agreeTerms}
          >
            <Text style={styles.submitButtonText}>회원가입</Text>
          </TouchableOpacity>

          {/* 로그인 링크 */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={styles.loginLink}>로그인하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 중복 오류 모달 */}
      <DuplicateErrorModal
        isOpen={errorState.isOpen}
        onClose={closeModal}
        onRetry={handleRetryInput}
        errorType={errorState.errorType || 'email'}
      />

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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  checkboxContainer: {
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});

export default SignupForm;
