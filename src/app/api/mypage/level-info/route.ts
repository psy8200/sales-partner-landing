import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel, getNextLevelRequirement, getRemainingReferrals } from '@/lib/levelCalculator';
import { getLevelIcon, getLevelName, getLevelColor } from '@/lib/levelIcons';

/**
 * 회원의 승급기준 정보 조회 API
 * 현재등급, 승급까지 필요한 인원수, 등급 아이콘 등을 정확하게 계산
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 승급기준 정보 조회 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    const userPhone = searchParams.get('userPhone');

    if (!userName || !userPhone) {
      return NextResponse.json(
        { success: false, error: '회원명과 연락처는 필수입니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { userName, userPhone });

    // 1. 해당 회원의 추천인코드 찾기 (연락처 뒤 8자리)
    const referralCode = userPhone.slice(-8);
    console.log('🔍 추천인코드:', referralCode);

    // 2. 새로운 1차추천인수 API 호출
    const directReferralsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mypage/direct-referrals-count?userName=${encodeURIComponent(userName)}&userPhone=${encodeURIComponent(userPhone)}`);
    const directReferralsData = await directReferralsResponse.json();
    
    const directReferralsCount = directReferralsData.success ? directReferralsData.data.directReferralsCount : 0;
    
    console.log('📊 1차추천인수:', directReferralsCount);

    // 3. 간접 추천인원 계산 (재귀적으로 모든 단계 조회)
    const getAllReferralChain = async (referralCodes: string[], level: number = 1, maxLevel: number = 10): Promise<any[]> => {
      if (level > maxLevel || referralCodes.length === 0) {
        return [];
      }

      const allReferrals = [];
      const nextLevelCodes = new Set<string>();

      for (const referralCode of referralCodes) {
        try {
          const users = await prisma.user.findMany({
            where: {
              referralCode: referralCode,
              role: 'MEMBER',
              partnerStatus: 'APPROVED'
            },
            select: {
              id: true,
              name: true,
              phone: true,
              createdAt: true
            }
          });

          if (users.length > 0) {
            const usersWithLevel = users.map(user => ({
              ...user,
              level: level
            }));
            allReferrals.push(...usersWithLevel);

            // 다음 단계를 위한 추천인 코드 수집
            users.forEach((user: any) => {
              const nextCode = user.phone.slice(-8);
              nextLevelCodes.add(nextCode);
            });
          }
        } catch (error) {
          console.error(`❌ ${level}차 - ${referralCode} 조회 오류:`, error);
        }
      }

      // 다음 단계가 있으면 재귀 호출
      if (nextLevelCodes.size > 0) {
        const nextLevelReferrals = await getAllReferralChain(Array.from(nextLevelCodes), level + 1);
        allReferrals.push(...nextLevelReferrals);
      }

      return allReferrals;
    };

    // 직접 추천 회원들의 내코드 수집
    const directUsers = await prisma.user.findMany({
      where: {
        referralCode: referralCode,
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true
      }
    });

    const directUserCodes = directUsers.map((user: any) => user.phone.slice(-8));
    
    // 간접 추천인원 계산
    let indirectReferrals = [];
    if (directUserCodes.length > 0) {
      indirectReferrals = await getAllReferralChain(directUserCodes);
    }

    const totalReferrals = directReferralsCount + indirectReferrals.length;

    console.log('📊 추천인원 계산 완료:', {
      userName,
      userPhone,
      직접추천인원: directReferralsCount,
      간접추천인원: indirectReferrals.length,
      총추천인원: totalReferrals
    });

    // 4. 현재 등급 계산
    const currentLevel = calculateLevel(totalReferrals);
    const currentLevelNum = typeof currentLevel === 'number' ? currentLevel : 10;
    
    // 5. 승급까지 필요한 인원수 계산
    const nextLevelRequirement = getNextLevelRequirement(currentLevelNum);
    const remainingReferrals = getRemainingReferrals(currentLevelNum, totalReferrals);
    
    // 6. 등급 정보 가져오기
    const levelIcon = getLevelIcon(currentLevel);
    const levelName = getLevelName(currentLevel);
    const levelColor = getLevelColor(currentLevel);
    
    // 7. 최고등급 여부 확인
    const isMaxLevel = currentLevel === 10 || currentLevel === 'LEGEND';

    console.log('🏆 승급기준 정보 계산 완료:', {
      userName,
      userPhone,
      currentLevel,
      currentLevelNum,
      totalReferrals,
      nextLevelRequirement,
      remainingReferrals,
      levelIcon,
      levelName,
      isMaxLevel
    });

    return NextResponse.json({
      success: true,
      data: {
        currentLevel,
        currentLevelNum,
        totalReferrals,
        directReferrals: directReferralsCount,
        indirectReferrals: indirectReferrals.length,
        nextLevelRequirement,
        remainingReferrals,
        levelIcon,
        levelName,
        levelColor,
        isMaxLevel,
        referralCode
      }
    });

  } catch (error) {
    console.error('❌ 승급기준 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '승급기준 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


