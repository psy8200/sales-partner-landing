import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 재귀적 추천인 조회 함수
async function getRecursiveReferrals(
  referralCode: string, 
  currentDepth: number = 0, 
  maxDepth: number = 10,
  visitedCodes: Set<string> = new Set()
): Promise<any[]> {
  // 깊이 제한 및 중복 방지
  if (currentDepth >= maxDepth || visitedCodes.has(referralCode)) {
    return [];
  }
  
  visitedCodes.add(referralCode);
  
  console.log(`🔍 ${currentDepth}단계 추천인 조회: ${referralCode}`);
  
  // 현재 추천인코드로 가입한 회원들 조회
  const directReferrals = await prisma.user.findMany({
    where: {
      referralCode: referralCode,
      role: 'MEMBER',
      partnerStatus: 'APPROVED'
    },
    select: {
      id: true,
      name: true,
      phone: true,
      points: true,
      totalReferrals: true,
      monthlyReferrals: true,
      createdAt: true,
      referralCode: true
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log(`👥 ${currentDepth}단계에서 ${directReferrals.length}명 발견`);

  // 각 회원의 계약 정보 조회
  const processedReferrals = await Promise.all(directReferrals.map(async (user) => {
    const contracts = await prisma.contract.findMany({
      where: {
        customerName: user.name,
        customerPhone: user.phone,
        status: 'COMPLETED_COLLECTION'
      },
      select: {
        id: true,
        contractNumber: true,
        finalPoints: true,
        confirmedAt: true
      }
    });

    const contractCount = contracts.length;
    const totalPoints = contracts.reduce((sum, contract) => sum + (contract.finalPoints || 0), 0);

    return {
      id: user.id,
      userName: user.name,
      userPhone: user.phone,
      userBasePoints: user.points,
      userTotalReferrals: user.totalReferrals,
      userMonthlyReferrals: user.monthlyReferrals,
      joinDate: user.createdAt,
      contractCount,
      totalPoints,
      contracts,
      referralCode: user.referralCode,
      depth: currentDepth + 1
    };
  }));

  // 재귀적으로 하위 추천인들 조회
  const allReferrals = [...processedReferrals];
  
  for (const referral of processedReferrals) {
    if (referral.referralCode) {
      const subReferrals = await getRecursiveReferrals(
        referral.referralCode, 
        currentDepth + 1, 
        maxDepth, 
        new Set(visitedCodes)
      );
      allReferrals.push(...subReferrals);
    }
  }

  return allReferrals;
}

/**
 * 파트너 추천 리스트 전용 API (재귀적 추천인 조회)
 * 1. 검색된 회원 정보 조회 (전화번호 뒤 8자리 매칭)
 * 2. 재귀적으로 모든 하위 추천인 조회 (최대 10단계)
 * 3. 대용량 데이터 처리를 위한 페이지네이션
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 파트너 추천 리스트 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get('referralCode'); // 8자리 추천인코드
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const maxDepth = parseInt(searchParams.get('maxDepth') || '10'); // 최대 깊이

    if (!referralCode) {
      return NextResponse.json(
        { success: false, error: '추천인코드가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { referralCode, page, limit, maxDepth });

    // 1. 검색된 회원 정보 조회 (추천인코드로 직접 매칭)
    console.log('🔍 검색된 회원 정보 조회 시작...');
    
    const searchedUser = await prisma.user.findFirst({
      where: {
        referralCode: referralCode,
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        points: true,
        referralCode: true,
        totalReferrals: true,
        monthlyReferrals: true
      }
    });

    console.log('👤 검색된 회원:', searchedUser);

    // 2. 재귀적으로 모든 하위 추천인 조회
    console.log('🔍 재귀적 추천인 조회 시작...');
    
    const allReferredUsers = await getRecursiveReferrals(referralCode, 0, maxDepth);
    console.log('👥 전체 추천인 수:', allReferredUsers.length);

    // 3. 직접 추천인과 간접 추천인 분리
    const directReferrals = allReferredUsers.filter(user => user.depth === 1);
    const indirectReferrals = allReferredUsers.filter(user => user.depth > 1);
    
    // 4. 통계 계산
    const myDirectReferrals = directReferrals.length;
    const totalIndirectReferrals = indirectReferrals.length;
    const myTotalReferrals = allReferredUsers.length;

    // 5. 페이지네이션 적용
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = allReferredUsers.slice(startIndex, endIndex);

    // 6. 검색된 회원 정보 구성
    const userInfo = searchedUser ? {
      myName: searchedUser.name,
      myPhone: searchedUser.phone,
      myBasePoints: searchedUser.points,
      myDirectReferrals,
      myIndirectReferrals: totalIndirectReferrals,
      myTotalReferrals,
      myReferralCode: searchedUser.referralCode
    } : {
      myName: null,
      myPhone: null,
      myBasePoints: null,
      myDirectReferrals: 0,
      myIndirectReferrals: 0,
      myTotalReferrals: 0,
      myReferralCode: null
    };

    console.log('📊 최종 통계:', {
      searchedUser: userInfo.myName,
      directReferrals: myDirectReferrals,
      indirectReferrals: totalIndirectReferrals,
      totalReferrals: myTotalReferrals,
      currentPage: page,
      totalPages: Math.ceil(allReferredUsers.length / limit)
    });

    console.log('✅ API 응답 준비 완료');

    return NextResponse.json({
      success: true,
      data: {
        userInfo,
        referredUsers: paginatedUsers,
        pagination: {
          page,
          limit,
          total: allReferredUsers.length,
          totalPages: Math.ceil(allReferredUsers.length / limit),
          hasNext: page < Math.ceil(allReferredUsers.length / limit),
          hasPrev: page > 1
        },
        statistics: {
          directReferrals: myDirectReferrals,
          indirectReferrals: totalIndirectReferrals,
          totalReferrals: myTotalReferrals,
          maxDepth: maxDepth
        }
      }
    });

  } catch (error) {
    console.error('❌ 파트너 추천 리스트 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '파트너 추천 리스트 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
