import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 상담신청에서 상담이력으로 이동하는 API
export async function POST(request: NextRequest) {
  try {
    const { selectedIds } = await request.json();

    if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
      return NextResponse.json(
        { error: '이동할 상담신청을 선택해주세요.' },
        { status: 400 }
      );
    }

    // 선택된 상담신청 조회
    const partnerApplications = await prisma.partnerApplication.findMany({
      where: {
        id: { in: selectedIds },
        status: 'COMPLETED' // 완료된 상담만 이동 가능
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (partnerApplications.length === 0) {
      return NextResponse.json(
        { error: '이동 가능한 완료된 상담이 없습니다.' },
        { status: 400 }
      );
    }

            // 상담이력으로 변환하여 생성 (데이터베이스에 실제 존재하는 필드만 사용)
            const consultationData = partnerApplications.map(app => ({
              userId: app.userId,
              type: 'PARTNERSHIP', // 파트너신청에서 온 상담
              title: `${app.user.name}님의 파트너신청 상담`,
              description: app.additionalNote || '파트너신청 상담이 완료되었습니다.',
              category: app.area, // 지역 정보를 category에 저장
              contactName: app.user.name,
              contactPhone: app.user.phone,
              contactEmail: app.user.email,
              requestedDate: app.createdAt,
              scheduledDate: app.processedAt,
              completedDate: app.completedAt,
              assignedTo: app.processedBy, // 실제 담당자 정보 저장
              assignedAt: app.processedAt,
              status: 'COMPLETED',
              priority: 'NORMAL',
              memo: `파트너신청 상담 완료 - 지역: ${app.area}, 추천인: ${app.referrer}`,
              result: '상담 완료',
              rating: 5,
              tags: {
                originalApplicationId: app.id,
                area: app.area, // 원본 지역 정보 보존
                referrer: app.referrer, // 원본 추천인코드 보존
                availableTime: app.availableTime // 원본 상담가능시간 보존
              }
            }));

    // 상담이력 생성
    const createdConsultations = await prisma.consultation.createMany({
      data: consultationData
    });

    // 원본 상담신청 삭제 (이동이므로)
    const deletedApplications = await prisma.partnerApplication.deleteMany({
      where: {
        id: { in: selectedIds }
      }
    });

    return NextResponse.json({
      success: true,
      message: `${createdConsultations.count}개의 상담이 상담이력으로 이동되었습니다.`,
      movedCount: createdConsultations.count,
      deletedCount: deletedApplications.count
    });

  } catch (error) {
    console.error('상담이력 이동 오류:', error);
    return NextResponse.json(
      { error: '상담이력 이동 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
