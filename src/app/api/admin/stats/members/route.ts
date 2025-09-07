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

// GET: 총 회원수 조회
export async function GET(request: NextRequest) {
  try {
    // 세션 토큰 확인
    const sessionToken = request.cookies.get('adminSession')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

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

    // 총 회원수 조회
    const totalMembers = await prisma.user.count({
      where: {
        isActive: true
      }
    });

    return NextResponse.json({ count: totalMembers });
  } catch (error) {
    console.error('총 회원수 조회 오류:', error);
    return NextResponse.json({ 
      error: '총 회원수를 불러올 수 없습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

