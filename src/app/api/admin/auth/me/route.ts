import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    // 모든 관리자 세션 쿠키 찾기 (단순한 형식: adminSession_${adminId})
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    // 현재 요청의 Referer 헤더에서 세션 식별
    const referer = request.headers.get('referer') || '';
    const currentWindowId = request.headers.get('x-window-id') || 'default';
    
    // 가장 최근 세션 사용 (마지막 쿠키)
    const latestCookie = adminSessionCookies[adminSessionCookies.length - 1];
    const sessionToken = latestCookie.value;
    
    console.log(`🔍 사용 중인 관리자 세션: ${latestCookie.name}`);
    console.log(`🔍 현재 창 ID: ${currentWindowId}`);
    console.log(`🔍 Referer: ${referer}`);
    console.log(`🔍 전체 세션 쿠키들:`, adminSessionCookies.map(c => c.name));

    // 토큰 디코딩
    const tokenData = decodeAdminSessionToken(sessionToken);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (!tokenData.isAdmin && tokenData.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    // 개발 환경에서만 작동
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return NextResponse.json(
        { error: '개발 환경에서만 사용 가능합니다.' },
        { status: 403 }
      );
    }

    // 토큰에서 관리자 ID 가져오기
    const adminId = tokenData.userId;
    
    // Admin 테이블에서 관리자 정보 조회
    const adminUser = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        joinDate: true,
        lastLoginAt: true,
        lastLogoutAt: true,
        isOnline: true,
        lastActivityAt: true,
        createdAt: true,
      }
    });

    // 접속 상태 업데이트 (활성 세션이 있으면 온라인으로 표시)
    if (adminUser) {
      await prisma.admin.update({
        where: { id: adminUser.id },
        data: {
          lastActivityAt: new Date(),
          isOnline: true
        }
      });
    }

    if (!adminUser) {
      return NextResponse.json(
        { error: '관리자 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

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

    // 현재 세션 쿠키 이름으로 자동 연장 (기존 쿠키 이름 유지)
    const cookieName = latestCookie.name;
    const authCookieName = cookieName.replace('adminSession_', 'adminAuthToken_');
    
    response.cookies.set(cookieName, newToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    response.cookies.set(authCookieName, adminUser.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });
    
    console.log(`✅ 관리자 세션 자동 연장: ${cookieName}`);

    return response;
  } catch (error) {
    console.error('어드민 사용자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '어드민 사용자 정보를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
