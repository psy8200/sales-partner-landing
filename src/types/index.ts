// 공통 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: number;
  points: number;
  totalReferrals: number;
  monthlyReferrals: number;
  levelInfo: {
    level: number;
    name: string;
    color: string;
    icon: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface StatsData {
  totalBalance: number;
  monthlySpend: number;
  pendingCount: number;
  thisMonthEarnings: number;
  currentPoints: number;
  userLevel: {
    level: number;
    name: string;
    color: string;
    icon: string;
  };
}

export interface ActivityItem {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'referral';
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  icon: string;
  color: string;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export interface InfoCard {
  id: string;
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}