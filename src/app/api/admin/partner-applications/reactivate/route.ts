import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, reactivatedBy } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    }

    // 파트너신청 재활성화 처리
    const reactivatedApplication = await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: 'PENDING',
        cancelledAt: null,
        cancelReason: null,
        cancelledBy: null,
        updatedAt: new Date(),
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
        title: '파트너신청 재활성화',
        description: `${reactivatedApplication.user?.name || '사용자'}님의 파트너신청이 재활성화되었습니다.`,
        userId: reactivatedApplication.userId,
        metadata: JSON.stringify({
          reactivatedBy: reactivatedBy || '시스템',
          previousStatus: 'CANCELLED',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: '파트너신청이 재활성화되었습니다.',
      data: reactivatedApplication,
    });
  } catch (error) {
    console.error('파트너신청 재활성화 실패:', error);
    return NextResponse.json({
      error: '파트너신청 재활성화에 실패했습니다.',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
