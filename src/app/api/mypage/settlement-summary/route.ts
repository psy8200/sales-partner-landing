import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// BigInt 직렬화 처리 함수
function jsonSafe(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? Number(v) : v))
  );
}

// 회원의 정산 요약 조회 API
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 정산 요약 조회 API 시작');
    
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    const userPhone = searchParams.get('userPhone');
    
    if (!userName || !userPhone) {
      return NextResponse.json({
        success: false,
        message: '회원명과 연락처가 필요합니다.'
      }, { status: 400 });
    }
    
    console.log('📋 조회 조건:', { userName, userPhone });
    
    // 해당 회원의 정산 기록 조회
    const settlementRecords = await prisma.settlementRecord.findMany({
      where: {
        userName: userName,
        userPhone: userPhone
      },
      orderBy: {
        settlementYearMonth: 'desc'
      }
    });
    
    console.log('📊 조회된 정산 기록:', settlementRecords.length, '건');
    
    // 정산 요약 계산
    const totalRecords = settlementRecords.length;
    const totalCommission = settlementRecords.reduce((sum, record) => sum + record.totalCommission, 0);
    const totalBasicCommission = settlementRecords.reduce((sum, record) => sum + record.basicCommission, 0);
    const totalRecruitmentCommission = settlementRecords.reduce((sum, record) => sum + record.recruitmentCommission, 0);
    const totalIndirectCommission = settlementRecords.reduce((sum, record) => sum + record.indirectCommission, 0);
    const totalDividendCommission = settlementRecords.reduce((sum, record) => sum + record.dividendBasicCommission + record.dividendLevelCommission, 0);
    
    // 출금 가능한 금액 (지급완료 상태인 것들)
    const withdrawableAmount = settlementRecords
      .filter(record => record.paymentStatus === 'PAID' && record.requestStatus === '지급완료')
      .reduce((sum, record) => sum + record.totalCommission, 0);
    
    // 정산 예정 금액 (정산가능 상태인 것들)
    const scheduledAmount = settlementRecords
      .filter(record => record.requestStatus === '정산가능')
      .reduce((sum, record) => sum + record.totalCommission, 0);
    
    // 최근 정산 기록 (최대 12개월)
    const recentSettlements = settlementRecords.slice(0, 12).map(record => ({
      id: record.id,
      month: record.settlementYearMonth,
      totalAmount: record.totalCommission,
      basicSalary: record.basicCommission,
      recruitmentBonus: record.recruitmentCommission,
      indirectBonus: record.indirectCommission,
      dividendIncome: record.dividendBasicCommission + record.dividendLevelCommission,
      status: record.paymentStatus,
      requestDate: record.createdAt.toISOString(),
      completedDate: record.processedAt?.toISOString()
    }));
    
    const summary = {
      totalRecords,
      totalCommission,
      totalBasicCommission,
      totalRecruitmentCommission,
      totalIndirectCommission,
      totalDividendCommission,
      withdrawableAmount,
      scheduledAmount,
      totalPaid: withdrawableAmount, // 지급완료 금액
      recentSettlements
    };
    
    console.log('✅ 정산 요약 계산 완료:', {
      totalRecords,
      totalCommission,
      withdrawableAmount,
      scheduledAmount
    });
    
    return NextResponse.json({
      success: true,
      data: {
        summary: jsonSafe(summary),
        settlements: jsonSafe(recentSettlements)
      }
    });
    
  } catch (error) {
    console.error('❌ 정산 요약 조회 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산 요약 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
