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
    
    // 해당 회원의 정산 기록 조회 (회원용 UserSettlementRecord 테이블 사용)
    const settlementRecords = await prisma.userSettlementRecord.findMany({
      where: {
        userName: userName,
        userPhone: userPhone
      },
      orderBy: {
        settlementYearMonth: 'desc'
      }
    });

    // 사용자의 현재 포인트 상태 조회
    const user = await prisma.user.findFirst({
      where: {
        name: userName,
        phone: userPhone
      },
      select: {
        id: true,
        name: true,
        phone: true,
        finalPoints: true,
        points: true,
        totalPaidPoints: true,    // 총지급포인트 누적
        remainingPoints: true     // 잔여포인트
      }
    });

    // 사용자의 계약 기반 포인트 조회 (모든 상태 포함)
    let contracts = [];
    let contractBasedPoints = 0;
    
    try {
      contracts = await prisma.contract.findMany({
        where: {
          customerName: userName,
          customerPhone: userPhone
          // status 필터 제거 - 모든 계약을 포함하여 누적 계산
        },
        select: {
          finalPoints: true,
          itemName: true,
          status: true
        }
      });

      // 계약 기반 총 포인트 계산
      contractBasedPoints = contracts.reduce((sum, contract) => sum + contract.finalPoints, 0);
    } catch (contractError) {
      console.log('⚠️ 계약 조회 실패, 기본값 사용:', contractError);
      contracts = [];
      contractBasedPoints = 0;
    }

    // 총지급포인트 누적 = User 테이블에서 직접 조회
    const totalPaidPoints = user?.totalPaidPoints || 0;

    console.log('👤 사용자 정보:', user);
    console.log('📋 조회된 계약:', contracts.length, '건');
    console.log('📊 계약 기반 포인트:', contractBasedPoints);
    console.log('📊 조회된 정산 기록:', settlementRecords.length, '건');
    console.log('💰 총지급포인트 누적 (User 테이블):', totalPaidPoints);

    // 정산 요약 계산
    const totalRecords = settlementRecords.length;
    const totalCommission = settlementRecords.reduce((sum, record) => sum + record.totalCommission, 0);
    const totalBasicCommission = settlementRecords.reduce((sum, record) => sum + record.basicCommission, 0);
    const totalRecruitmentCommission = settlementRecords.reduce((sum, record) => sum + record.recruitmentCommission, 0);
    const totalIndirectCommission = settlementRecords.reduce((sum, record) => sum + record.indirectCommission, 0);
    const totalDividendCommission = settlementRecords.reduce((sum, record) => sum + record.dividendBasicCommission + record.dividendLevelCommission, 0);
    
    // 🔥 3단계: 출금가능포인트 계산 - 올바른 공식 적용
    // 1. User 테이블의 remainingPoints 사용 (잔여포인트)
    const remainingPoints = user?.remainingPoints || 0;
    
    // 2. 출금가능포인트 = 기본수당 + 모집수당 + 간접수당 + 배당수익 + 잔여포인트
    const withdrawableAmount = totalBasicCommission + totalRecruitmentCommission + totalIndirectCommission + totalDividendCommission + remainingPoints;
    
    console.log('💰 출금가능포인트 계산 (User 테이블 기반):', {
      userTotalPaidPoints: user?.totalPaidPoints || 0,
      userRemainingPoints: user?.remainingPoints || 0,
      finalWithdrawable: withdrawableAmount,
      calculation: `${totalBasicCommission} + ${totalRecruitmentCommission} + ${totalIndirectCommission} + ${totalDividendCommission} + ${remainingPoints} = ${withdrawableAmount}`,
      breakdown: {
        기본수당: totalBasicCommission,
        모집수당: totalRecruitmentCommission,
        간접수당: totalIndirectCommission,
        배당수익: totalDividendCommission,
        잔여포인트: remainingPoints,
        최종출금가능: withdrawableAmount
      }
    });
    
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
      contractBasedPoints, // 계약 기반 포인트
      remainingPoints, // 잔여포인트 (UserSettlementRecord에서 계산)
      totalPaidPoints, // 총지급포인트 누적 (출금완료된 금액의 누적)
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
