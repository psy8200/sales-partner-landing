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

    // 선택된 계약들을 ACTIVE 상태로 되돌리기
    const updatedContracts = await prisma.contract.updateMany({
      where: {
        id: {
          in: contractIds
        },
        status: {
          in: ['CONFIRMED', 'COLLECTION', 'LUMP_SUM'] // 모든 확정 상태에서 되돌리기 가능
        }
      },
      data: {
        status: 'ACTIVE',
        confirmedAt: null, // 확정일시 초기화
        notes: null // 노트 초기화
      }
    });

    return NextResponse.json({
      success: true,
      message: `${updatedContracts.count}개의 계약이 계약목록으로 되돌려졌습니다.`,
      updatedCount: updatedContracts.count
    });

  } catch (error) {
    console.error('계약 되돌리기 오류:', error);
    return NextResponse.json(
      { error: '계약 되돌리기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}





