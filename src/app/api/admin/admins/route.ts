import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// 관리자 세션 토큰 디코딩 함수
function decodeAdminSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// GET: 관리자 목록 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/admins 시작');
    
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

    console.log('🔍 currentAdmin:', currentAdmin);
    if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '최고관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 관리자 목록 조회
    const admins = await prisma.admin.findMany({
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
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('관리자 목록 조회 오류:', error);
    return NextResponse.json({ error: '관리자 목록을 불러올 수 없습니다.' }, { status: 500 });
  }
}

// POST: 새 관리자 생성
export async function POST(request: NextRequest) {
  try {
    // 다중 세션 지원: adminSession_* 쿠키들 중 가장 최근 것 찾기 (새로운 형식)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_') && cookie.name.includes('_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 가장 최근 세션 사용 (타임스탬프가 가장 큰 쿠키)
    const latestCookie = adminSessionCookies.reduce((latest, current) => {
      const latestTimestamp = parseInt(latest.name.split('_').pop() || '0');
      const currentTimestamp = parseInt(current.name.split('_').pop() || '0');
      return currentTimestamp > latestTimestamp ? current : latest;
    });
    
    const sessionToken = latestCookie.value;
    
    const tokenData = decodeAdminSessionToken(sessionToken);
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

    const { name, email, phone, password, role, joinDate } = await request.json();
    
    console.log('🔍 관리자 생성 요청 데이터:');
    console.log('   이름:', name);
    console.log('   이메일:', email);
    console.log('   전화번호:', phone);
    console.log('   비밀번호 길이:', password?.length);
    console.log('   비밀번호 값:', password ? '***' : '없음');
    console.log('   역할:', role);
    console.log('   입사일:', joinDate);

    // 필수 필드 검증
    if (!name || !email || !phone || !password || !role || !joinDate) {
      console.log('❌ 필수 필드 누락:', { name: !!name, email: !!email, phone: !!phone, password: !!password, role: !!role, joinDate: !!joinDate });
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      console.log('❌ 비밀번호 길이 부족:', password.length);
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingEmail = await prisma.admin.findUnique({
      where: { email }
    });
    if (existingEmail) {
      return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
    }

    // 전화번호 중복 확인
    const existingPhone = await prisma.admin.findUnique({
      where: { phone }
    });
    if (existingPhone) {
      return NextResponse.json({ error: '이미 사용 중인 전화번호입니다.' }, { status: 409 });
    }

    // 비밀번호 해시화
    console.log('🔐 비밀번호 해시화 시작...');
    const passwordHash = await bcrypt.hash(password, 12);
    console.log('✅ 비밀번호 해시화 완료');

    // 새 관리자 생성
    console.log('👤 새 관리자 생성 시작...');
    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
        status: 'ACTIVE',
        joinDate: new Date(joinDate)
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        joinDate: true,
        createdAt: true
      }
    });
    console.log('✅ 새 관리자 생성 완료:', newAdmin.id);

    return NextResponse.json({ 
      success: true, 
      admin: newAdmin,
      message: '관리자가 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    console.error('관리자 생성 오류:', error);
    return NextResponse.json({ error: '관리자 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
