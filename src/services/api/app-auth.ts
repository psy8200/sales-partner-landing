import { apiClient } from './client';
import { LoginRequest, LoginResponse, User, ApiResponse } from '../../types';

export const appAuthService = {
  // 앱 전용 로그인
  async login(credentials: LoginRequest): Promise<boolean> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/app-login', credentials);
      return response.success || false;
    } catch (error) {
      console.error('App Login error:', error);
      return false;
    }
  },

  // 회원가입
  async signup(userData: any): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.success || false;
    } catch (error) {
      console.error('App Signup error:', error);
      return false;
    }
  },

  // 로그아웃
  async logout(): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.success || false;
    } catch (error) {
      console.error('App Logout error:', error);
      return false;
    }
  },

  // 사용자 정보 조회
  async getMe(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data || null;
    } catch (error) {
      console.error('App Get user info error:', error);
      return null;
    }
  },

  // 토큰 갱신
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.success || false;
    } catch (error) {
      console.error('App Refresh token error:', error);
      return false;
    }
  },
};



