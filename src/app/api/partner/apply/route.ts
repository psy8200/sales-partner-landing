import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, safePrismaQuery, validatePrismaSchema } from '@/lib/prisma';
import { getAuthToken } from '@/lib/auth';

// 파트너신청 데이터 검증 스키마
const partnerApplicationSchema = z.object({
  availableDate: z.string().min(1, '상담가능날짜를 선택해주세요.'),
  availableTime: z.string().min(1, '상담가능시간을 선택해주세요.'),
  preferredTime: z.string().optional(),
  additionalNote: z.string().optional(),
  area: z.string().min(1, '지역을 입력해주세요.'),
});

export async function POST(request: NextRequest) {
  try {
    // 스키마 검증 실행
    const schemaValid = await validatePrismaSchema();
    if (!schemaValid) {
      console.error('파트너신청 API: Prisma 스키마 검증 실패');
      return NextResponse.json(
        { 
          success: false,
          error: "시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요." 
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const validatedData = partnerApplicationSchema.parse(body);

    // 인증 토큰 확인
    const authToken = await getAuthToken(request);
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          error: "로그인이 필요합니다." 
        },
        { status: 401 }
      );
    }

    const userId = authToken;
    
    // 사용자 정보 확인 - 안전한 쿼리 래퍼 사용
    const user = await safePrismaQuery(async () => {
      return await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          name: true, 
          role: true, 
          partnerStatus: true,
          address: true,
        }
      });
    });

    if (!user) {
      console.error('파트너신청 API: 사용자를 찾을 수 없습니다. userId:', userId);
      return NextResponse.json(
        { 
          success: false,
          error: "사용자 정보를 찾을 수 없습니다." 
        },
        { status: 404 }
      );
    }

    // 이미 파트너신청을 한 경우
    if (user.partnerStatus !== 'NOT_APPLIED') {
      console.log('파트너신청 API: 이미 신청된 사용자. userId:', userId, 'status:', user.partnerStatus);
      return NextResponse.json(
        { 
          success: false,
          error: "이미 파트너신청이 완료되었습니다." 
        },
        { status: 400 }
      );
    }

    // 지역 정보가 오면 사용자 주소에 반영
    if (validatedData.area && validatedData.area.trim().length > 0) {
      try {
        await safePrismaQuery(async () => {
          return await prisma.user.update({
            where: { id: userId },
            data: { address: validatedData.area.trim() },
          });
        });
      } catch (e) {
        console.warn('파트너신청 API: 지역 업데이트 경고', e);
      }
    }

    // 기본추천인코드 가져오기
    const companyInfo = await safePrismaQuery(async () => {
      return await prisma.companyInfo.findFirst({
        where: { isActive: true },
        select: { referralCodeDefault: true },
      });
    });

    const defaultReferralCode = companyInfo?.referralCodeDefault || '';

    // 파트너신청 정보 저장 - 안전한 쿼리 래퍼 사용
    const partnerApplication = await safePrismaQuery(async () => {
      return await prisma.partnerApplication.create({
        data: {
          userId: userId,
          availableDate: validatedData.availableDate,
          availableTime: validatedData.availableTime,
          preferredTime: validatedData.preferredTime || null,
          additionalNote: validatedData.additionalNote || null,
          area: validatedData.area || user.address || '',
          referrer: defaultReferralCode, // 기본추천인코드 사용
          status: 'PENDING',
        },
      });
    });

    // 사용자의 파트너 상태를 PARTNER_APPLIED로 변경
    await safePrismaQuery(async () => {
      return await prisma.user.update({
        where: { id: userId },
        data: { 
          partnerStatus: 'PARTNER_APPLIED',
          updatedAt: new Date()
        },
      });
    });

    // 활동 로그 생성
    try {
      await safePrismaQuery(async () => {
        return await prisma.activityLog.create({
          data: {
            userId: userId,
            type: 'PARTNER_APPLICATION',
            title: '파트너신청',
            description: '파트너신청 완료',
            metadata: JSON.stringify({
              applicationId: partnerApplication.id,
              area: validatedData.area,
              availableDate: validatedData.availableDate,
              availableTime: validatedData.availableTime,
            }),
          },
        });
      });
    } catch (logError) {
      console.warn('파트너신청 API: 활동 로그 생성 실패', logError);
    }

    return NextResponse.json({
      success: true,
      message: "파트너신청이 완료되었습니다.",
      application: {
        id: partnerApplication.id,
        availableDate: partnerApplication.availableDate,
        availableTime: partnerApplication.availableTime,
        status: partnerApplication.status,
        createdAt: partnerApplication.createdAt,
      },
    });
  } catch (error) {
    console.error('파트너신청 API 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: "파트너신청에 실패했습니다." 
      },
      { status: 500 }
    );
  }
}
