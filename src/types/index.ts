// ========================================
// 공통 타입 정의
// ========================================

// API 응답 기본 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 페이지네이션 타입
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'MEMBER' | 'GENERAL';
  partnerStatus: 'NOT_APPLIED' | 'PARTNER_APPLIED' | 'APPROVED';
  points: number;
  level: number;
  finalPoints?: number; // 결정포인트값 추가
  
  // 등급 관련 정보 (실제 데이터 기반)
  totalReferrals?: number;
  monthlyReferrals?: number;
  currentLevel?: number;
  levelName?: string;
  levelIcon?: string;
  nextLevelRequirement?: number;
  remainingReferrals?: number;
  isMaxLevel?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

// 계약 관련 타입
export interface Contract {
  id: string;
  contractNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  itemCategory: 'INSURANCE' | 'RENTAL' | 'INTERNET_TV' | 'FUNERAL' | 'RENTAL_MALL';
  companyName?: string;
  itemName: string;
  contractAmount: number;
  commissionRate: number;
  commissionAmount: number;
  expectedRate?: number;
  pointRate?: number;
  payoutRate?: number;
  finalPoints?: number;
  contractDate: string;
  startDate?: string;
  endDate?: string;
  installationDate?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 아이템 설정 타입
export interface ItemSetting {
  id: string;
  category: 'INSURANCE' | 'RENTAL' | 'INTERNET_TV' | 'FUNERAL' | 'RENTAL_MALL';
  provider: string;
  productName: string;
  paymentTerm: string;
  baseAmount: number;
  expectedRate: number;
  pointRate: number;
  pointAmount: number;
  createdAt: string;
}

// 상담 신청 타입
export interface PartnerApplication {
  id: string;
  userId: string;
  availableDate: string;
  availableTime: string;
  preferredTime?: string;
  additionalNote?: string;
  status: 'PENDING' | 'ASSIGNED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  processedBy?: string;
  processedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  adminMemo?: string;
  createdAt: string;
  updatedAt: string;
}

// 질문/건의사항 타입
export interface Question {
  id: string;
  userId: string;
  title: string;
  content: string;
  answer?: string;
  status: 'PENDING' | 'ANSWERED';
  createdAt: string;
  answeredAt?: string;
  updatedAt: string;
}

// 활동 로그 타입
export interface ActivityLog {
  id: string;
  type: 'USER_REGISTRATION' | 'PARTNER_APPLICATION' | 'PARTNER_APPROVAL' | 'QUESTION_SUBMITTED' | 'SUGGESTION_SUBMITTED' | 'CONTRACT_CREATED';
  title: string;
  description: string;
  userId?: string;
  metadata?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// 대시보드 통계 타입
export interface DashboardStats {
  totalUsers: number;
  totalPartners: number;
  newPartnersThisMonth: number;
  conversionRate: number;
  consultationRequestsThisMonth: number;
  consultationsInProgress: number;
  approvedConsultationsThisMonth: number;
  approvalConversionRate: number;
}

// 이벤트 핸들러 타입
export interface FormEvent {
  target: {
    name: string;
    value: string | number | boolean;
  };
}

export interface InputChangeEvent {
  target: {
    name: string;
    value: string;
    type: string;
    checked?: boolean;
  };
}

export interface SelectChangeEvent {
  target: {
    name: string;
    value: string | number;
  };
}

// 필터 및 검색 타입
export interface FilterParams {
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// 엑셀 내보내기 타입
export interface ExportParams {
  type: 'USERS' | 'CONTRACTS' | 'APPLICATIONS' | 'PAYMENTS' | 'SETTLEMENTS';
  filters?: FilterParams;
  format?: 'xlsx' | 'csv';
}

// 회사 정보 타입
export interface CompanyInfo {
  id: string;
  companyName: string;
  companyLogo: string;
  bottomLogo?: string;
  businessNumber: string;
  representative: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

