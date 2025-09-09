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

    // 파트너신청한 고객들만 검색하도록 수정
    // PartnerApplication과 연결된 User 정보를 검색
    const userWhereCondition: Record<string, unknown> = {
      name: {
        contains: query.trim()
      }
    };

    // 전화번호가 제공된 경우 추가 필터링
    if (phone && phone.trim()) {
      userWhereCondition.phone = {
        contains: phone.trim()
      };
    }

    // 파트너신청한 사용자들만 검색 (User 테이블에서 PartnerApplication이 있는 사용자들)
    const totalCount = await prisma.user.count({
      where: {
        ...userWhereCondition,
        partnerApplications: {
          some: {} // 파트너신청이 하나라도 있는 사용자들
        }
      }
    });

    // 파트너신청한 사용자들의 정보 검색 (최대 20개 결과)
    const users = await prisma.user.findMany({
      where: {
        ...userWhereCondition,
        partnerApplications: {
          some: {} // 파트너신청이 하나라도 있는 사용자들
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        addressDetail: true,
        partnerApplications: {
          select: {
            processedBy: true
          },
          where: {
            processedBy: {
              not: null
            }
          },
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      take: 20, // 최대 20개 결과
      orderBy: {
        name: 'asc'
      }
    });

    // 응답 형식을 기존과 동일하게 맞추기 위해 변환
    const members = users.map(user => ({
      id: user.id,
      name: user.name,
      phone: user.phone,
      address: user.address,
      addressDetail: user.addressDetail,
      manager: user.partnerApplications[0]?.processedBy || ''
    }));

    return NextResponse.json({ 
      members,
      total: totalCount // 전체 결과 수 반환
    });

  } catch (error) {
    console.error('Partner customer search error:', error);
    return NextResponse.json(
      { error: '파트너신청 고객 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
