'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  joinDate: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

/**
 * 관리자 생성 모달 컴포넌트
 * 최고관리자만 사용 가능
 */
export const AdminCreateModal: React.FC<AdminCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    joinDate: new Date().toISOString().split('T')[0], // 오늘 날짜 기본값
    role: 'ADMIN'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof AdminFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 입력 시 오류 메시지 초기화
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.');
      return false;
    }
    if (!formData.email.trim()) {
      setError('이메일을 입력해주세요.');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('연락처를 입력해주세요.');
      return false;
    }
    if (!formData.password.trim()) {
      setError('비밀번호를 입력해주세요.');
      return false;
    }
    if (!formData.joinDate) {
      setError('입사일을 선택해주세요.');
      return false;
    }
    
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('올바른 이메일 형식을 입력해주세요.');
      return false;
    }
    
    // 전화번호 형식 검증 (숫자만)
    const phoneRegex = /^[0-9-+\s]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('올바른 전화번호 형식을 입력해주세요.');
      return false;
    }

    // 비밀번호 길이 검증 (최소 6자)
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role: formData.role,
          status: 'ACTIVE',
          isAdmin: true,
          agreeTerms: true,
          marketingAgreed: false
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('관리자가 성공적으로 생성되었습니다.');
        onSuccess();
        onClose();
        // 폼 초기화
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          joinDate: new Date().toISOString().split('T')[0],
          role: 'ADMIN'
        });
      } else {
        // 중복 오류 처리
        if (result.error && (result.error.includes('이메일') || result.error.includes('전화번호'))) {
          setError(result.error);
        } else {
          setError(result.error || '관리자 생성에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('관리자 생성 오류:', error);
      setError('관리자 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        joinDate: new Date().toISOString().split('T')[0],
        role: 'ADMIN'
      });
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* 모달 컨텐츠 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">관리자 생성</h2>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                  title="닫기"
                  aria-label="모달 닫기"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* 오류 메시지 */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* 폼 */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 이름 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이름 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="관리자 이름을 입력하세요"
                    disabled={loading}
                    required
                  />
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="admin@example.com"
                    disabled={loading}
                    required
                  />
                </div>

                {/* 연락처 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    연락처 *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="010-1234-5678"
                    disabled={loading}
                    required
                  />
                </div>

                {/* 비밀번호 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호 *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="비밀번호를 입력하세요 (최소 6자)"
                    disabled={loading}
                    required
                    title="관리자 로그인용 비밀번호"
                    aria-label="관리자 비밀번호 입력"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    최소 6자 이상 입력해주세요. 관리자 로그인에 사용됩니다.
                  </p>
                </div>

                {/* 입사일 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    입사일 *
                  </label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => handleInputChange('joinDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                    required
                    title="입사일 선택"
                    aria-label="입사일 선택"
                  />
                </div>

                {/* 역할 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    역할 *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value as 'ADMIN' | 'SUPER_ADMIN')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                    required
                    title="관리자 역할 선택"
                    aria-label="관리자 역할 선택"
                  >
                    <option value="ADMIN">관리자 (일반관리자)</option>
                    <option value="SUPER_ADMIN">최고관리자</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    최고관리자만 다른 관리자를 생성/삭제할 수 있습니다.
                  </p>
                </div>

                {/* 버튼들 */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        생성 중...
                      </>
                    ) : (
                      '관리자 생성'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AdminCreateModal;
