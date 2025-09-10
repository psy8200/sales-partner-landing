import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';
import SuccessModal from '../../components/native/modals/SuccessModal';
import ErrorModal from '../../components/native/modals/ErrorModal';
import WarningModal from '../../components/native/modals/WarningModal';

export const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // 모달 상태
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setModalMessage('전화번호와 비밀번호를 입력해주세요.');
      setShowWarningModal(true);
      return;
    }

    if (phone.length !== 8) {
      setModalMessage('8자리 전화번호를 입력해주세요.');
      setShowWarningModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(phone, password);
      if (success) {
        // 로그인 성공 시 /member 페이지로 자동 이동
        setModalMessage('로그인에 성공했습니다!');
        setShowSuccessModal(true);
        setTimeout(() => {
          router.push('/member');
        }, 1500);
      } else {
        setModalMessage('전화번호 또는 비밀번호가 올바르지 않습니다.');
        setShowErrorModal(true);
      }
    } catch (error) {
      setModalMessage('로그인 중 오류가 발생했습니다.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Sales Partner</h1>
          <p className="text-lg text-gray-600">회원 로그인</p>
        </div>

        <div className="bg-white p-6 shadow-lg rounded-lg">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전화번호 (뒤 8자리로 로그인)
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={phone}
              onChange={(e) => {
                // 숫자와 하이픈만 허용
                const cleanValue = e.target.value.replace(/[^0-9-]/g, '');
                setPhone(cleanValue);
              }}
              placeholder="010-0000-0000 또는 00000000"
              autoComplete="tel"
            />
            <p className="text-xs text-gray-500 mt-1">
              전체 전화번호 또는 뒤 8자리 모두 입력 가능합니다
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
            />
          </div>

          <div className="w-full mt-4">
            <Button
              title="로그인"
              onPress={handleLogin}
              loading={isLoading}
            />
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
              회원가입
            </span>
          </p>
        </div>
      </div>

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

      <WarningModal
        visible={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        message={modalMessage}
      />
    </div>
  );
};
