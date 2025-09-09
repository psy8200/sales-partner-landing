'use client';

import { useState, useCallback } from 'react';

interface DuplicateErrorState {
  isOpen: boolean;
  errorType: 'email' | 'phone' | null;
  message: string;
}

/**
 * 웹과 네이티브에서 공통으로 사용하는 중복 오류 처리 훅
 */
export const useDuplicateError = () => {
  const [errorState, setErrorState] = useState<DuplicateErrorState>({
    isOpen: false,
    errorType: null,
    message: ''
  });

  /**
   * 중복 오류를 표시합니다
   * @param errorType 오류 타입 ('email' | 'phone')
   * @param message 오류 메시지 (선택사항)
   */
  const showDuplicateError = useCallback((errorType: 'email' | 'phone', message?: string) => {
    setErrorState({
      isOpen: true,
      errorType,
      message: message || getDefaultMessage(errorType)
    });
  }, []);

  /**
   * 모달을 닫습니다
   */
  const closeModal = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      isOpen: false
    }));
  }, []);

  /**
   * 다시 입력하기 버튼 클릭 시 처리
   * @param onRetry 콜백 함수
   */
  const handleRetry = useCallback((onRetry?: () => void) => {
    closeModal();
    if (onRetry) {
      onRetry();
    }
  }, [closeModal]);

  /**
   * API 응답에서 중복 오류를 감지하고 처리합니다
   * @param response API 응답
   * @param onRetry 다시 입력하기 콜백
   */
  const handleApiError = useCallback((response: any, onRetry?: () => void) => {
    if (response?.error) {
      const errorMessage = response.error;
      
      if (errorMessage.includes('이메일')) {
        showDuplicateError('email', errorMessage);
      } else if (errorMessage.includes('전화번호')) {
        showDuplicateError('phone', errorMessage);
      } else {
        // 기타 오류는 기본 처리
        showDuplicateError('email', errorMessage);
      }
    }
  }, [showDuplicateError]);

  return {
    errorState,
    showDuplicateError,
    closeModal,
    handleRetry,
    handleApiError
  };
};

/**
 * 기본 오류 메시지를 반환합니다
 */
function getDefaultMessage(errorType: 'email' | 'phone'): string {
  switch (errorType) {
    case 'email':
      return '이미 등록된 이메일입니다.';
    case 'phone':
      return '이미 등록된 전화번호입니다.';
    default:
      return '중복된 정보가 있습니다.';
  }
}

export default useDuplicateError;


