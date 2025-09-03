'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SignupPage = () => {
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

  const [generatedReferralCode, setGeneratedReferralCode] = useState(''); // 자동생성된 추천인코드
  const [defaultReferralCode, setDefaultReferralCode] = useState(''); // 어드민 설정 기본 추천인코드

  // 페이지 로드 시 기본 추천인코드 가져오기
  useEffect(() => {
    const loadDefaultReferralCode = () => {
      try {
        // localStorage에서 어드민이 설정한 기본추천인코드 가져오기
        const savedReferralCode = localStorage.getItem('companyReferralCode');
        if (savedReferralCode) {
          console.log('localStorage에서 기본추천인코드 로드 성공:', savedReferralCode);
          setDefaultReferralCode(savedReferralCode);
        } else {
          console.log('localStorage에 기본추천인코드 없음');
          setDefaultReferralCode('');
        }
      } catch (error) {
        console.error('기본 추천인코드 로드 오류:', error);
        setDefaultReferralCode('');
      }
    };

    loadDefaultReferralCode();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // 전화번호 입력 시 추천인코드 자동생성 제거 (사용자 입력값 보호)
    if (name === 'phone' && value.length >= 10) {
      const digits = value.replace(/\D/g, '');
      const referralCode = digits.slice(-8);
      setGeneratedReferralCode(referralCode);
      // 자동 설정하지 않음 - 사용자가 직접 입력한 값 보호
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
         // 가입 성공: 자동 로그인 시도 (전화번호 마지막 8자리 아이디 정책)
         const digits = (formData.phone || '').replace(/\D/g, '');
         const id8 = digits.slice(-8);
         if (id8 && formData.password) {
           try {
             const loginRes = await fetch('/api/auth/login', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ id: id8, password: formData.password }),
             });
             
             if (loginRes.ok) {
               const loginResult = await loginRes.json();
               // 관리자나 파트너인 경우에만 어드민 페이지로 이동
               if (loginResult.user && (loginResult.user.role === 'ADMIN' || loginResult.user.role === 'MEMBER')) {
                 if (window.opener && !window.opener.closed) {
                   try {
                     window.opener.location.href = '/admin/members';
                   } catch {}
                 }
               }
             }
           } catch {}
         }

        alert(result.message);
        window.close();
      } else {
        alert(result.error || '회원가입 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-md my-2"
      >
        {/* 헤더 */}
        <div className="text-center mb-4">
          <h1 className="text-lg font-bold text-gray-900 mb-1">세일즈파트너 가입하기</h1>
          <p className="text-gray-600 text-xs">매월 내는 돈을 수익으로 바꿔보세요</p>
        </div>

        {/* 회원가입 폼 */}
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
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="홍길동"
            />
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="example@email.com"
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호 * (로그인시 아이디는 전화번호뒤 8자리입니다)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="010-1234-5678"
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
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="6자 이상 입력"
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
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="비밀번호 재입력"
            />
          </div>

          {/* 추천인코드 */}
          <div>
            <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1">
              추천인코드 (선택) *추천인의 전화번호 뒤 8자리입니다
            </label>
            <input
              type="text"
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder={defaultReferralCode ? defaultReferralCode : "추천인 코드를 입력하세요"}
            />
            {defaultReferralCode && (
              <p className="text-xs text-gray-500 mt-1">
                💡 어드민 설정 기본값: {defaultReferralCode}
              </p>
            )}
            {generatedReferralCode && (
              <p 
                className="text-xs text-blue-500 mt-1 cursor-pointer hover:text-blue-700 hover:underline"
                onClick={() => setFormData(prev => ({ ...prev, referralCode: generatedReferralCode }))}
              >
                🔄 전화번호 기반 생성 예시: {generatedReferralCode} (클릭하여 적용)
              </p>
            )}
          </div>

          {/* 약관 동의 */}
          <div className="space-y-1">
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeTerms"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                required
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-700">
                <span className="text-red-500">*</span> 이용약관 및 개인정보처리방침에 동의합니다
              </label>
            </div>
            
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeMarketing"
                name="agreeMarketing"
                checked={formData.agreeMarketing}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeMarketing" className="ml-2 text-sm text-gray-700">
                마케팅 정보 수신에 동의합니다 (선택)
              </label>
            </div>
          </div>

          {/* 가입 버튼 */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            🎯 세일즈파트너 가입하기
          </button>
        </form>

        {/* 하단 안내 */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            이미 계정이 있으신가요?{' '}
            <button 
              onClick={() => window.close()}
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              로그인하기
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
