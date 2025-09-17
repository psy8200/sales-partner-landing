import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/levelCalculator';

// 재귀적 추천인 조회 함수 (partner-referrals API 기반)
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
      name: user.name,
      phone: user.phone,
      points: user.points,
      totalReferrals: user.totalReferrals,
      monthlyReferrals: user.monthlyReferrals,
      createdAt: user.createdAt,
      referralCode: user.referralCode,
      depth: currentDepth + 1,
      levelDepth: currentDepth + 1,
      contractCount,
      totalPoints,
      contracts
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

// 회원 데이터 타입 정의
interface MemberData {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  level: number;
  totalReferrals: number;
  directReferrals: number;
  contracts: number;
  points: number;
  joinDate: string;
  parentId?: string;
  levelDepth: number;
}

// 추천인 트리 구조 계산 함수 (수정된 버전)
async function calculateReferralTree(userName: string, userPhone: string): Promise<MemberData[]> {
  const members: MemberData[] = [];
  
  try {
    // 1. 검색된 사용자의 추천인코드 찾기 (연락처 뒤 8자리)
    const referralCode = userPhone.slice(-8);
    
    console.log('🔍 검색 대상:', { userName, userPhone, referralCode });

    // 2. 검색된 사용자 정보 조회 (정확한 매칭)
    const targetUser = await prisma.user.findFirst({
      where: {
        name: userName,
        phone: userPhone,
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        referralCode: true,
        points: true,
        totalReferrals: true,
        monthlyReferrals: true,
        createdAt: true
      }
    });

    if (!targetUser) {
      console.log('❌ 대상 사용자를 찾을 수 없습니다:', { userName, userPhone });
      return [];
    }

    console.log('✅ 대상 사용자 정보:', targetUser);

    // 3. 재귀적으로 모든 하위 추천인 조회 (깊이 제한)
    console.log('🔍 재귀적 추천인 조회 시작...');
    const allReferredUsers = await getRecursiveReferrals(targetUser.referralCode, 0, 5); // 최대 5단계로 제한
    console.log('👥 전체 추천인 수:', allReferredUsers.length);

    // 4. 각 추천인을 MemberData 형식으로 변환 (partner-referrals API 기반)
    for (const user of allReferredUsers) {
      // 이미 처리된 데이터 사용 (계약 정보 포함)
      const totalPoints = user.totalPoints || 0;
      const contracts = user.contractCount || 0;

      // 해당 사용자의 직접 추천인 수 계산
      const directReferralsCount = await prisma.user.count({
        where: {
          referralCode: user.referralCode,
          role: 'MEMBER',
          partnerStatus: 'APPROVED'
        }
      });

      // 총 추천인 수는 직접 추천인 수로 단순화
      const totalReferralsCount = directReferralsCount;

      members.push({
        id: user.id,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
        level: calculateLevel(totalReferralsCount) as number,
        totalReferrals: totalReferralsCount,
        directReferrals: directReferralsCount,
        contracts: contracts,
        points: totalPoints,
        joinDate: user.createdAt.toISOString().split('T')[0],
        levelDepth: user.levelDepth || user.depth || 1
      });

      console.log(`📊 ${user.name}: 직접추천 ${directReferralsCount}명, 포인트 ${totalPoints}P, 계약 ${contracts}건`);
    }

    console.log('✅ 최종 추천인 트리 데이터:', members.length, '명');
    
    // 레벨별 통계 계산
    const levelBreakdown: Record<string, number> = {};
    const levelPointsBreakdown: Record<string, number> = {};
    
    members.forEach(member => {
      const level = member.levelDepth.toString();
      levelBreakdown[level] = (levelBreakdown[level] || 0) + 1;
      levelPointsBreakdown[level] = (levelPointsBreakdown[level] || 0) + member.points;
    });

    return {
      members,
      statistics: {
        totalMembers: members.length,
        levelBreakdown,
        levelPointsBreakdown
      }
    };

  } catch (error) {
    console.error('❌ 추천인 트리 계산 오류:', error);
    return [];
  }
}

// 총 추천인 수 계산 (무한 재귀 방지)
async function calculateTotalReferrals(referralCode: string, visitedCodes: Set<string> = new Set(), maxDepth: number = 5): Promise<number> {
  try {
    // 무한 루프 방지
    if (visitedCodes.has(referralCode)) {
      return 0;
    }
    visitedCodes.add(referralCode);

    // 최대 깊이 제한
    if (visitedCodes.size > maxDepth) {
      return 0;
    }

    // 직접 추천인 수
    const directReferrals = await prisma.user.count({
      where: {
        referralCode: referralCode,
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      }
    });

    let totalReferrals = directReferrals;

    // 직접 추천인들의 추천인 수도 계산 (깊이 제한)
    if (visitedCodes.size < maxDepth) {
      const directReferralUsers = await prisma.user.findMany({
        where: {
          referralCode: referralCode,
          role: 'MEMBER',
          partnerStatus: 'APPROVED'
        },
        select: {
          referralCode: true
        }
      });

      for (const user of directReferralUsers) {
        const indirectReferrals = await calculateTotalReferrals(user.referralCode, new Set(visitedCodes), maxDepth);
        totalReferrals += indirectReferrals;
      }
    }

    return totalReferrals;
  } catch (error) {
    console.error('총 추천인 수 계산 오류:', error);
    return 0;
  }
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    const userPhone = searchParams.get('userPhone');

    if (!userName || !userPhone) {
      return NextResponse.json(
        { error: '회원명과 연락처는 필수입니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 파트너 트리 데이터 조회 시작:', { userName, userPhone });

    // 추천인 트리 구조 계산
    const result = await calculateReferralTree(userName, userPhone);

    console.log('✅ 파트너 트리 데이터 조회 완료:', {
      totalMembers: result.members.length,
      levelBreakdown: result.statistics.levelBreakdown
    });

    return NextResponse.json({
      success: true,
      message: '파트너 트리 데이터 조회 성공',
      data: result
    });

  } catch (error) {
    console.error('파트너 트리 데이터 조회 오류:', error);
    return NextResponse.json(
      { error: '파트너 트리 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
