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

    // 모든 회원 검색 (일반회원 + 파트너회원)
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

    // 모든 사용자 검색 (파트너신청 여부와 관계없이)
    const totalCount = await prisma.user.count({
      where: userWhereCondition
    });

    // 모든 사용자들의 정보 검색 (최대 20개 결과)
    const users = await prisma.user.findMany({
      where: userWhereCondition,
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        addressDetail: true,
        bankName: true,
        bankAccount: true,
        accountHolder: true,
        role: true,
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
      bankName: user.bankName,
      accountNumber: user.bankAccount,
      accountHolder: user.accountHolder,
      role: user.role,
      manager: user.partnerApplications[0]?.processedBy || ''
    }));

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
