'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
  status: string;
  joinDate: string;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  isOnline: boolean;
  lastActivityAt: string | null;
  createdAt: string;
}

interface UseAdminAuthReturn {
  user: AdminUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // 세션 스토리지에서 사용자 정보 로드
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = sessionStorage.getItem('adminUser');
        const sessionToken = sessionStorage.getItem('adminSessionToken');
        
        if (storedUser && sessionToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('세션 스토리지에서 사용자 정보 로드 실패:', error);
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminSessionToken');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // 로그인 함수
  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/auth/session-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 세션 스토리지에 사용자 정보와 토큰 저장
        sessionStorage.setItem('adminUser', JSON.stringify(data.admin));
        sessionStorage.setItem('adminSessionToken', data.sessionToken);
        
        // 서버에서 제공한 sessionStorage 스크립트 실행 (추가 보장)
        if (data.sessionStorageScript && typeof window !== 'undefined') {
          try {
            eval(data.sessionStorageScript);
          } catch (error) {
            console.error('sessionStorage 스크립트 실행 실패:', error);
          }
        }
        
        setUser(data.admin);
        return true;
      } else {
        const errorData = await response.json();
        console.error('로그인 실패:', errorData.error);
        return false;
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃 함수
  const logout = async (): Promise<void> => {
    try {
      const sessionToken = sessionStorage.getItem('adminSessionToken');
      if (sessionToken) {
        // 서버에 로그아웃 요청
        await fetch('/api/admin/auth/session-logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('로그아웃 요청 실패:', error);
    } finally {
      // 세션 스토리지 정리
      sessionStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminSessionToken');
      setUser(null);
    }
  };

  // 사용자 정보 새로고침
  const refreshUser = async (): Promise<void> => {
    try {
      const sessionToken = sessionStorage.getItem('adminSessionToken');
      if (!sessionToken) {
        setUser(null);
        return;
      }

      const response = await fetch('/api/admin/auth/session-me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('adminUser', JSON.stringify(data.user));
        setUser(data.user);
      } else {
        // 인증 실패 시 세션 정리
        sessionStorage.removeItem('adminUser');
        sessionStorage.removeItem('adminSessionToken');
        setUser(null);
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
      sessionStorage.removeItem('adminUser');
      sessionStorage.removeItem('adminSessionToken');
      setUser(null);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    refreshUser,
  };
}