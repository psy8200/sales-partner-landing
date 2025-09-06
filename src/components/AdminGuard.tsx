'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sessionManager } from '@/lib/sessionManager';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  isActive: boolean;
}

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 로그인 페이지는 보호하지 않음
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/admin/login';

  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        console.log('🔍 AdminGuard: 인증 확인 시작');
        
        // 개발 환경에서는 강제로 관리자 권한 부여
        if (process.env.NODE_ENV === 'development') {
          console.log('🔧 AdminGuard: 개발 환경 - 강제 관리자 권한 부여');
          const devAdminUser = {
            id: 'admin-dev-001',
            name: '개발자 어드민',
            email: 'admin@example.com',
            phone: '010-0000-0000',
            role: 'ADMIN',
            status: 'ACTIVE',
            isActive: true,
          };
          setUser(devAdminUser);
          setLoading(false);
          return;
        }
        
        // 어드민 전용 인증 API 사용
        const response = await fetch('/api/admin/auth/me');
        if (!isMounted) return;
        
        console.log('🔍 AdminGuard: /api/admin/auth/me 응답:', response.status, response.ok);
        
        if (!response.ok) {
          console.log('⚠️ AdminGuard: 어드민 로그인 필요, 강제 로그인 시도');
          // 어드민 로그인이 필요한 경우 강제 로그인 시도
          const forceLoginResponse = await fetch('/api/admin/auth/force-login', {
            method: 'POST'
          });
          if (!isMounted) return;
          
          console.log('🔍 AdminGuard: 강제 로그인 응답:', forceLoginResponse.status, forceLoginResponse.ok);
          
          if (!forceLoginResponse.ok) {
            const errorData = await forceLoginResponse.json();
            console.error('❌ AdminGuard: 강제 로그인 실패:', errorData);
            throw new Error('어드민 인증에 실패했습니다.');
          }
          
          console.log('✅ AdminGuard: 강제 로그인 성공, 사용자 정보 재조회');
          // 강제 로그인 성공 후 다시 사용자 정보 조회
          const retryResponse = await fetch('/api/admin/auth/me');
          if (!isMounted) return;
          
          console.log('🔍 AdminGuard: 재조회 응답:', retryResponse.status, retryResponse.ok);
          
          if (!retryResponse.ok) {
            throw new Error('어드민 인증에 실패했습니다.');
          }
          
          const data = await retryResponse.json();
          console.log('✅ AdminGuard: 사용자 정보 조회 성공:', data.user);
          setUser(data.user);
        } else {
          const data = await response.json();
          console.log('✅ AdminGuard: 기존 세션으로 사용자 정보 조회 성공:', data.user);
          setUser(data.user);
        }
        
        // 세션 관리 시작
        console.log('🔧 AdminGuard: 세션 관리 시작');
        sessionManager.startSessionManagement();
        
      } catch (err) {
        if (!isMounted) return;
        
        const errorMessage = err instanceof Error ? err.message : '어드민 인증 오류가 발생했습니다.';
        console.error('❌ AdminGuard: 인증 오류:', errorMessage);
        setError(errorMessage);
        
        // 개발 환경에서는 에러를 표시하되 리다이렉트하지 않음
        if (process.env.NODE_ENV !== 'development') {
          setTimeout(() => {
            router.push('/admin-login');
          }, 2000);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // 컴포넌트 언마운트 시 세션 관리 중지
    return () => {
      isMounted = false;
      sessionManager.stopSessionManagement();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="text-lg font-medium text-gray-700">어드민 권한 확인 중...</div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            잠시만 기다려주세요.
          </div>
        </div>
      </div>
    );
  }

  if (error && process.env.NODE_ENV === 'development') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">개발 환경 경고</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              title="페이지 새로고침"
              aria-label="페이지 새로고침"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">접근 권한 없음</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="text-sm text-gray-500">
              로그인 페이지로 이동합니다...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
