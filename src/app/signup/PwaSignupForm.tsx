'use client'

import React, { useState, useEffect, useRef } from 'react';
import DuplicateErrorModal from '@/components/DuplicateErrorModal';
import { TermsModal } from '@/components/TermsModal';
import { useDuplicateError } from '@/hooks/useDuplicateError';

interface PwaSignupFormProps {
  defaultReferralCode: string;
  phonePlaceholder: string;
  referralPlaceholder: string;
}

const PwaSignupForm: React.FC<PwaSignupFormProps> = ({ defaultReferralCode, phonePlaceholder, referralPlaceholder }) => {
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

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false); // 약관 모달 상태
  const [message, setMessage] = useState<{type: 'success' | 'error' | 'warning', text: string} | null>(null); // 메시지 상태
  
  // 중복 오류 처리 훅
  const { errorState, showDuplicateError, closeModal, handleRetry, handleApiError } = useDuplicateError();
  
  // 폼 필드 참조 (포커스용)
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);


  // 폼 데이터 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // 기존 메시지 초기화
    
    // 필수 필드 검증
    if (!formData.name.trim()) {
      setMessage({type: 'warning', text: '이름을 입력해주세요.'});
      return;
    }
    
    if (!formData.email.trim()) {
      setMessage({type: 'warning', text: '이메일을 입력해주세요.'});
      return;
    }
    
    if (!formData.phone.trim()) {
      setMessage({type: 'warning', text: '전화번호를 입력해주세요.'});
      return;
    }
    
    if (!formData.password.trim()) {
      setMessage({type: 'warning', text: '비밀번호를 입력해주세요.'});
      return;
    }
    
    if (!formData.confirmPassword.trim()) {
      setMessage({type: 'warning', text: '비밀번호 확인을 입력해주세요.'});
      return;
    }
    
    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setMessage({type: 'error', text: '비밀번호가 일치하지 않습니다.'});
      return;
    }

    // 약관 동의 확인
    if (!formData.agreeTerms) {
      setMessage({type: 'warning', text: '이용약관에 동의해주세요.'});
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          referralCode: formData.referralCode || defaultReferralCode
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        result = { error: '서버 응답을 처리할 수 없습니다.' };
      }
      
      console.log('회원가입 응답:', { status: response.status, ok: response.ok, result });

      if (response.ok) {
        console.log('회원가입 성공, PWA 로그인 페이지로 이동');
        setMessage({type: 'success', text: '🎉 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'});
        
        // 2초 후 PWA 로그인 페이지로 이동
        setTimeout(() => {
          window.location.href = '/pwa-login';  // ✅ PWA 전용 경로
        }, 2000);
      } else {
        console.error('회원가입 실패 상세:', result);
        const errorMessage = result?.error || result?.message || `서버 오류 (${response.status})`;
        
        // 중복 오류 처리
        if (errorMessage.includes('이미 존재') || errorMessage.includes('중복')) {
          setMessage({type: 'error', text: `❌ ${errorMessage}`});
          handleApiError(errorMessage, emailRef, phoneRef);
        } else {
          setMessage({type: 'error', text: `❌ ${errorMessage}`});
        }
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      setMessage({type: 'error', text: '❌ 회원가입 중 오류가 발생했습니다. 다시 시도해주세요.'});
    }
  };

  return (
    <>
      {/* 메시지 표시 */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center justify-between">
            <p className="font-medium">{message.text}</p>
            <button
              onClick={() => setMessage(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 이름 */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            이름 *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이름을 입력하세요"
          />
        </div>

        {/* 이메일 */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            이메일 *
          </label>
          <input
            ref={emailRef}
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="이메일을 입력하세요"
          />
        </div>

        {/* 전화번호 */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            전화번호 * (로그인 아이디는 전화번호뒤 8자리)
          </label>
          <input
            ref={phoneRef}
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={phonePlaceholder}
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인 *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>

        {/* 추천인코드 */}
        <div>
          <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
            추천인코드 (선택)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={referralPlaceholder}
          />
        </div>

        {/* 약관 동의 */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
              이용약관에 동의합니다. *{' '}
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                [[약관보기]]
              </button>
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeMarketing"
              name="agreeMarketing"
              checked={formData.agreeMarketing}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agreeMarketing" className="ml-2 block text-sm text-gray-700">
              마케팅 정보 수신에 동의합니다 (선택)
            </label>
          </div>
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          회원가입
        </button>
      </form>

      {/* 로그인 링크 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          이미 계정이 있으신가요?{' '}
          <button
            onClick={() => window.location.href = '/pwa-login'}  // ✅ PWA 전용 경로
            className="text-blue-800 hover:text-blue-900 font-semibold text-lg"
          >
            로그인하기
          </button>
        </p>
      </div>

      {/* 중복 오류 모달 */}
      <DuplicateErrorModal
        isOpen={errorState.isOpen}
        onClose={closeModal}
        onRetry={handleRetry}
        errorMessage={errorState.message}
        duplicateFields={errorState.duplicateFields}
      />

      {/* 약관 모달 */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
};

export default PwaSignupForm;


