import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 회원 정산 요약 API (서버 DB에서 조회)
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 회원 정산 요약 API 호출 시작');
    
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: '사용자 ID가 필요합니다.'
      }, { status: 400 });
    }
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        status: true,
        isActive: true
      }
    });
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    console.log('🔍 사용자 정보:', { name: user.name, phone: user.phone });
    
    // 서버 DB에서 정산 완료 데이터 조회 (이름 + 연락처로 매칭)
    const settlementRecords = await prisma.settlementRecord.findMany({
      where: {
        userName: user.name,
        userPhone: user.phone
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📊 서버에서 조회된 정산 데이터:', settlementRecords.length, '건');
    
    if (settlementRecords.length === 0) {
      // 정산 데이터가 없는 경우 기본값 반환
      return NextResponse.json({
        success: true,
        data: {
          basicSalary: 0,
          recruitmentBonus: 0,
          indirectBonus: 0,
          dividendIncome: 0,
          total: 0,
          withdrawable: 0,
          scheduled: 0,
          totalPaid: 0,
          settlementHistory: []
        }
      });
    }
    
    // 정산가능 상태인 데이터만 필터링
    const availableRecords = settlementRecords.filter(record => 
      record.requestStatus === '정산가능'
    );
    
    console.log('🔍 정산가능 상태 데이터:', availableRecords.length, '건');
    
    if (availableRecords.length === 0) {
      // 정산가능 데이터가 없는 경우 기본값 반환
      return NextResponse.json({
        success: true,
        data: {
          basicSalary: 0,
          recruitmentBonus: 0,
          indirectBonus: 0,
          dividendIncome: 0,
          total: 0,
          withdrawable: 0,
          scheduled: 0,
          totalPaid: 0,
          settlementHistory: []
        }
      });
    }
    
    // 가장 최근 정산가능 데이터 사용
    const latestRecord = availableRecords[0];
    
    console.log('💰 최근 정산가능 데이터:', {
      userName: latestRecord.userName,
      userPhone: latestRecord.userPhone,
      basicCommission: latestRecord.basicCommission,
      recruitmentCommission: latestRecord.recruitmentCommission,
      indirectCommission: latestRecord.indirectCommission,
      dividendBasicCommission: latestRecord.dividendBasicCommission,
      dividendLevelCommission: latestRecord.dividendLevelCommission,
      totalCommission: latestRecord.totalCommission
    });
    
    // 수당 현황 계산 (매칭 기준: 이름 + 연락처)
    const basicSalary = latestRecord.basicCommission;           // 기본수당 = 기본수당
    const recruitmentBonus = latestRecord.recruitmentCommission; // 모집수당 = 모집수당
    const indirectBonus = latestRecord.indirectCommission;       // 간접수당 = 간접수당
    const dividendIncome = latestRecord.dividendBasicCommission + latestRecord.dividendLevelCommission; // 배당수익 = 기본배당 + 배당등급별
    const total = latestRecord.totalCommission;                  // 총 수당
    
    // 출금 가능, 정산 예정, 지급 완료 계산
    const paidAmount = settlementRecords
      .filter(record => record.paymentStatus === 'PAID')
      .reduce((sum, record) => sum + record.totalCommission, 0);
    
    const withdrawableAmount = availableRecords
      .filter(record => record.paymentStatus === 'PENDING')
      .reduce((sum, record) => sum + record.totalCommission, 0);
    
    const scheduledAmount = settlementRecords
      .filter(record => record.requestStatus === '출금요청')
      .reduce((sum, record) => sum + record.totalCommission, 0);
    
    // 정산 이력 생성
    const settlementHistory = settlementRecords.map(record => ({
      id: record.id,
      settlementYearMonth: record.settlementYearMonth,
      basicSalary: record.basicCommission,
      recruitmentBonus: record.recruitmentCommission,
      indirectBonus: record.indirectCommission,
      dividendIncome: record.dividendBasicCommission + record.dividendLevelCommission,
      total: record.totalCommission,
      requestStatus: record.requestStatus,
      paymentStatus: record.paymentStatus,
      createdAt: record.createdAt
    }));
    
    const result = {
      basicSalary,
      recruitmentBonus,
      indirectBonus,
      dividendIncome,
      total,
      withdrawable: withdrawableAmount,
      scheduled: scheduledAmount,
      totalPaid: paidAmount,
      settlementHistory
    };
    
    console.log('✅ 서버 DB 기반 API 응답:', result);
    
    return NextResponse.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    console.error('❌ 회원 정산 요약 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산 데이터 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
