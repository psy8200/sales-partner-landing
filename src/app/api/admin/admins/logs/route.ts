import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 관리자 세션 토큰 디코딩 함수
function decodeAdminSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// GET: 관리자 접속 로그 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/admins/logs 시작');
    
    // 다중 세션 지원: adminSession_* 쿠키들 중 가장 최근 것 찾기 (단순한 형식)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    console.log('🔍 adminSession 쿠키들:', adminSessionCookies.map(c => c.name));
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 가장 최근 세션 사용 (마지막 쿠키)
    const latestCookie = adminSessionCookies[adminSessionCookies.length - 1];
    const sessionToken = latestCookie.value;
    console.log('🔍 사용할 sessionToken:', latestCookie.name, sessionToken ? '존재' : '없음');
    
    const tokenData = decodeAdminSessionToken(sessionToken);
    console.log('🔍 tokenData:', tokenData);
    
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 최고관리자 권한 확인 (Admin 테이블에서 확인)
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { role: true }
    });

    if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '최고관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 접속 로그 조회
    const logs = await prisma.adminLoginLog.findMany({
      select: {
        id: true,
        adminId: true,
        email: true,
        name: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        sessionId: true,
        loginAt: true,
        logoutAt: true,
        duration: true
      },
      orderBy: { loginAt: 'desc' }
    });

    console.log('✅ 접속 로그 조회 완료:', logs.length, '건');

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('❌ 접속 로그 조회 오류:', error);
    return NextResponse.json({ 
      error: '접속 로그를 불러올 수 없습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
