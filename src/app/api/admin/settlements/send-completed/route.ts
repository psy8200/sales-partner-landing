import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 정산완료내역을 회원들에게 전송하는 API
 * /admin/settlements/completed 페이지의 테이블 데이터를 회원 개인 페이지로 전송
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 정산완료내역 전송 API 시작');
    
    const body = await request.json();
    const { completedData } = body; // completed 페이지에서 전송된 테이블 데이터
    
    console.log('📋 전송받은 정산완료 데이터:', completedData?.length || 0, '건');
    
    if (!completedData || completedData.length === 0) {
      return NextResponse.json({
        success: false,
        message: '전송할 정산완료 데이터가 없습니다.',
        sentCount: 0
      });
    }

    // 2. 각 회원의 정산 데이터를 개인 페이지로 전송
    const sentResults = [];
    
    for (const settlement of completedData) {
      try {
        // 회원 정보 확인
        const user = await prisma.user.findUnique({
          where: { phone: settlement.userPhone },
          select: { id: true, name: true, phone: true, role: true }
        });

        if (!user) {
          console.log(`⚠️ 회원을 찾을 수 없음: ${settlement.userPhone}`);
          continue;
        }

        // 기존에 "확인저장"으로 저장된 레코드를 찾아서 상태만 업데이트
        const existingRecord = await prisma.settlementRecord.findFirst({
          where: {
            userName: user.name,
            userPhone: user.phone,
            settlementYearMonth: settlement.settlementYearMonth || new Date().toISOString().slice(0, 7)
          }
        });

        if (existingRecord) {
          // 기존 레코드의 상태만 업데이트 (금액은 변경하지 않음)
          await prisma.settlementRecord.update({
            where: { id: existingRecord.id },
            data: {
              paymentStatus: 'PENDING', // 정산내역 전송시에만 지급대기중으로 설정
              requestStatus: '지급대기중',
              updatedAt: new Date()
            }
          });
          
          console.log(`✅ 회원 정산 상태 업데이트: ${user.name} (${user.phone}) - 지급대기중 상태로 설정`);
        } else {
          console.log(`⚠️ 해당 회원의 정산 기록을 찾을 수 없음: ${user.name} (${user.phone})`);
          // 정산 기록이 없으면 건너뛰기
          continue;
        }

        sentResults.push({
          userId: user.id,
          userName: user.name,
          userPhone: user.phone,
          totalCommission: settlement.totalCommission,
          status: 'success'
        });

      } catch (error) {
        console.error(`❌ 개별 회원 전송 실패: ${settlement.userPhone}`, error);
        sentResults.push({
          userId: settlement.userId,
          userName: settlement.userName,
          userPhone: settlement.userPhone,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = sentResults.filter(r => r.status === 'success').length;
    const failedCount = sentResults.filter(r => r.status === 'failed').length;

    console.log('🎉 정산완료내역 전송 완료:', {
      total: completedData.length,
      success: successCount,
      failed: failedCount
    });

    return NextResponse.json({
      success: true,
      message: `정산완료내역이 ${successCount}명의 회원에게 전송되었습니다.`,
      sentCount: successCount,
      failedCount: failedCount,
      details: sentResults
    });

  } catch (error) {
    console.error('❌ 정산완료내역 전송 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산완료내역 전송 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
