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

// POST: 세션 스토리지 기반 관리자 로그아웃
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 세션 스토리지 기반 관리자 로그아웃 시작');
    
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: '인증 토큰이 필요합니다.' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // "Bearer " 제거
    console.log('🔍 토큰:', token ? '존재' : '없음');

    // 토큰 디코딩
    const tokenData = decodeAdminSessionToken(token);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: '유효하지 않은 토큰입니다.' },
        { status: 401 }
      );
    }

    console.log('🔍 토큰 데이터:', tokenData);

    const adminId = tokenData.userId;
    const now = new Date();

    // 관리자 로그아웃 상태 업데이트
    await prisma.admin.update({
      where: { id: adminId },
      data: {
        lastLogoutAt: now,
        isOnline: false,
        currentSessionId: null
      }
    });

    // 로그아웃 로그 기록
    const existingLog = await prisma.adminLoginLog.findFirst({
      where: {
        adminId: adminId,
        sessionId: tokenData.sessionId,
        logoutAt: null
      },
      orderBy: { loginAt: 'desc' }
    });

    if (existingLog) {
      const loginTime = existingLog.loginAt;
      const duration = now.getTime() - loginTime.getTime();
      
      await prisma.adminLoginLog.update({
        where: { id: existingLog.id },
        data: {
          action: 'LOGOUT',
          logoutAt: now,
          duration: Math.floor(duration / 1000) // 초 단위
        }
      });
      
      console.log(`✅ 로그아웃 로그 업데이트 완료: ${existingLog.id}`);
    } else {
      // 로그인 로그가 없는 경우 새로 생성
      const admin = await prisma.admin.findUnique({
        where: { id: adminId },
        select: { name: true, email: true }
      });

      if (admin) {
        await prisma.adminLoginLog.create({
          data: {
            adminId: adminId,
            email: admin.email,
            name: admin.name,
            action: 'LOGOUT',
            ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown',
            sessionId: tokenData.sessionId,
            loginAt: now, // 로그아웃 시점을 로그인 시점으로 설정
            logoutAt: now,
            duration: 0
          }
        });
        
        console.log(`✅ 로그아웃 로그 생성 완료`);
      }
    }

    console.log(`✅ 세션 스토리지 기반 로그아웃 성공: ${adminId}`);

    return NextResponse.json({
      success: true,
      message: '로그아웃되었습니다.'
    });
  } catch (error) {
    console.error('세션 스토리지 기반 관리자 로그아웃 오류:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}







