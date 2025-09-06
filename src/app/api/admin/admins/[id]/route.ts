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

// GET: 특정 관리자 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 GET /api/admin/admins/[id] 시작');
    
    // 다중 세션 지원: adminSession_* 쿠키들 중 가장 최근 것 찾기 (단순한 형식)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 가장 최근 세션 사용 (마지막 쿠키)
    const latestCookie = adminSessionCookies[adminSessionCookies.length - 1];
    const sessionToken = latestCookie.value;
    
    const tokenData = decodeAdminSessionToken(sessionToken);
    
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { role: true }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 특정 관리자 정보 조회
    const admin = await prisma.admin.findUnique({
      where: { id: params.id },
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
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('관리자 정보 조회 오류:', error);
    return NextResponse.json({ 
      error: '관리자 정보를 불러올 수 없습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// PUT: 관리자 정보 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 PUT /api/admin/admins/[id] 시작');
    
    // 다중 세션 지원: adminSession_* 쿠키들 중 가장 최근 것 찾기 (단순한 형식)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 가장 최근 세션 사용 (마지막 쿠키)
    const latestCookie = adminSessionCookies[adminSessionCookies.length - 1];
    const sessionToken = latestCookie.value;
    
    const tokenData = decodeAdminSessionToken(sessionToken);
    
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 최고관리자 권한 확인
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { role: true }
    });

    if (!currentAdmin || currentAdmin.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '최고관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { name, email, phone, password, role, status, joinDate } = await request.json();
    
    console.log('🔍 관리자 수정 요청 데이터:');
    console.log('   ID:', params.id);
    console.log('   이름:', name);
    console.log('   이메일:', email);
    console.log('   전화번호:', phone);
    console.log('   비밀번호 변경:', password ? '예' : '아니오');
    console.log('   역할:', role);
    console.log('   상태:', status);
    console.log('   입사일:', joinDate);

    // 필수 필드 검증
    if (!name || !email || !phone || !role || !status || !joinDate) {
      console.log('❌ 필수 필드 누락');
      return NextResponse.json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
    }

    // 비밀번호가 제공된 경우 길이 검증
    if (password && password.length < 6) {
      console.log('❌ 비밀번호 길이 부족:', password.length);
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 });
    }

    // 기존 관리자 확인
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: params.id }
    });

    if (!existingAdmin) {
      return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 이메일 중복 확인 (자신 제외)
    if (email !== existingAdmin.email) {
      const existingEmail = await prisma.admin.findUnique({
        where: { email }
      });
      if (existingEmail) {
        return NextResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 409 });
      }
    }

    // 전화번호 중복 확인 (자신 제외)
    if (phone !== existingAdmin.phone) {
      const existingPhone = await prisma.admin.findUnique({
        where: { phone }
      });
      if (existingPhone) {
        return NextResponse.json({ error: '이미 사용 중인 전화번호입니다.' }, { status: 409 });
      }
    }

    // 업데이트할 데이터 준비
    const updateData: any = {
      name,
      email,
      phone,
      role,
      status,
      joinDate: new Date(joinDate)
    };

    // 비밀번호가 제공된 경우에만 해시화하여 업데이트
    if (password) {
      console.log('🔐 비밀번호 해시화 시작...');
      updateData.passwordHash = await bcrypt.hash(password, 12);
      console.log('✅ 비밀번호 해시화 완료');
    }

    // 관리자 정보 업데이트
    console.log('👤 관리자 정보 업데이트 시작...');
    const updatedAdmin = await prisma.admin.update({
      where: { id: params.id },
      data: updateData,
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
        loginCount: true,
        createdAt: true,
        updatedAt: true
      }
    });
    console.log('✅ 관리자 정보 업데이트 완료:', updatedAdmin.id);

    return NextResponse.json({ 
      success: true, 
      admin: updatedAdmin,
      message: '관리자 정보가 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    console.error('관리자 수정 오류:', error);
    return NextResponse.json({ 
      error: '관리자 수정 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
