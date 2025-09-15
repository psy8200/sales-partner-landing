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

    // 일시납계약에서 all-contracts로 되돌리기 (status를 'CONFIRMED'로 변경)
    const updatedContracts = await prisma.contract.updateMany({
      where: {
        id: {
          in: contractIds
        },
        status: 'LUMP_SUM' // 일시납계약 상태에서만 되돌리기 가능
      },
      data: {
        status: 'CONFIRMED', // all-contracts 상태로 변경
        notes: '일시납계약에서 all-contracts로 되돌려짐'
      }
    });

    if (updatedContracts.count === 0) {
      return NextResponse.json(
        { error: '되돌릴 수 있는 계약이 없습니다. (일시납계약 상태의 계약만 되돌릴 수 있습니다)' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${updatedContracts.count}개의 계약이 all-contracts로 되돌려졌습니다.`,
      updatedCount: updatedContracts.count
    });

  } catch (error) {
    console.error('일시납계약 all-contracts 되돌리기 오류:', error);
    return NextResponse.json(
      { error: '계약 되돌리기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
