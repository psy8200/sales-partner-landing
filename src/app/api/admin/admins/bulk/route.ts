import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 관리자 일괄 삭제
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔍 관리자 일괄 삭제 요청 처리 중...');
    
    // 세션 토큰 확인 (모든 adminSession 쿠키 확인)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    let adminSession = null;
    if (adminSessionCookies.length > 0) {
      // 가장 최근 쿠키 사용 (보통 마지막에 설정된 것)
      adminSession = adminSessionCookies[adminSessionCookies.length - 1].value;
    }
    if (!adminSession) {
      console.log('❌ 관리자 세션 없음');
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 토큰 디코딩
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(adminSession, 'base64url').toString());
    } catch (error) {
      console.log('❌ 토큰 디코딩 실패:', error);
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    // 현재 관리자 확인 (Admin 테이블에서)
    const currentAdmin = await prisma.admin.findUnique({
      where: { id: tokenData.userId },
      select: { id: true, role: true, status: true }
    });

    if (!currentAdmin) {
      console.log('❌ 현재 관리자를 찾을 수 없음');
      return NextResponse.json({ error: '관리자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 최고관리자 권한 확인
    const isSuperAdmin = currentAdmin.role === 'SUPER_ADMIN';
    if (!isSuperAdmin) {
      console.log('❌ 최고관리자 권한 없음');
      return NextResponse.json({ error: '최고관리자 권한이 필요합니다.' }, { status: 403 });
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { adminIds } = body;

    if (!adminIds || !Array.isArray(adminIds) || adminIds.length === 0) {
      return NextResponse.json({ error: '삭제할 관리자 ID가 필요합니다.' }, { status: 400 });
    }

    console.log('📤 삭제할 관리자 ID들:', adminIds);

    // 먼저 관련된 AdminLoginLog 삭제
    await prisma.adminLoginLog.deleteMany({
      where: {
        adminId: {
          in: adminIds
        }
      }
    });

    // 관리자 삭제
    const deleteResult = await prisma.admin.deleteMany({
      where: {
        id: {
          in: adminIds
        }
      }
    });

    console.log('✅ 삭제 완료:', deleteResult.count, '명');

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count}명의 관리자가 삭제되었습니다.`,
      deletedCount: deleteResult.count
    });

  } catch (error) {
    console.error('❌ 관리자 일괄 삭제 오류:', error);
    return NextResponse.json({ 
      error: '관리자 삭제 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}
