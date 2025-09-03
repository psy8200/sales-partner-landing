import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

// 안전한 날짜 변환 함수
function safeDateParse(dateString: string | null | undefined): Date | null {
  if (!dateString || dateString === 'Invalid Date') return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const body = await request.json();
    
    const {
      customerName,
      customerPhone,
      customerAddress,
      itemCategory,
      companyName,
      itemName,
      contractAmount,
      expectedRate,
      pointRate,
      contractDate,
      startDate,
      endDate,
      payoutRate,
      finalPoints,
      installationDate,
      dynamicFields
    } = body;

    // 필수 필드 검증
    if (!customerName || !customerPhone || !itemCategory || !itemName || !contractAmount || !contractDate || !startDate || !payoutRate || !finalPoints) {
      return NextResponse.json({ 
        error: '필수 필드가 누락되었습니다.' 
      }, { status: 400 });
    }

    // 계약 번호 생성 (기존 계약 번호 유지)
    const existingContract = await prisma.contract.findUnique({
      where: { id: contractId }
    });

    if (!existingContract) {
      return NextResponse.json({ 
        error: '수정할 계약을 찾을 수 없습니다.' 
      }, { status: 404 });
    }

    // 계약 데이터 업데이트
    const contractData: Record<string, unknown> = {
      customerName,
      customerPhone,
      customerAddress: customerAddress || '',
      itemCategory,
      companyName: companyName || '',
      itemName,
      contractAmount: parseInt(contractAmount.replace(/,/g, '')),
      commissionRate: 0, // 기본값
      commissionAmount: 0, // 기본값
      expectedRate: expectedRate ? parseFloat(expectedRate) : null,
      pointRate: pointRate ? parseFloat(pointRate) : null,
      payoutRate: payoutRate ? parseFloat(payoutRate) : null,
      finalPoints: finalPoints ? parseInt(finalPoints.replace(/,/g, '')) : null,
      contractDate: new Date(contractDate),
      startDate: safeDateParse(startDate),
      endDate: safeDateParse(endDate),
      installationDate: safeDateParse(installationDate),
      dynamicFields: dynamicFields ? JSON.stringify(dynamicFields) : null,
      status: 'ACTIVE',
      updatedAt: new Date(),
    };

    const updatedContract = await prisma.contract.update({
      where: { id: contractId },
      data: contractData,
    });

    return NextResponse.json({ 
      success: true, 
      contract: updatedContract,
      message: '계약이 성공적으로 수정되었습니다.' 
    });

  } catch (error) {
    console.error('계약 수정 오류:', error);
    return NextResponse.json({ 
      error: '계약 수정 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
