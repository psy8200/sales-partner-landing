import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 어드민 세션 확인
    const adminSessionToken = request.cookies.get('adminSession')?.value;
    
    if (!adminSessionToken) {
      return NextResponse.json({ error: '어드민 로그인이 필요합니다.' }, { status: 401 });
    }

    // 토큰 디코딩
    function decodeAdminSessionToken(token: string) {
      try {
        const decoded = Buffer.from(token, 'base64url').toString();
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }

    const tokenData = decodeAdminSessionToken(adminSessionToken);
    if (!tokenData || !tokenData.userId || !tokenData.isAdmin) {
      return NextResponse.json({ error: '유효하지 않은 어드민 세션입니다.' }, { status: 401 });
    }

    // 추천인코드 옵션 가져오기 (null이 아닌 값들만)
    const referralCodeOptions = await prisma.user.findMany({
      select: {
        referralCode: true
      },
      where: {
        referralCode: {
          not: null
        }
      },
      distinct: ['referralCode']
    });

    return NextResponse.json({
      referralCodes: referralCodeOptions.map(item => ({
        value: item.referralCode || '',
        label: item.referralCode || ''
      }))
    });

  } catch (error) {
    console.error('필터 옵션 조회 오류:', error);
    return NextResponse.json({ 
      error: '필터 옵션을 불러올 수 없습니다.',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
