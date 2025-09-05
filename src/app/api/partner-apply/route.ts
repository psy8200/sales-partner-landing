import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createSuccessResponse, createErrorResponse, createBadRequestResponse, createUnauthorizedResponse, createNotFoundResponse } from '@/lib/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { availableDate, availableTime, additionalNote, area } = body;

    // 사용자 인증 확인
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return createUnauthorizedResponse('인증이 필요합니다.');
    }

    // 사용자 ID 추출 (실제로는 JWT 토큰에서 추출해야 함)
    const userId = authHeader.replace('Bearer ', '');

    // 사용자 존재 확인 (고객정보 포함)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        role: true, 
        partnerStatus: true,
        address: true,        // 지역 정보
        referralCode: true    // 추천인코드
      }
    });

    if (!user) {
      return createNotFoundResponse('사용자를 찾을 수 없습니다.');
    }

    // 이미 파트너신청이 있는지 확인
    const existingApplication = await prisma.partnerApplication.findFirst({
      where: { userId }
    });

    if (existingApplication) {
      return createBadRequestResponse('이미 파트너신청이 존재합니다.');
    }

    // 추천인코드 자동 설정 (회원가입시 입력값 우선, 없으면 기본값)
    let finalReferrer = user.referralCode;
    if (!finalReferrer) {
      // 회사정보관리에서 기본추천인코드 가져오기
      const companyInfo = await prisma.companyInfo.findFirst();
      finalReferrer = companyInfo?.referralCodeDefault || '기본추천인코드 없음';
    }

    // 파트너신청 생성 (고객정보와 함께 저장)
    const partnerApplication = await prisma.partnerApplication.create({
      data: {
        userId,
        availableDate,
        availableTime,
        additionalNote,
        area: user.address || area,           // 고객정보의 지역 우선, 없으면 입력값
        referrer: finalReferrer,             // 자동 설정된 추천인코드
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            address: true,        // 지역 정보 포함
            referralCode: true    // 추천인코드 포함
          }
        }
      }
    });

    // 사용자의 파트너상태를 PARTNER_APPLIED로 변경
    await prisma.user.update({
      where: { id: userId },
      data: { partnerStatus: 'PARTNER_APPLIED' }
    });

    // 활동 로그 기록
    await prisma.activityLog.create({
      data: {
        type: 'PARTNER_APPLICATION',
        title: '파트너신청 접수',
        description: `${user.name}님이 파트너신청을 제출했습니다.`,
        userId,
        metadata: JSON.stringify({
          availableDate,
          availableTime,
          additionalNote
        })
      }
    });

    return createSuccessResponse(
      partnerApplication,
      '파트너신청이 성공적으로 접수되었습니다.'
    );

  } catch (error) {
    console.error('파트너신청 실패:', error);
    return createErrorResponse('파트너신청에 실패했습니다.');
  }
}
