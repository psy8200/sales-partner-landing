import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 상담이력에서 상담신청으로 되돌리는 API
export async function POST(request: NextRequest) {
  try {
    const { consultationId } = await request.json();

    if (!consultationId) {
      return NextResponse.json(
        { error: '상담 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 상담이력 조회
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,
            addressDetail: true,
            zipCode: true
          }
        }
      }
    });

    if (!consultation) {
      return NextResponse.json(
        { error: '해당 상담이력을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 상담이력을 상담신청(PartnerApplication)으로 변환하여 생성
    // tags에서 원본 데이터 추출 시도
    const tags = consultation.tags as any || {};
    const originalArea = tags.area || consultation.category || '서울';
    const originalReferrer = tags.referrer || consultation.type || '직접신청';
    
    // 시간 형식 정규화
    let availableTime = '오전 9:00-11:00'; // 기본값
    if (consultation.scheduledDate) {
      const date = new Date(consultation.scheduledDate);
      const hour = date.getHours();
      if (hour < 12) {
        availableTime = `오전 ${hour}:00-${hour + 2}:00`;
      } else {
        availableTime = `오후 ${hour - 12}:00-${hour - 10}:00`;
      }
    }
    
    const partnerApplicationData = {
      userId: consultation.userId,
      availableDate: consultation.scheduledDate ? new Date(consultation.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      availableTime: availableTime,
      preferredTime: consultation.scheduledDate ? (new Date(consultation.scheduledDate).getHours() < 12 ? '오전' : '오후') : '오전',
      area: originalArea,
      referrer: originalReferrer,
      additionalNote: consultation.description || consultation.memo || '',
      status: 'PENDING' as const,
      processedBy: null,
      processedAt: null,
      approvedBy: null,
      approvedAt: null,
      completedAt: null,
      cancelledAt: null,
      cancelledBy: null,
      cancelReason: null,
      adminMemo: `상담이력에서 되돌려짐 - 원본 상담 ID: ${consultation.id}`
    };

    // 상담신청 생성
    const createdApplication = await prisma.partnerApplication.create({
      data: partnerApplicationData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            addressDetail: true,
            zipCode: true
          }
        }
      }
    });

    // 원본 상담이력 삭제
    await prisma.consultation.delete({
      where: { id: consultationId }
    });

    return NextResponse.json({
      success: true,
      message: `${consultation.user.name}님의 상담이 상담신청으로 되돌려졌습니다.`,
      applicationId: createdApplication.id,
      customerName: consultation.user.name,
      customerPhone: consultation.user.phone
    });

  } catch (error) {
    console.error('상담이력 되돌리기 오류:', error);
    return NextResponse.json(
      { error: '상담이력 되돌리기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
