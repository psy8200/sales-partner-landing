import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 프로필변경요청 상태 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: '상태값이 필요합니다.' }, { status: 400 });
    }

    // 유효한 상태값인지 확인
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: '유효하지 않은 상태값입니다.' }, { status: 400 });
    }

    // 프로필변경요청 상태 업데이트
    const updatedRequest = await prisma.profileChangeRequest.update({
      where: { id: requestId },
      data: {
        status: status,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        userId: true,
        userName: true,
        userPhone: true,
        content: true,
        status: true,
        processedBy: true,
        processedAt: true,
        createdAt: true,
      }
    });

    console.log('프로필변경요청 상태 업데이트:', updatedRequest);

    return NextResponse.json({
      success: true,
      message: '프로필변경요청 상태가 업데이트되었습니다.',
      request: updatedRequest
    });

  } catch (error) {
    console.error('프로필변경요청 상태 업데이트 오류:', error);
    return NextResponse.json({
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}





