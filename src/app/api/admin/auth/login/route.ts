import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

console.log('🔍 Prisma 객체 확인:', prisma);
console.log('🔍 Prisma.admin 확인:', prisma?.admin);

// 관리자 세션 토큰 생성 함수
function createAdminSessionToken(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

// 관리자 세션 토큰 디코딩 함수
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
    console.log('🔍 관리자 로그인 API 호출됨');
    const { phone, password } = await request.json();
    console.log('📱 전화번호:', phone);
    console.log('🔑 비밀번호 길이:', password?.length);

    if (!phone || !password) {
      console.log('❌ 필수 필드 누락');
      return NextResponse.json({ error: '전화번호와 비밀번호가 필요합니다.' }, { status: 400 });
    }

    // 전화번호 8자리 추출 (뒤 8자리)
    let phoneSuffix = '';
    if (phone.length === 8) {
      phoneSuffix = phone;
    } else {
      // 하이픈 제거 후 뒤 8자리 추출
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      phoneSuffix = cleanPhone.slice(-8);
    }
    
    console.log('📱 입력된 전화번호:', phone);
    console.log('🔢 추출된 8자리:', phoneSuffix);

    // Admin 테이블에서 관리자 조회 (뒤 8자리로 매칭)
    console.log('🔍 데이터베이스에서 관리자 조회 중...');
    
    // 모든 관리자 조회 후 뒤 8자리로 매칭
    const allAdmins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        passwordHash: true,
        isOnline: true,
        lastLoginAt: true,
        loginCount: true
      }
    });
    
    // 뒤 8자리로 매칭되는 관리자 찾기
    const admin = allAdmins.find(admin => {
      const cleanPhone = admin.phone.replace(/[^0-9]/g, '');
      return cleanPhone.endsWith(phoneSuffix);
    });
    
    console.log('📊 관리자 조회 결과:', admin ? '관리자 발견' : '관리자 없음');
    console.log('👤 조회된 관리자:', admin ? '발견됨' : '없음');
    if (admin) {
      console.log('📋 관리자 정보:', { id: admin.id, name: admin.name, role: admin.role, status: admin.status });
    }

    if (!admin) {
      console.log('❌ 관리자 계정 없음');
      return NextResponse.json({ error: '존재하지 않는 관리자 계정입니다.' }, { status: 404 });
    }

    // 비밀번호 확인
    console.log('🔐 비밀번호 확인 중...');
    const passwordMatch = await bcrypt.compare(password, admin.passwordHash);
    console.log('🔐 비밀번호 일치:', passwordMatch);
    if (!passwordMatch) {
      console.log('❌ 비밀번호 불일치');
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 상태 확인
    if (admin.status !== 'ACTIVE') {
      return NextResponse.json({ error: '비활성화된 관리자 계정입니다.' }, { status: 403 });
    }

    // 세션 ID 생성
    const sessionId = `admin_session_${admin.id}_${Date.now()}`;
    const now = new Date();

    // 로그인 시간 및 접속 상태 업데이트
    await prisma.admin.update({
      where: { id: admin.id },
      data: {
        lastLoginAt: now,
        isOnline: true,
        currentSessionId: sessionId,
        lastActivityAt: now,
        loginCount: { increment: 1 }
      }
    });

    // 관리자 로그인 로그 기록
    console.log('🔍 로그인 로그 생성 시도:', {
      userId: admin.id,
      email: admin.email,
      name: admin.name,
      sessionId: sessionId,
      loginAt: now
    });
    
    const logResult = await prisma.adminLoginLog.create({
      data: {
        adminId: admin.id,
        email: admin.email,
        name: admin.name,
        action: 'LOGIN',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        sessionId: sessionId,
        loginAt: now
      }
    });
    
    console.log('✅ 로그인 로그 생성 성공:', logResult.id);

    // 세션 토큰 생성
    const token = createAdminSessionToken({
      userId: admin.id,
      role: admin.role,
      isAdmin: true,
      sessionId: sessionId,
      iat: Date.now()
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
        joinDate: admin.joinDate,
        lastLoginAt: admin.lastLoginAt,
        lastLogoutAt: admin.lastLogoutAt,
        isOnline: admin.isOnline,
        lastActivityAt: admin.lastActivityAt,
        createdAt: admin.createdAt
      }
    });

    // 관리자별 고유 쿠키 이름 생성 (단순한 형식으로 변경)
    const cookieName = `adminSession_${admin.id}`;
    const authCookieName = `adminAuthToken_${admin.id}`;
    
    // 기존 세션 쿠키들 정리 (동일한 관리자의 이전 세션들만)
    const allCookies = request.cookies.getAll();
    const existingAdminCookies = allCookies.filter(cookie => 
      cookie.name === cookieName || cookie.name === authCookieName ||
      (cookie.name.startsWith(`adminSession_${admin.id}_`) && cookie.name !== cookieName) ||
      (cookie.name.startsWith(`adminAuthToken_${admin.id}_`) && cookie.name !== authCookieName)
    );
    
    // 기존 쿠키들 삭제 (동일한 관리자의 세션만)
    existingAdminCookies.forEach(cookie => {
      response.cookies.delete(cookie.name);
      console.log(`🗑️ 기존 쿠키 삭제: ${cookie.name}`);
    });
    
    // 관리자 세션 쿠키 설정 (90일 유지)
    const NINETY_DAYS = 60 * 60 * 24 * 90;
    response.cookies.set(cookieName, token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    response.cookies.set(authCookieName, admin.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });
    
    console.log(`✅ 관리자 세션 쿠키 설정: ${cookieName}, ${authCookieName}`);
    console.log(`🔍 동일한 관리자의 이전 세션만 정리됨`);

    return response;
  } catch (error) {
    console.error('❌ 관리자 로그인 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    return NextResponse.json({ 
      error: '로그인 중 오류가 발생했습니다.',
      details: error.message 
    }, { status: 500 });
  }
}
