import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { contractIds } = await request.json();

    if (!contractIds || !Array.isArray(contractIds) || contractIds.length === 0) {
      return NextResponse.json(
        { error: '이동할 계약 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 계약들을 일시납계약으로 이동 (status를 'LUMP_SUM'으로 변경)
    const updatedContracts = await prisma.contract.updateMany({
      where: {
        id: { in: contractIds },
        status: 'CONFIRMED' // 확정된 계약만 이동 가능
      },
      data: {
        status: 'LUMP_SUM',
        notes: '일시납계약으로 이동됨'
      }
    });

    if (updatedContracts.count === 0) {
      return NextResponse.json(
        { error: '이동할 수 있는 계약이 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `${updatedContracts.count}개 계약이 일시납계약으로 이동되었습니다.`,
      movedCount: updatedContracts.count
    });

  } catch (error) {
    console.error('일시납계약 이동 오류:', error);
    return NextResponse.json(
      { error: '계약 이동 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
