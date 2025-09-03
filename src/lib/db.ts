import { PrismaClient } from '@prisma/client';

// Prisma 클라이언트 인스턴스 생성
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 데이터베이스 연결 테스트
export async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// 데이터베이스 연결 종료
export async function disconnect() {
  await prisma.$disconnect();
}

// 트랜잭션 래퍼
export async function withTransaction<T>(
  fn: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn);
}

// 배치 처리 유틸리티
export async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processor(batch);
    results.push(...batchResults);
  }
  
  return results;
}

// 페이지네이션 유틸리티
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 검색 필터 유틸리티
export interface SearchFilters {
  [key: string]: unknown;
}

export function buildWhereClause(filters: SearchFilters) {
  const where: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'string' && value.includes('*')) {
        // 와일드카드 검색
        where[key] = {
          contains: value.replace(/\*/g, ''),
        };
      } else if (Array.isArray(value)) {
        // 배열 검색
        where[key] = {
          in: value,
        };
      } else if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
        // 범위 검색
        const rangeValue = value as { start: unknown; end: unknown };
        where[key] = {
          gte: rangeValue.start,
          lte: rangeValue.end,
        };
      } else {
        // 정확한 값 검색
        where[key] = value;
      }
    }
  }
  
  return where;
}

// 통계 쿼리 유틸리티
export async function getStats() {
  const [
    totalUsers,
    activeUsers,
    totalConsultations,
    pendingConsultations,
    totalApplications,
    approvedApplications,
    totalPayments,
    pendingPayments,
    totalSettlements,
    pendingSettlements,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.consultation.count(),
    prisma.consultation.count({ where: { status: 'PENDING' } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: 'APPROVED' } }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.settlement.count(),
    prisma.settlement.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    totalConsultations,
    pendingConsultations,
    totalApplications,
    approvedApplications,
    totalPayments,
    pendingPayments,
    totalSettlements,
    pendingSettlements,
  };
}

// 월별 통계
export async function getMonthlyStats(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const [
    newUsers,
    newConsultations,
    newApplications,
    totalPayments,
    totalSettlements,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.consultation.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.application.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.settlement.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  return {
    newUsers,
    newConsultations,
    newApplications,
    totalPaymentAmount: totalPayments._sum.amount || 0,
    totalSettlementAmount: totalSettlements._sum.totalAmount || 0,
  };
}
