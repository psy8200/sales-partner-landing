import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // 개발 환경에서만 작동하는 강제 로그인
    const isDevelopment = process.env.NODE_ENV === 'development';
    console.log('🔍 Force Login - NODE_ENV:', process.env.NODE_ENV, 'isDevelopment:', isDevelopment);
    
    // 개발 환경 체크를 더 유연하게
    const isDevMode = isDevelopment || !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
    
    if (!isDevMode) {
      console.log('❌ Production mode - force login disabled');
      return NextResponse.json(
        { error: '개발 환경에서만 사용 가능합니다.' },
        { status: 403 }
      );
    }

    console.log('✅ Development mode - force login enabled');

    // 어드민 강제 로그인 정보
    const adminUser = {
      id: 'admin-dev-001',
      name: '개발자 어드민',
      email: 'admin@dev.local',
      phone: '010-0000-0000',
      role: 'ADMIN',
      partnerStatus: 'APPROVED',
      points: 0,
      level: 'SP',
      bankName: '개발은행',
      bankAccount: '000-000000-000000',
      accountHolder: '개발자',
      settlementCycle: '월말',
      createdAt: new Date().toISOString(),
      status: 'ACTIVE',
      isActive: true,
    };

    // 어드민 전용 세션 토큰 생성
    const adminToken = Buffer.from(JSON.stringify({
      userId: adminUser.id,
      role: adminUser.role,
      isAdmin: true,
      iat: Date.now()
    })).toString('base64url');

    console.log('🔑 Admin token generated:', adminToken);

    // 어드민 전용 쿠키 설정 (회원 쿠키와 분리)
    const response = NextResponse.json({
      success: true,
      user: adminUser,
      message: '어드민 강제 로그인 완료'
    });

    // 어드민 전용 세션 쿠키 (전체 도메인에서 접근 가능)
    response.cookies.set('adminSession', adminToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90일
      expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000),
    });

    // 어드민 전용 인증 토큰 (전체 도메인에서 접근 가능)
    response.cookies.set('adminAuthToken', adminUser.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90일
      expires: new Date(Date.now() + 60 * 60 * 24 * 90 * 1000),
    });

    console.log('🍪 Admin cookies set successfully');
    return response;
  } catch (error) {
    console.error('❌ 어드민 강제 로그인 오류:', error);
    return NextResponse.json(
      { error: '어드민 강제 로그인에 실패했습니다.' },
      { status: 500 }
    );
  }
}
