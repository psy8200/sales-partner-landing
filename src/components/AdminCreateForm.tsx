'use client';

import React, { useState } from 'react';

interface AdminCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface AdminFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  joinDate: string;
}

const AdminCreateForm: React.FC<AdminCreateFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<AdminFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'ADMIN',
    joinDate: new Date().toISOString().split('T')[0] // 오늘 날짜
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 폼 유효성 검사
      if (!formData.name.trim()) {
        throw new Error('이름을 입력해주세요.');
      }
      if (!formData.email.trim()) {
        throw new Error('이메일을 입력해주세요.');
      }
      if (!formData.phone.trim()) {
        throw new Error('연락처를 입력해주세요.');
      }
      if (!formData.password.trim()) {
        throw new Error('비밀번호를 입력해주세요.');
      }
      if (formData.password.length < 6) {
        throw new Error('비밀번호는 6자 이상이어야 합니다.');
      }

      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '관리자 생성에 실패했습니다.');
      }

      // 성공 시 폼 초기화 및 콜백 호출
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'ADMIN',
        joinDate: new Date().toISOString().split('T')[0]
      });
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '관리자 생성 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">관리자 생성</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이름 *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="관리자 이름"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일 *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="010-1234-5678"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6자 이상"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              역할 *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="관리자 역할 선택"
            >
              <option value="ADMIN">관리자</option>
              <option value="SUPER_ADMIN">최고관리자</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              입사일 *
            </label>
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '생성 중...' : '생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateForm;


