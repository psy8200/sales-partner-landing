import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금실패 데이터 수정 API
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updateData = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID가 제공되지 않았습니다.' }, { status: 400 });
    }

    // 수정할 데이터 검증
    const { name, policyNumber, referrer, manager, paymentAmount, paymentMonth } = updateData;

    if (!name || !policyNumber || !referrer || !manager || !paymentAmount || !paymentMonth) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // Payment 레코드 업데이트
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: paymentAmount,
        memo: `수금검증 실패 - 수정됨 - 고객명: ${name}, 증권번호: ${policyNumber}, 추천인: ${referrer}, 담당자: ${manager}, 납입금액: ${paymentAmount}, 수금월: ${paymentMonth}`,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: '데이터가 성공적으로 수정되었습니다.',
      payment: updatedPayment,
    });

  } catch (error) {
    console.error('수금실패 데이터 수정 오류:', error);
    return NextResponse.json({ 
      error: '데이터 수정 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}


