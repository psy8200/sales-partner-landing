import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const phone = searchParams.get('phone');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ members: [], total: 0 });
    }

    // 검색 조건 구성
    const whereCondition: Record<string, unknown> = {
      name: {
        contains: query.trim()
      }
    };

    // 전화번호가 제공된 경우 추가 필터링
    if (phone && phone.trim()) {
      whereCondition.phone = {
        contains: phone.trim()
      };
    }

    // 전체 결과 수 조회 (전화번호 필터링 전)
    const totalCount = await prisma.user.count({
      where: {
        name: {
          contains: query.trim()
        }
      }
    });

    // 이름으로 LIKE 검색 (최대 20개 결과)
    const members = await prisma.user.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        addressDetail: true
      },
      take: 20, // 최대 20개 결과
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      members,
      total: totalCount // 전체 결과 수 반환
    });

  } catch (error) {
    console.error('Member search error:', error);
    return NextResponse.json(
      { error: '회원 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
