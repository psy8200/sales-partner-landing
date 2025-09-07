import { apiClient } from './client';
import { LoginRequest, LoginResponse, User, ApiResponse } from '../../types';

export const authService = {
  // 회원 로그인 (PWA 전용)
  async login(credentials: LoginRequest): Promise<boolean> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/member-login', credentials);
      return response.success || false;
    } catch (error) {
      console.error('PWA Login error:', error);
      return false;
    }
  },

  // 회원가입
  async signup(userData: any): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/signup', userData);
      return response.success || false;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  },

  // 로그아웃
  async logout(): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.success || false;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  },

  // 사용자 정보 조회
  async getMe(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data || null;
    } catch (error) {
      console.error('Get user info error:', error);
      return null;
    }
  },

  // 토큰 갱신
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post('/auth/refresh');
      return response.success || false;
    } catch (error) {
      console.error('Refresh token error:', error);
      return false;
    }
  },
};