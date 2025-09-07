'use client'

import { useState } from 'react'

export default function LoginForm() {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('로그인 시도:', { id: formData.id, password: formData.password ? '***' : 'empty' });
      
      const res = await fetch('/api/auth/web-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.id,
          password: formData.password
        }),
      });
      
      console.log('로그인 응답 상태:', res.status);
      
      const result = await res.json();
      console.log('로그인 응답:', result);
      
      if (res.ok) {
        // 관리자 계정인지 확인
        if (result.user && (result.user.role === 'ADMIN' || result.user.role === 'MANAGER')) {
          alert('관리자로 로그인되었습니다. 어드민 페이지로 이동합니다.');
          window.location.href = '/admin';
        } else {
          alert('로그인되었습니다. 마이페이지로 이동합니다.');
          window.location.href = '/mypage';
        }
      } else {
        const errorMessage = result.error || '로그인에 실패했습니다.';
        setError(errorMessage);
        console.error('로그인 실패:', errorMessage);
      }
    } catch (e) {
      const errorMessage = '로그인 중 오류가 발생했습니다.';
      setError(errorMessage);
      console.error('로그인 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700">
              아이디 (전화번호 뒤 8자리로 로그인)
            </label>
          </div>
          <input
            type="text"
            id="id"
            name="id"
            value={formData.id}
            onChange={(e) => {
              // 숫자와 하이픈만 허용
              const value = e.target.value.replace(/[^0-9-]/g, '');
              setFormData((prev) => ({ ...prev, id: value }));
              setError(null);
            }}
            required
            className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
            placeholder="12345678"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, password: e.target.value }));
              setError(null);
            }}
            required
            className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-base text-gray-600">
          계정이 없으신가요?{' '}
          <button
            onClick={() => window.location.href = '/signup'}
            className="text-blue-800 hover:text-blue-900 font-semibold text-lg"
          >
            회원가입
          </button>
        </p>
      </div>
    </>
  )
}