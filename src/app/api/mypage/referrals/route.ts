import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // 사용자의 추천인 코드 (연락처 뒤 8자리)
    const referralCode = userPhone.slice(-8);

    // 새로운 1차추천인수 API 호출
    const directReferralsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/mypage/direct-referrals-count?userName=${encodeURIComponent(userName)}&userPhone=${encodeURIComponent(userPhone)}`);
    const directReferralsData = await directReferralsResponse.json();
    
    const directReferralsCount = directReferralsData.success ? directReferralsData.data.directReferralsCount : 0;
    
    console.log('📊 새로운 1차추천인수 API 결과:', {
      userName,
      userPhone,
      directReferralsCount,
      apiResponse: directReferralsData
    });

    // 기존 방식으로도 조회 (비교용)
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
        createdAt: true
      }
    });
    
    console.log('📊 기존 방식 1차추천인수:', directReferrals.length);

    // 간접 추천인원 계산 (재귀적으로 모든 단계 조회)
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
    const directUserCodes = directReferrals.map((user: any) => user.phone.slice(-8));
    
    // 간접 추천인원 계산
    let indirectReferrals = [];
    if (directUserCodes.length > 0) {
      indirectReferrals = await getAllReferralChain(directUserCodes);
    }

    const totalReferrals = directReferralsCount + indirectReferrals.length;

    console.log('📊 회원용 추천인원 조회 (새로운 방식 적용):', {
      userName,
      userPhone,
      직접추천인원_새로운방식: directReferralsCount,
      직접추천인원_기존방식: directReferrals.length,
      간접추천인원: indirectReferrals.length,
      총추천인원: totalReferrals
    });

    return NextResponse.json({
      success: true,
      data: {
        directReferrals: directReferralsCount, // 새로운 방식 사용
        indirectReferrals: indirectReferrals.length,
        totalReferrals: totalReferrals
      }
    });

  } catch (error) {
    console.error('회원용 추천인원 조회 오류:', error);
    return NextResponse.json(
      { error: '추천인원 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
