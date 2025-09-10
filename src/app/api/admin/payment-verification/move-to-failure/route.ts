import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금실패 데이터를 수금실패페이지로 이동
export async function POST(request: NextRequest) {
  try {
    const { failureData } = await request.json();

    if (!failureData || !Array.isArray(failureData) || failureData.length === 0) {
      return NextResponse.json({ error: '수금실패 데이터가 제공되지 않았습니다.' }, { status: 400 });
    }

    const movedData = [];

    for (const data of failureData) {
      try {
        // 수금실패 데이터를 별도 테이블에 저장 (또는 기존 테이블에 실패 상태로 저장)
        // 여기서는 Payment 테이블에 실패 상태로 저장
        const paymentRecord = await prisma.payment.create({
          data: {
            type: 'MONTHLY',
            status: 'PENDING', // 수금실패 상태
            amount: data.paymentAmount,
            commissionAmount: 0,
            netAmount: data.paymentAmount,
            dueDate: new Date(),
            memo: `수금검증 실패 - ${data.reason || '매칭되는 계약을 찾을 수 없습니다.'} (${data.paymentMonth})`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // 수금실패 상세 정보를 별도 저장 (필요시)
        // 여기서는 간단히 movedData에 추가
        movedData.push({
          paymentId: paymentRecord.id,
          name: data.name,
          policyNumber: data.policyNumber,
          referrer: data.referrer,
          manager: data.manager,
          paymentAmount: data.paymentAmount,
          paymentMonth: data.paymentMonth,
          reason: data.reason || '매칭되는 계약을 찾을 수 없습니다.',
        });
      } catch (error) {
        console.error(`수금실패 데이터 ${data.name} 처리 오류:`, error);
        // 개별 오류는 로그만 남기고 계속 진행
      }
    }

    return NextResponse.json({
      message: `${movedData.length}개의 수금실패 데이터가 수금실패페이지로 이동되었습니다.`,
      movedCount: movedData.length,
      movedData,
    });

  } catch (error) {
    console.error('수금실패 데이터 이동 오류:', error);
    return NextResponse.json({ 
      error: '데이터 이동 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}


