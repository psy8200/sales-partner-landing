import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ActivityLogger } from '@/lib/activityLogger';
import { createSuccessResponse, createErrorResponse, createBadRequestResponse } from '@/lib/apiResponse';

// 회원가입 데이터 검증 스키마
const signupSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  email: z.string().email('올바른 이메일 주소를 입력해주세요.'),
  phone: z.string().min(10, '올바른 전화번호를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(), // 추천인코드 (선택)
  agreeTerms: z.boolean().refine(val => val === true, {
    message: "이용약관에 동의해주세요.",
  }),
  marketingAgreed: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 데이터 검증
    const validatedData = signupSchema.parse(body);
    
    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return createBadRequestResponse('이미 등록된 이메일입니다.');
    }
    
    // 전화번호 중복 확인
    const existingPhone = await prisma.user.findUnique({
      where: { phone: validatedData.phone },
    });
    
    if (existingPhone) {
      return createBadRequestResponse('이미 등록된 전화번호입니다.');
    }
    
    // 이름 + 전화번호 조합 중복 확인
    const existingNamePhone = await prisma.user.findFirst({
      where: { 
        name: validatedData.name,
        phone: validatedData.phone 
      },
    });
    
    if (existingNamePhone) {
      return createBadRequestResponse('이미 등록된 이름과 전화번호 조합입니다.');
    }
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    // 추천인코드 처리: 입력하지 않았으면 기본추천인코드 사용
    let finalReferralCode = validatedData.referralCode;
    if (!finalReferralCode || finalReferralCode.trim() === '') {
      // 회사정보 API를 통해 기본추천인코드 가져오기
      console.log('🔍 회원가입: 회사정보 API 호출 시작...');
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const companyInfoResponse = await fetch(`${baseUrl}/api/admin/company-info`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (companyInfoResponse.ok) {
          const companyInfoData = await companyInfoResponse.json();
          console.log('🔍 회원가입: 회사정보 API 응답:', companyInfoData);
          
          if (companyInfoData.success && companyInfoData.companyInfo && companyInfoData.companyInfo.referralCodeDefault) {
            finalReferralCode = companyInfoData.companyInfo.referralCodeDefault;
            console.log('✅ 기본추천인코드 적용:', finalReferralCode);
          } else {
            console.log('⚠️ 회사정보 API에서 기본추천인코드 없음, 빈 값으로 저장');
            finalReferralCode = null;
          }
        } else {
          console.log('⚠️ 회사정보 API 호출 실패, 빈 값으로 저장');
          finalReferralCode = null;
        }
      } catch (error) {
        console.error('❌ 회사정보 API 호출 중 오류:', error);
        finalReferralCode = null;
      }
    } else {
      console.log('✅ 사용자 입력 추천인코드 사용:', finalReferralCode);
    }
    
    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        passwordHash: hashedPassword,
        agreeTerms: validatedData.agreeTerms,
        agreeTermsAt: validatedData.agreeTerms ? new Date() : null,
        marketingAgreed: validatedData.marketingAgreed,
        marketingAgreedAt: validatedData.marketingAgreed ? new Date() : null,
        role: 'GENERAL',
        status: 'ACTIVE',
        partnerStatus: 'NOT_APPLIED',
        referralCode: finalReferralCode, // 최종 추천인코드 처리
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        partnerStatus: true,
        createdAt: true,
      },
    });
    
    // 활동 로그 생성
    await ActivityLogger.logUserRegistration(user.id, user.name);
    
    // 사용자 로그 기록
    await prisma.userLog.create({
      data: {
        userId: user.id,
        action: 'SIGNUP',
        category: 'AUTH',
        description: '회원가입 완료 (예비파트너)',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      },
    });
    
    // 알림 생성
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'SYSTEM',
        title: '회원가입 완료',
        message: '회원가입이 완료되었습니다. 파트너 등록을 진행하실 수 있습니다.',
      },
    });
    
    return createSuccessResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        status: user.status,
        role: user.role,
        partnerStatus: user.partnerStatus,
      },
    }, '회원가입이 완료되었습니다.');
    
  } catch (error) {
    console.error('회원가입 오류:', error);
    
    if (error instanceof z.ZodError) {
      return createBadRequestResponse('입력 데이터가 올바르지 않습니다.');
    }
    
    return createErrorResponse('회원가입 중 오류가 발생했습니다.');
  }
}
