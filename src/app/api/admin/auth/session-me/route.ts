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

// GET: 세션 스토리지 기반 관리자 정보 조회
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 세션 스토리지 기반 관리자 정보 조회 시작');
    
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

    // 관리자 권한 확인
    if (!tokenData.isAdmin && tokenData.role !== 'ADMIN' && tokenData.role !== 'SUPER_ADMIN') {
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

    console.log(`✅ 세션 스토리지 기반 관리자 정보 조회 성공: ${adminUser.name} (${adminUser.role})`);

    return NextResponse.json({
      user: adminUser,
    });
  } catch (error) {
    console.error('세션 스토리지 기반 관리자 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '관리자 정보를 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}
