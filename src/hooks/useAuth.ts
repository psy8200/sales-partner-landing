import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, User } from '../services/api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * 로그인
   */
  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.login({ phone, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('로그인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 회원가입
   */
  const signup = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.signup(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('회원가입 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 로그아웃
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('로그아웃 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 사용자 정보 새로고침
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('사용자 정보 새로고침 실패:', error);
    }
  };

  /**
   * 앱 시작 시 자동 로그인 확인
   */
  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        setIsLoading(true);
        const userData = await authService.checkAutoLogin();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('자동 로그인 확인 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAutoLogin();
  }, []);

  /**
   * 앱 상태 변경 시 토큰 검증
   */
  useEffect(() => {
    const handleAppStateChange = async () => {
      if (user) {
        const isValid = await authService.validateToken();
        if (!isValid) {
          await logout();
        }
      }
    };

    // 앱이 포그라운드로 돌아올 때 토큰 검증
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        handleAppStateChange();
      }
    });

    return () => subscription?.remove();
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth 훅
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
