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

// GET: 총 계약건수 조회
export async function GET(request: NextRequest) {
  try {
    // 세션 토큰 확인 (모든 adminSession 쿠키 확인)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    let sessionToken = null;
    if (adminSessionCookies.length > 0) {
      // 가장 최근 쿠키 사용 (보통 마지막에 설정된 것)
      sessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;
    }
    
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

    // 총 계약건수 조회 (완료된 계약)
    const totalContracts = await prisma.contract.count({
      where: {
        status: {
          in: ['ACTIVE', 'CONFIRMED', 'COMPLETED']
        }
      }
    });

    return NextResponse.json({ count: totalContracts });
  } catch (error) {
    console.error('총 계약건수 조회 오류:', error);
    return NextResponse.json({ 
      error: '총 계약건수를 불러올 수 없습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}


