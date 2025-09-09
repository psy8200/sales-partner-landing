'use client';

import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔍 로그인 시도:', { phone, password });

    try {
      const success = await login(phone, password);
      
      if (success) {
        console.log('✅ 로그인 성공!');
        // 로그인 성공 - 어드민 전체화면으로 열기
        setTimeout(() => {
          const adminUrl = `${window.location.origin}/admin`;
          window.open(adminUrl, '_blank', 'width=1920,height=1080,scrollbars=yes,resizable=yes');
        }, 500);
        onClose();
      } else {
        setError('로그인에 실패했습니다.');
      }
    } catch (err) {
      console.error('❌ 로그인 오류:', err);
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">관리자 로그인</h2>
                <p className="text-sm text-gray-600">세일즈 파트너 관리자 시스템</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="닫기"
              aria-label="모달 닫기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 로그인 폼 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                전화번호 (뒤 8자리로 로그인)
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                autoComplete="tel"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="010-0000-0000 또는 00000000"
                value={phone}
                onChange={(e) => {
                  // 숫자와 하이픈만 허용
                  const value = e.target.value.replace(/[^0-9-]/g, '');
                  setPhone(value);
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                전체 전화번호 또는 뒤 8자리 모두 입력 가능합니다
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          {/* 테스트 계정 정보 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-900 mb-2">테스트 계정</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>전화번호 뒤 8자리: 12345678</div>
              <div>비밀번호: 87587200</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
