'use client'

import { useState } from 'react'
import SuccessModal from '@/components/modals/SuccessModal'
import ErrorModal from '@/components/modals/ErrorModal'

export default function PwaLoginForm() {
  const [formData, setFormData] = useState({ id: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'error' | 'notfound' | 'success'>('error');
  const [modalMessage, setModalMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('PWA 로그인 시도:', { id: formData.id, password: formData.password ? '***' : 'empty' });
      
      // PWA 전용 로그인 API 사용
      const res = await fetch('/api/auth/member-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.id,
          password: formData.password
        }),
      });
      
      console.log('PWA 로그인 응답 상태:', res.status);
      
      const result = await res.json();
      console.log('PWA 로그인 응답:', result);
      
      if (res.ok) {
        setModalType('success');
        setModalMessage('PWA 앱에 로그인되었습니다. 회원페이지로 이동합니다.');
        setModalOpen(true);
        setTimeout(() => {
          // PWA 로그인 후 회원 페이지로 이동
          window.location.href = '/member';
        }, 1500);
      } else {
        const errorMessage = result.error || '로그인에 실패했습니다.';
        
        // 404 오류인 경우 (회원정보 없음)
        if (res.status === 404) {
          setModalType('notfound');
          setModalMessage('입력하신 전화번호로 등록된 계정이 없습니다.');
        } else {
          setModalType('error');
          setModalMessage(errorMessage);
        }
        
        setModalOpen(true);
        console.error('PWA 로그인 실패:', errorMessage);
      }
    } catch (e) {
      const errorMessage = '로그인 중 오류가 발생했습니다.';
      setModalType('error');
      setModalMessage(errorMessage);
      setModalOpen(true);
      console.error('PWA 로그인 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setError(null);
  };

  const handleSignup = () => {
    setModalOpen(false);
    window.location.href = '/pwa-signup';
  };

  const handleRetry = () => {
    setModalOpen(false);
    setError(null);
  };

  return (
    <>
      {modalType === 'success' && (
        <SuccessModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      )}
      {modalType === 'error' && (
        <ErrorModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      )}
      {modalType === 'notfound' && (
        <ErrorModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          message={modalMessage}
        />
      )}
      
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
          {loading ? 'PWA 로그인 중...' : 'PWA 로그인'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-base text-gray-600">
          계정이 없으신가요?{' '}
          <button
            onClick={() => window.location.href = '/pwa-signup'}
            className="text-blue-800 hover:text-blue-900 font-semibold text-lg"
          >
            회원가입
          </button>
        </p>
      </div>
    </>
  )
}
