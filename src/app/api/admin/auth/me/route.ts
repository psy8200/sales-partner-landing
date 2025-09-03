import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 어드민 세션 토큰 디코딩 함수
function decodeAdminSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // 어드민 전용 세션 쿠키에서 토큰 가져오기
    const adminSessionToken = request.cookies.get('adminSession')?.value;
    
    if (!adminSessionToken) {
      return NextResponse.json(
        { error: '어드민 로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 토큰 디코딩
    const tokenData = decodeAdminSessionToken(adminSessionToken);
    if (!tokenData || !tokenData.userId || !tokenData.isAdmin) {
      return NextResponse.json(
        { error: '유효하지 않은 어드민 세션입니다.' },
        { status: 401 }
      );
    }

    // 개발 환경에서만 작동하는 강제 로그인
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: '개발 환경에서만 사용 가능합니다.' },
        { status: 403 }
      );
    }

    // 어드민 사용자 정보 (개발용)
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

    // 세션 자동 연장
    const NINETY_DAYS = 60 * 60 * 24 * 90;
    const newToken = Buffer.from(JSON.stringify({
      userId: adminUser.id,
      role: adminUser.role,
      isAdmin: true,
      iat: Date.now()
    })).toString('base64url');

    const response = NextResponse.json({
      user: adminUser,
    });

    // 어드민 세션 쿠키 자동 연장 (전체 도메인에서 접근 가능)
    response.cookies.set('adminSession', newToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    // 어드민 인증 토큰도 동일하게 연장 (전체 도메인에서 접근 가능)
    response.cookies.set('adminAuthToken', adminUser.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    return response;
  } catch (error) {
    console.error('어드민 사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '어드민 사용자 정보를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
