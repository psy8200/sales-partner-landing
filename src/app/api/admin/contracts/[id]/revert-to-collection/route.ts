import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('수금관리로 되돌리기 API 호출:', { contractId: id });

    // 계약 존재 확인
    const contract = await prisma.contract.findUnique({
      where: { id },
      select: { id: true, status: true, customerName: true }
    });

    if (!contract) {
      return NextResponse.json(
        { error: '계약을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 현재 상태가 COMPLETED_COLLECTION인지 확인
    if (contract.status !== 'COMPLETED_COLLECTION') {
      return NextResponse.json(
        { error: '수금완료 상태의 계약만 되돌릴 수 있습니다.' },
        { status: 400 }
      );
    }

    // 계약 상태를 COLLECTION으로 변경 (확정일시는 유지)
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: 'COLLECTION'
        // confirmedAt은 유지 (이전 확정 기록 보존)
      },
      select: {
        id: true,
        status: true,
        customerName: true,
        confirmedAt: true
      }
    });

    console.log('수금관리로 되돌리기 완료:', { 
      contractId: id, 
      customerName: contract.customerName,
      newStatus: updatedContract.status 
    });

    return NextResponse.json({
      success: true,
      message: '계약이 수금관리계약으로 되돌려졌습니다.',
      contract: updatedContract
    });

  } catch (error) {
    console.error('수금관리로 되돌리기 API 오류:', error);
    return NextResponse.json(
      { error: '계약 되돌리기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
