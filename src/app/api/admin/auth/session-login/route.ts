import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// 관리자 세션 토큰 생성 함수
function createAdminSessionToken(data: any) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

// POST: 세션 스토리지 기반 관리자 로그인
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 세션 스토리지 기반 관리자 로그인 시작');
    
    const { phone, password } = await request.json();
    
    console.log('🔍 로그인 시도:', { phone: phone ? '***' : '없음', password: password ? '***' : '없음' });

    // 필수 필드 검증
    if (!phone || !password) {
      return NextResponse.json({ error: '전화번호와 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    // 전화번호 정규화 (하이픈 제거 후 뒤 8자리 추출)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const phoneSuffix = cleanPhone.slice(-8);
    
    console.log('🔍 정규화된 전화번호:', { cleanPhone, phoneSuffix });

    // 관리자 계정 찾기 (뒤 8자리로 매칭)
    const allAdmins = await prisma.admin.findMany();
    const admin = allAdmins.find(admin => {
      const adminCleanPhone = admin.phone.replace(/[^0-9]/g, '');
      return adminCleanPhone.endsWith(phoneSuffix);
    });

    console.log('🔍 찾은 관리자:', admin ? `${admin.name} (${admin.role})` : '없음');

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
      adminId: admin.id,
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

    // 세션 스토리지용 응답 (쿠키 설정 없음)
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
      },
      sessionToken: token
    });
    
    console.log(`✅ 세션 스토리지 기반 로그인 성공: ${admin.name} (${admin.role})`);

    return response;
  } catch (error) {
    console.error('❌ 세션 스토리지 기반 관리자 로그인 오류:', error);
    console.error('❌ 오류 스택:', error.stack);
    return NextResponse.json({ 
      error: '로그인 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

