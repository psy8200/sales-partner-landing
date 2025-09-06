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

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 로그아웃 API 호출됨');
    
    // 모든 관리자 세션 쿠키 찾기
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    console.log(`🔍 발견된 관리자 세션 쿠키: ${adminSessionCookies.length}개`);
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({
        success: true,
        message: '로그인된 관리자 세션이 없습니다.'
      });
    }
    
    // 가장 최근에 로그인한 세션 사용 (마지막 쿠키)
    const latestCookie = adminSessionCookies[adminSessionCookies.length - 1];
    const adminSessionToken = latestCookie.value;
    const cookieName = latestCookie.name;
    
    console.log(`🔍 로그아웃할 세션: ${cookieName}`);
    
    if (adminSessionToken) {
      const tokenData = decodeAdminSessionToken(adminSessionToken);
      if (tokenData && tokenData.userId) {
        const now = new Date();
        
        // 관리자 접속 상태 업데이트
        await prisma.admin.update({
          where: { id: tokenData.userId },
          data: {
            lastLogoutAt: now,
            isOnline: false,
            currentSessionId: null
          }
        });

        // 관리자 로그아웃 로그 기록
        const admin = await prisma.admin.findUnique({
          where: { id: tokenData.userId },
          select: { email: true, name: true, role: true }
        });

        if (admin) {
          // 현재 세션의 로그인 로그 찾기
          const loginLog = await prisma.adminLoginLog.findFirst({
            where: {
              adminId: tokenData.userId,
              sessionId: tokenData.sessionId,
              action: 'LOGIN',
              logoutAt: null
            },
            orderBy: { loginAt: 'desc' }
          });

          if (loginLog) {
            // 로그인 지속 시간 계산
            const duration = Math.floor((now.getTime() - loginLog.loginAt.getTime()) / 1000);
            
            // 로그아웃 로그 업데이트
            await prisma.adminLoginLog.update({
              where: { id: loginLog.id },
              data: {
                logoutAt: now,
                duration: duration
              }
            });
          }

          // 새로운 로그아웃 로그 생성
          await prisma.adminLoginLog.create({
            data: {
              adminId: tokenData.userId,
              email: admin.email,
              name: admin.name,
              action: 'LOGOUT',
              ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
              userAgent: request.headers.get('user-agent') || 'unknown',
              sessionId: tokenData.sessionId,
              loginAt: now,
              logoutAt: now,
              duration: 0
            }
          });
        }
      }
    }

    console.log('✅ 로그아웃 처리 완료');
    
    const response = NextResponse.json({
      success: true,
      message: '어드민 로그아웃 완료'
    });

    // 특정 관리자 쿠키만 삭제
    const adminId = cookieName.replace('adminSession_', '');
    const authCookieName = `adminAuthToken_${adminId}`;
    
    response.cookies.delete(cookieName);
    response.cookies.delete(authCookieName);
    
    console.log(`✅ 삭제된 쿠키: ${cookieName}, ${authCookieName}`);

    return response;
  } catch (error) {
    console.error('어드민 로그아웃 오류:', error);
    return NextResponse.json(
      { error: '어드민 로그아웃에 실패했습니다.' },
      { status: 500 }
    );
  }
}
