import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log('수금확정 API 호출:', { contractId: id });

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

    // 현재 상태가 COLLECTION인지 확인
    if (contract.status !== 'COLLECTION') {
      return NextResponse.json(
        { error: '수금관리 상태의 계약만 수금확정할 수 있습니다.' },
        { status: 400 }
      );
    }

    // 계약 상태를 COMPLETED_COLLECTION으로 변경 (완전수금확정)
    const updatedContract = await prisma.contract.update({
      where: { id },
      data: {
        status: 'COMPLETED_COLLECTION',
        confirmedAt: new Date().toISOString()
      },
      select: {
        id: true,
        status: true,
        customerName: true,
        confirmedAt: true
      }
    });

    console.log('수금확정 완료:', { 
      contractId: id, 
      customerName: contract.customerName,
      newStatus: updatedContract.status 
    });

    return NextResponse.json({
      success: true,
      message: '수금확정이 완료되었습니다.',
      contract: updatedContract
    });

  } catch (error) {
    console.error('수금확정 API 오류:', error);
    return NextResponse.json(
      { error: '수금확정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
