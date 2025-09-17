import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('userPhone');

    if (!userPhone) {
      return NextResponse.json(
        { error: '사용자 전화번호가 필요합니다.' },
        { status: 400 }
      );
    }

    // 내코드 추출 (전화번호 마지막 8자리)
    const myCode = userPhone.slice(-8);
    console.log('🔍 1차 추천인 조회 시작:', { userPhone, myCode });

    // 1차 추천인 조회 - User 테이블에서 referralCode로 찾기
    const firstLevelUsers = await prisma.user.findMany({
      where: {
        referralCode: myCode,
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        phone: true,
        name: true
      }
    });

    console.log('📊 1차 추천인 User 조회 결과:', firstLevelUsers);

    // 각 추천인의 Contract에서 finalPoints 가져오기
    const firstLevelReferrals = [];
    for (const user of firstLevelUsers) {
      const contract = await prisma.contract.findFirst({
        where: {
          customerPhone: user.phone
        },
        select: {
          finalPoints: true,
          status: true
        }
      });
      
      firstLevelReferrals.push({
        customerPhone: user.phone,
        finalPoints: contract?.finalPoints || 0,
        status: contract?.status || 'UNKNOWN'
      });
    }

    console.log('📊 1차 추천인 최종 결과:', firstLevelReferrals);

    // 데이터 포맷팅
    const formattedData = firstLevelReferrals.map(contract => ({
      phone: contract.customerPhone,
      points: contract.finalPoints || 0
    }));

    console.log('✅ 포맷팅된 데이터:', formattedData);

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
      totalPoints: formattedData.reduce((sum, item) => sum + item.points, 0)
    });

  } catch (error) {
    console.error('1차 추천인 조회 오류:', error);
    return NextResponse.json(
      { error: '1차 추천인 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
