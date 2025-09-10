import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: 담당자 목록 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/managers 시작');

    // 관리자 인증 확인
    const adminSessionCookies = request.cookies.getAll().filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    console.log('🔍 adminSession 쿠키들:', adminSessionCookies.map(c => c.name));

    if (adminSessionCookies.length === 0) {
      console.log('❌ 관리자 세션 쿠키 없음');
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 가장 최근 세션 토큰 사용
    const sessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;
    console.log('🔍 사용할 sessionToken:', sessionToken ? '존재' : '없음');

    if (!sessionToken) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 토큰 검증
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64url').toString('utf-8');
      tokenData = JSON.parse(decoded);
      console.log('🔍 tokenData:', tokenData);
    } catch (error) {
      console.log('❌ 토큰 디코딩 실패:', error);
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, role: true }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: '관리자 정보를 찾을 수 없습니다.' }, { status: 401 });
    }

    console.log('🔍 currentAdmin:', currentAdmin);

    // 담당자 목록 조회
    const managers = await prisma.manager.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    console.log('✅ 담당자 목록 조회 완료:', managers.length, '건');

    return NextResponse.json({
      success: true,
      data: managers
    });

  } catch (error) {
    console.error('❌ 담당자 목록 조회 오류:', error);
    return NextResponse.json({ 
      error: '담당자 목록을 불러오는 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// POST: 새 담당자 생성
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/admin/managers 시작');

    // 관리자 인증 확인
    const adminSessionCookies = request.cookies.getAll().filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;

    if (!sessionToken) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 토큰 검증
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64url').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, role: true }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: '관리자 정보를 찾을 수 없습니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { department, name, joinDate } = body;

    // 필수 필드 검증
    if (!department || !name || !joinDate) {
      return NextResponse.json({ 
        error: '담당자소속, 담당자이름, 가입일을 모두 입력해주세요.' 
      }, { status: 400 });
    }

    // 새 담당자 생성
    const newManager = await prisma.manager.create({
      data: {
        department: department.trim(),
        name: name.trim(),
        joinDate: new Date(joinDate)
      }
    });

    console.log('✅ 새 담당자 생성 완료:', newManager.id);

    return NextResponse.json({
      success: true,
      data: newManager
    });

  } catch (error) {
    console.error('❌ 담당자 생성 오류:', error);
    return NextResponse.json({ 
      error: '담당자 생성 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// PUT: 담당자 수정
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 PUT /api/admin/managers 시작');

    // 관리자 인증 확인
    const adminSessionCookies = request.cookies.getAll().filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;

    if (!sessionToken) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 토큰 검증
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64url').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, role: true }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: '관리자 정보를 찾을 수 없습니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { id, department, name, joinDate } = body;

    // 필수 필드 검증
    if (!id || !department || !name || !joinDate) {
      return NextResponse.json({ 
        error: 'ID, 담당자소속, 담당자이름, 가입일을 모두 입력해주세요.' 
      }, { status: 400 });
    }

    // 담당자 수정
    const updatedManager = await prisma.manager.update({
      where: { id },
      data: {
        department: department.trim(),
        name: name.trim(),
        joinDate: new Date(joinDate)
      }
    });

    console.log('✅ 담당자 수정 완료:', updatedManager.id);

    return NextResponse.json({
      success: true,
      data: updatedManager
    });

  } catch (error) {
    console.error('❌ 담당자 수정 오류:', error);
    return NextResponse.json({ 
      error: '담당자 수정 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// DELETE: 담당자 삭제 (소프트 삭제)
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 DELETE /api/admin/managers 시작');

    // 관리자 인증 확인
    const adminSessionCookies = request.cookies.getAll().filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    if (adminSessionCookies.length === 0) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const sessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;

    if (!sessionToken) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 토큰 검증
    let tokenData;
    try {
      const decoded = Buffer.from(sessionToken, 'base64url').toString('utf-8');
      tokenData = JSON.parse(decoded);
    } catch (error) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 });
    }

    // 관리자 권한 확인
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, role: true }
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: '관리자 정보를 찾을 수 없습니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        error: '삭제할 담당자 ID가 필요합니다.' 
      }, { status: 400 });
    }

    // 담당자 소프트 삭제 (isActive를 false로 변경)
    const deletedManager = await prisma.manager.update({
      where: { id },
      data: { isActive: false }
    });

    console.log('✅ 담당자 삭제 완료:', deletedManager.id);

    return NextResponse.json({
      success: true,
      data: deletedManager
    });

  } catch (error) {
    console.error('❌ 담당자 삭제 오류:', error);
    return NextResponse.json({ 
      error: '담당자 삭제 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}


