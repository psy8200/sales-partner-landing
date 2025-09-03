import * as XLSX from 'xlsx';
import { prisma } from './prisma';

// 엑셀 내보내기 클래스
export class ExcelExporter {
  private workbook: XLSX.WorkBook;
  private worksheet!: XLSX.WorkSheet;

  constructor() {
    this.workbook = XLSX.utils.book_new();
  }

  // 데이터를 워크시트에 추가
  addWorksheet<T extends Record<string, unknown>>(data: T[], sheetName: string) {
    this.worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(this.workbook, this.worksheet, sheetName);
  }

  // 엑셀 파일을 Buffer로 생성
  generateBuffer(): Buffer {
    return XLSX.write(this.workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  // 엑셀 파일을 Base64로 생성
  generateBase64(): string {
    return XLSX.write(this.workbook, { type: 'base64', bookType: 'xlsx' });
  }

  // 스트리밍 방식으로 대용량 데이터 처리
  static async streamToExcel<T extends Record<string, unknown>>(
    dataGenerator: AsyncGenerator<T[]>,
    sheetName: string,
    headers: string[]
  ): Promise<Buffer> {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);

    let rowIndex = 1; // 헤더 다음부터 시작

    for await (const batch of dataGenerator) {
      const rows = batch.map(item => Object.values(item));
      
      // 배치 데이터를 워크시트에 추가
      XLSX.utils.sheet_add_aoa(worksheet, rows, { origin: rowIndex });
      rowIndex += batch.length;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}

// 필터 타입 정의
interface UserFilters {
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  role?: 'ADMIN' | 'MANAGER' | 'STAFF' | 'MEMBER' | 'GENERAL';
  marketingAgreed?: boolean;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

interface ConsultationFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  type?: 'GENERAL' | 'PRODUCT_INQUIRY' | 'TECHNICAL_SUPPORT' | 'COMPLAINT' | 'PARTNERSHIP' | 'OTHER';
  assignedTo?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

interface ApplicationFilters {
  status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'ON_HOLD';
  type?: 'INSURANCE' | 'TELECOM' | 'RENTAL' | 'FUNERAL' | 'SHOPPING' | 'OTHER';
  processedBy?: string;
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
}

interface PaymentFilters {
  status?: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED';
  type?: 'MONTHLY' | 'ONE_TIME' | 'REFUND' | 'ADJUSTMENT';
  dueDate?: {
    gte?: Date;
    lte?: Date;
  };
}

interface SettlementFilters {
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
  type?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'SPECIAL';
  processedBy?: string;
  periodStart?: {
    gte?: Date;
    lte?: Date;
  };
}

// 사용자 데이터 내보내기
export async function exportUsers(filters: UserFilters = {}): Promise<Buffer> {
  const users = await prisma.user.findMany({
    where: filters,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      status: true,
      role: true,
      marketingAgreed: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const exporter = new ExcelExporter();
  exporter.addWorksheet(users, 'Users');

  return exporter.generateBuffer();
}

// 상담 데이터 내보내기
export async function exportConsultations(filters: ConsultationFilters = {}): Promise<Buffer> {
  const consultations = await prisma.consultation.findMany({
    where: filters,
    select: {
      id: true,
      type: true,
      title: true,
      status: true,
      priority: true,
      category: true,
      requestedDate: true,
      scheduledDate: true,
      completedDate: true,
      assignedTo: true,
      rating: true,
      createdAt: true,
      contactEmail: true,
      contactPhone: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = consultations.map(consultation => ({
    ID: consultation.id,
    '사용자명': '비회원',
    '이메일': consultation.contactEmail || '',
    '전화번호': consultation.contactPhone,
    '상담유형': consultation.type,
    '상태': consultation.status,
    '우선순위': consultation.priority,
    '제목': consultation.title,
    '카테고리': consultation.category,
    '요청일': consultation.requestedDate,
    '예약일': consultation.scheduledDate,
    '완료일': consultation.completedDate,
    '담당자': consultation.assignedTo,
    '평점': consultation.rating,
    '생성일': consultation.createdAt,
  }));

  const exporter = new ExcelExporter();
  exporter.addWorksheet(data, 'Consultations');

  return exporter.generateBuffer();
}

// 신청서 데이터 내보내기
export async function exportApplications(filters: ApplicationFilters = {}): Promise<Buffer> {
  const applications = await prisma.application.findMany({
    where: filters,
    select: {
      id: true,
      type: true,
      status: true,
      priority: true,
      productName: true,
      productCategory: true,
      monthlyAmount: true,
      totalAmount: true,
      commissionRate: true,
      expectedCommission: true,
      applicantName: true,
      applicantPhone: true,
      applicantEmail: true,
      applicantAddress: true,
      processedBy: true,
      processedAt: true,
      approvedBy: true,
      approvedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const data = applications.map(application => ({
    ID: application.id,
    '사용자명': application.applicantName,
    '이메일': application.applicantEmail,
    '전화번호': application.applicantPhone,
    '신청유형': application.type,
    '상태': application.status,
    '우선순위': application.priority,
    '상품명': application.productName,
    '상품카테고리': application.productCategory,
    '월납금액': application.monthlyAmount,
    '총금액': application.totalAmount,
    '수수료율': application.commissionRate,
    '예상수수료': application.expectedCommission,
    '신청자명': application.applicantName,
    '신청자연락처': application.applicantPhone,
    '신청자이메일': application.applicantEmail,
    '신청자주소': application.applicantAddress,
    '처리자': application.processedBy,
    '처리일': application.processedAt,
    '승인자': application.approvedBy,
    '승인일': application.approvedAt,
    '생성일': application.createdAt,
  }));

  const exporter = new ExcelExporter();
  exporter.addWorksheet(data, 'Applications');

  return exporter.generateBuffer();
}

// 결제 데이터 내보내기
export async function exportPayments(filters: PaymentFilters = {}): Promise<Buffer> {
  const payments = await prisma.payment.findMany({
    where: filters,
    select: {
      id: true,
      type: true,
      status: true,
      amount: true,
      commissionAmount: true,
      netAmount: true,
      dueDate: true,
      paidDate: true,
      paymentMethod: true,
      transactionId: true,
      processedBy: true,
      processedAt: true,
      createdAt: true,
    },
    orderBy: { dueDate: 'desc' },
  });

  const data = payments.map(payment => ({
    ID: payment.id,
    '사용자명': '미지정',
    '이메일': '',
    '전화번호': '',
    '결제유형': payment.type,
    '상태': payment.status,
    '금액': payment.amount,
    '수수료금액': payment.commissionAmount,
    '순수익': payment.netAmount,
    '납부기한': payment.dueDate,
    '납부일': payment.paidDate,
    '결제방법': payment.paymentMethod,
    '거래ID': payment.transactionId,
    '상품명': '',
    '상품카테고리': '',
    '처리자': payment.processedBy,
    '처리일': payment.processedAt,
    '생성일': payment.createdAt,
  }));

  const exporter = new ExcelExporter();
  exporter.addWorksheet(data, 'Payments');

  return exporter.generateBuffer();
}

// 정산 데이터 내보내기
export async function exportSettlements(filters: SettlementFilters = {}): Promise<Buffer> {
  const settlements = await prisma.settlement.findMany({
    where: filters,
    select: {
      id: true,
      type: true,
      status: true,
      totalAmount: true,
      commissionAmount: true,
      netAmount: true,
      taxAmount: true,
      finalAmount: true,
      periodStart: true,
      periodEnd: true,
      settlementDate: true,
      paymentMethod: true,
      bankName: true,
      bankAccount: true,
      accountHolder: true,
      processedBy: true,
      processedAt: true,
      approvedBy: true,
      approvedAt: true,
      createdAt: true,
    },
    orderBy: { periodStart: 'desc' },
  });

  const data = settlements.map(settlement => ({
    ID: settlement.id,
    '사용자명': '미지정',
    '이메일': '',
    '전화번호': '',
    '정산유형': settlement.type,
    '상태': settlement.status,
    '총금액': settlement.totalAmount,
    '수수료금액': settlement.commissionAmount,
    '순수익': settlement.netAmount,
    '세금': settlement.taxAmount,
    '최종금액': settlement.finalAmount,
    '정산시작일': settlement.periodStart,
    '정산종료일': settlement.periodEnd,
    '정산일': settlement.settlementDate,
    '정산방법': settlement.paymentMethod,
    '은행명': settlement.bankName,
    '계좌번호': settlement.bankAccount,
    '예금주': settlement.accountHolder,
    '처리자': settlement.processedBy,
    '처리일': settlement.processedAt,
    '승인자': settlement.approvedBy,
    '승인일': settlement.approvedAt,
    '생성일': settlement.createdAt,
  }));

  const exporter = new ExcelExporter();
  exporter.addWorksheet(data, 'Settlements');

  return exporter.generateBuffer();
}

// 통합 보고서 생성
export async function generateComprehensiveReport(
  dateRange: { start: Date; end: Date }
): Promise<Buffer> {
  const workbook = XLSX.utils.book_new();

  // 1. 사용자 통계
  const userStats = await prisma.user.groupBy({
    by: ['status', 'role'],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const userStatsData = userStats.map(stat => ({
    '상태': stat.status,
    '역할': stat.role,
    '인원수': stat._count.id,
  }));

  const userStatsSheet = XLSX.utils.json_to_sheet(userStatsData);
  XLSX.utils.book_append_sheet(workbook, userStatsSheet, 'User Statistics');

  // 2. 상담 통계
  const consultationStats = await prisma.consultation.groupBy({
    by: ['status', 'type'],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const consultationStatsData = consultationStats.map(stat => ({
    '상태': stat.status,
    '유형': stat.type,
    '건수': stat._count.id,
  }));

  const consultationStatsSheet = XLSX.utils.json_to_sheet(consultationStatsData);
  XLSX.utils.book_append_sheet(workbook, consultationStatsSheet, 'Consultation Statistics');

  // 3. 신청서 통계
  const applicationStats = await prisma.application.groupBy({
    by: ['status', 'type'],
    _count: {
      id: true,
    },
    _sum: {
      totalAmount: true,
      expectedCommission: true,
    },
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const applicationStatsData = applicationStats.map(stat => ({
    '상태': stat.status,
    '유형': stat.type,
    '건수': stat._count.id,
    '총금액': stat._sum.totalAmount || 0,
    '예상수수료': stat._sum.expectedCommission || 0,
  }));

  const applicationStatsSheet = XLSX.utils.json_to_sheet(applicationStatsData);
  XLSX.utils.book_append_sheet(workbook, applicationStatsSheet, 'Application Statistics');

  // 4. 결제 통계
  const paymentStats = await prisma.payment.groupBy({
    by: ['status', 'type'],
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
      commissionAmount: true,
      netAmount: true,
    },
    where: {
      createdAt: {
        gte: dateRange.start,
        lte: dateRange.end,
      },
    },
  });

  const paymentStatsData = paymentStats.map(stat => ({
    '상태': stat.status,
    '유형': stat.type,
    '건수': stat._count.id,
    '총금액': stat._sum.amount || 0,
    '수수료금액': stat._sum.commissionAmount || 0,
    '순수익': stat._sum.netAmount || 0,
  }));

  const paymentStatsSheet = XLSX.utils.json_to_sheet(paymentStatsData);
  XLSX.utils.book_append_sheet(workbook, paymentStatsSheet, 'Payment Statistics');

  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// 대용량 데이터 스트리밍 내보내기
export async function* streamUserData(
  batchSize: number = 1000
): AsyncGenerator<Array<Record<string, unknown>>, void, unknown> {
  let skip = 0;
  
  while (true) {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        role: true,
        createdAt: true,
      },
      skip,
      take: batchSize,
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) break;
    
    yield users;
    skip += batchSize;
  }
}

// 사용자 데이터 스트리밍 내보내기
export async function exportUsersStreaming(): Promise<Buffer> {
  const headers = ['ID', '이름', '이메일', '전화번호', '상태', '역할', '가입일'];
  
  return ExcelExporter.streamToExcel(
    streamUserData(),
    'Users',
    headers
  );
}

