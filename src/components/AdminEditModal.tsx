'use client';

import React, { useState, useEffect } from 'react';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  joinDate: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  isOnline: boolean;
  lastActivityAt?: string;
  loginCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  adminId
}) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    joinDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // 관리자 정보 가져오기
  useEffect(() => {
    if (isOpen && adminId) {
      fetchAdminData();
    }
  }, [isOpen, adminId]);

  const fetchAdminData = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      
      const response = await fetch(`/api/admin/admins/${adminId}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '관리자 정보를 불러올 수 없습니다.');
      }
      
      setAdmin(data.admin);
      setFormData({
        name: data.admin.name,
        email: data.admin.email,
        phone: data.admin.phone,
        password: '', // 비밀번호는 빈 값으로 초기화
        role: data.admin.role,
        status: data.admin.status,
        joinDate: data.admin.joinDate.split('T')[0] // YYYY-MM-DD 형식으로 변환
      });
    } catch (err) {
      console.error('관리자 정보 조회 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
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
    if (formData.password && formData.password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return false;
    }
    if (!formData.joinDate) {
      setError('입사일을 선택해주세요.');
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
      const response = await fetch(`/api/admin/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '관리자 수정에 실패했습니다.');
      }

      // 성공 시 폼 초기화 및 콜백 호출
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'ADMIN',
        status: 'ACTIVE',
        joinDate: ''
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('관리자 수정 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">관리자 정보 수정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6">
          {fetchLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">관리자 정보를 불러오는 중...</div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="이름을 입력하세요"
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
                    placeholder="이메일을 입력하세요"
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
                    비밀번호 (변경 시에만 입력)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="비밀번호를 입력하세요 (최소 6자)"
                    disabled={loading}
                    title="비밀번호를 변경하려면 입력하세요"
                    aria-label="관리자 비밀번호 입력"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    비밀번호를 변경하지 않으려면 비워두세요.
                  </p>
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
                  >
                    <option value="ADMIN">관리자</option>
                    <option value="SUPER_ADMIN">최고관리자</option>
                  </select>
                </div>

                {/* 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상태 *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                    required
                  >
                    <option value="ACTIVE">활성</option>
                    <option value="INACTIVE">비활성</option>
                    <option value="SUSPENDED">정지</option>
                  </select>
                </div>

                {/* 입사일 */}
                <div className="md:col-span-2">
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
                  />
                </div>
              </div>

              {/* 관리자 정보 표시 */}
              {admin && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">기타 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>마지막 로그인: {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('ko-KR') : '없음'}</div>
                    <div>로그인 횟수: {admin.loginCount}회</div>
                    <div>접속 상태: {admin.isOnline ? '온라인' : '오프라인'}</div>
                    <div>생성일: {new Date(admin.createdAt).toLocaleString('ko-KR')}</div>
                  </div>
                </div>
              )}

              {/* 버튼 */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? '수정 중...' : '수정하기'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};
