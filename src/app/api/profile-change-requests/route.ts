import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 세션 토큰 디코딩 함수
function decodeSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// 프로필변경요청 생성
export async function POST(request: NextRequest) {
  try {
    // session 쿠키에서 토큰 가져오기
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 토큰 디코딩
    const tokenData = decodeSessionToken(sessionToken);
    
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    const userId = tokenData.userId;

    const body = await request.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ error: '요청내용을 입력해주세요.' }, { status: 400 });
    }

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 프로필변경요청 생성 및 DB 저장
    const requestData = await prisma.profileChangeRequest.create({
      data: {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        content: content.trim(),
        status: 'PENDING',
      },
      select: {
        id: true,
        userId: true,
        userName: true,
        userPhone: true,
        content: true,
        status: true,
        createdAt: true,
      }
    });

    console.log('프로필변경요청 접수:', requestData);

    return NextResponse.json({ 
      success: true, 
      message: '프로필변경요청이 접수되었습니다.',
      request: requestData
    });

  } catch (error) {
    console.error('프로필변경요청 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}

// 프로필변경요청 목록 조회 (관리자용 + 사용자용)
export async function GET(request: NextRequest) {
  try {
    console.log('API /profile-change-requests - Fetching profile change requests...');

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 100);
    const userId = searchParams.get('userId'); // 사용자별 조회를 위한 파라미터
    const userName = searchParams.get('userName'); // 이름으로 필터링
    const userPhone = searchParams.get('userPhone'); // 전화번호로 필터링

    let where: any = {};

    // 사용자별 조회인 경우 (이름 + 전화번호로 정확히 매칭)
    if (userId && userName && userPhone) {
      where = {
        AND: [
          { userId: userId },
          { userName: userName },
          { userPhone: userPhone }
        ]
      };
    } else if (userId) {
      // userId만 있는 경우 (기존 방식 유지)
      where.userId = userId;
    } else if (q) {
      // 관리자용 검색
      where = {
        OR: [
          { userName: { contains: q } },
          { userPhone: { contains: q } },
          { content: { contains: q } },
        ],
      };
    }

    // DB에서 프로필변경요청 목록 조회
    const requests = await prisma.profileChangeRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        userId: true,
        userName: true,
        userPhone: true,
        content: true,
        status: true,
        processedBy: true,
        processedAt: true,
        createdAt: true,
      }
    });

    console.log('API /profile-change-requests - Found requests:', requests.length);

    return NextResponse.json({ 
      success: true, 
      requests 
    });

  } catch (error) {
    console.error('프로필변경요청 목록 조회 오류:', error);
    return NextResponse.json({ 
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
}