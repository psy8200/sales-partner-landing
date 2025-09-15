import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { contractIds } = await request.json();

    if (!contractIds || !Array.isArray(contractIds) || contractIds.length === 0) {
      return NextResponse.json(
        { error: '계약 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('확정할 계약 IDs:', contractIds);

    // 선택된 계약들을 CONFIRMED 상태로 업데이트
    const updatedContracts = await prisma.contract.updateMany({
      where: {
        id: {
          in: contractIds
        }
      },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date()
      }
    });

    console.log('업데이트된 계약 수:', updatedContracts.count);

    return NextResponse.json({
      success: true,
      message: `${updatedContracts.count}개의 계약이 확정되었습니다.`,
      updatedCount: updatedContracts.count
    });

  } catch (error) {
    console.error('계약 확정 오류:', error);
    return NextResponse.json(
      { error: '계약 확정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}





