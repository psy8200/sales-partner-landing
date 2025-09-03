import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, cancelReason, cancelledBy } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    }

    // 파트너신청 취소 처리
    const cancelledApplication = await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelReason: cancelReason || '상담신청 테이블 삭제로 인한 취소',
        cancelledBy: cancelledBy || '시스템',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        type: 'PARTNER_APPLICATION',
        title: '파트너신청 취소',
        description: `${cancelledApplication.user?.name || '사용자'}님의 파트너신청이 취소되었습니다.`,
        userId: cancelledApplication.userId,
        metadata: JSON.stringify({
          cancelReason: cancelReason || '상담신청 테이블 삭제로 인한 취소',
          cancelledBy: cancelledBy || '시스템',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: '파트너신청이 취소되었습니다.',
      data: cancelledApplication,
    });
  } catch (error) {
    console.error('파트너신청 취소 실패:', error);
    return NextResponse.json({
      error: '파트너신청 취소에 실패했습니다.',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
