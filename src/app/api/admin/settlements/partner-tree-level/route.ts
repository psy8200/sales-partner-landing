import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/levelCalculator';

// 특정 레벨의 추천인 조회 함수 (partner-referrals API 기반)
async function getLevelReferrals(
  referralCode: string, 
  targetLevel: number,
  currentLevel: number = 0,
  visitedCodes: Set<string> = new Set()
): Promise<any[]> {
  // 깊이 제한 및 중복 방지
  if (currentLevel >= 10 || visitedCodes.has(referralCode)) {
    return [];
  }
  
  visitedCodes.add(referralCode);
  
  console.log(`🔍 ${currentLevel}단계 추천인 조회: ${referralCode} (목표: ${targetLevel}단계)`);
  
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

  console.log(`👥 ${currentLevel}단계에서 ${directReferrals.length}명 발견`);

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
      depth: currentLevel + 1,
      levelDepth: currentLevel + 1,
      contractCount,
      totalPoints,
      contracts
    };
  }));

  // 목표 레벨에 도달했으면 반환
  if (currentLevel + 1 === targetLevel) {
    return processedReferrals;
  }

  // 아직 목표 레벨에 도달하지 않았으면 재귀 호출
  const allReferrals: any[] = [];
  for (const referral of processedReferrals) {
    if (referral.referralCode) {
      const subReferrals = await getLevelReferrals(
        referral.referralCode, 
        targetLevel,
        currentLevel + 1, 
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    const userPhone = searchParams.get('userPhone');
    const level = parseInt(searchParams.get('level') || '1');

    if (!userName || !userPhone) {
      return NextResponse.json(
        { success: false, error: '회원명과 연락처는 필수입니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 레벨별 추천인 조회 시작:', { userName, userPhone, level });

    // 1. 검색된 사용자 정보 조회
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
      return NextResponse.json(
        { success: false, error: '대상 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 대상 사용자 정보:', targetUser);

    // 2. 특정 레벨의 추천인 조회
    console.log(`🔍 ${level}차 추천인 조회 시작...`);
    const levelReferrals = await getLevelReferrals(targetUser.referralCode, level, 0);
    console.log(`👥 ${level}차 추천인 수:`, levelReferrals.length);

    // 3. 각 추천인을 MemberData 형식으로 변환 (이미 처리된 데이터 사용)
    const members: MemberData[] = [];
    for (const user of levelReferrals) {
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

      members.push({
        id: user.id,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
        level: calculateLevel(directReferralsCount) as number,
        totalReferrals: directReferralsCount,
        directReferrals: directReferralsCount,
        contracts: contracts,
        points: totalPoints,
        joinDate: user.createdAt.toISOString().split('T')[0],
        levelDepth: user.levelDepth || user.depth || level
      });

      console.log(`📊 ${user.name}: 직접추천 ${directReferralsCount}명, 포인트 ${totalPoints}P, 계약 ${contracts}건`);
    }

    console.log(`✅ ${level}차 추천인 데이터 완료:`, members.length, '명');

    return NextResponse.json({
      success: true,
      data: {
        level,
        members,
        totalCount: members.length,
        totalPoints: members.reduce((sum, member) => sum + member.points, 0)
      }
    });

  } catch (error) {
    console.error('❌ 레벨별 추천인 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '레벨별 추천인 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
