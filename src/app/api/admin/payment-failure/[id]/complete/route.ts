import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금실패 데이터를 수금완료로 처리하는 API
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID가 제공되지 않았습니다.' }, { status: 400 });
    }

    // Payment 레코드를 수금완료 상태로 업데이트
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'PAID',
        paidDate: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: '수금완료로 처리되었습니다.',
      payment: updatedPayment,
    });

  } catch (error) {
    console.error('수금완료 처리 오류:', error);
    return NextResponse.json({ 
      error: '수금완료 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
