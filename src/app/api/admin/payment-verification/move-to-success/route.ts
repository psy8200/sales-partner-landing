import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금성공 데이터를 수금완료페이지로 이동
export async function POST(request: NextRequest) {
  try {
    const { successData } = await request.json();

    if (!successData || !Array.isArray(successData) || successData.length === 0) {
      return NextResponse.json({ error: '수금성공 데이터가 제공되지 않았습니다.' }, { status: 400 });
    }

    const movedData = [];

    for (const data of successData) {
      try {
        // 해당 계약의 수금상태를 'COMPLETED'로 업데이트
        if (data.contractId) {
          await prisma.contract.update({
            where: { id: data.contractId },
            data: {
              status: 'COMPLETED', // 수금완료 상태로 변경
              updatedAt: new Date(),
            },
          });

          // Payment 테이블에 수금완료 기록 생성
          await prisma.payment.create({
            data: {
              contractId: data.contractId,
              type: 'MONTHLY',
              status: 'PAID',
              amount: data.paymentAmount,
              commissionAmount: 0, // 필요시 계산 로직 추가
              netAmount: data.paymentAmount,
              dueDate: new Date(),
              paidDate: new Date(),
              paymentMethod: 'BANK_TRANSFER',
              memo: `수금검증을 통한 자동 수금완료 처리 - ${data.paymentMonth}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });

          movedData.push({
            contractId: data.contractId,
            contractNumber: data.contractNumber,
            name: data.name,
            paymentAmount: data.paymentAmount,
            paymentMonth: data.paymentMonth,
          });
        }
      } catch (error) {
        console.error(`계약 ${data.contractId} 처리 오류:`, error);
        // 개별 오류는 로그만 남기고 계속 진행
      }
    }

    return NextResponse.json({
      message: `${movedData.length}개의 수금성공 데이터가 수금완료페이지로 이동되었습니다.`,
      movedCount: movedData.length,
      movedData,
    });

  } catch (error) {
    console.error('수금성공 데이터 이동 오류:', error);
    return NextResponse.json({ 
      error: '데이터 이동 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
