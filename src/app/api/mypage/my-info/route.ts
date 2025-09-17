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

    // 1. 현재 회원 정보 조회 (모든 상태 포함)
    const currentUser = await prisma.contract.findFirst({
      where: {
        customerPhone: userPhone
      },
      select: {
        customerName: true,
        customerPhone: true,
        finalPoints: true,
        status: true
      }
    });

    console.log('현재 회원 정보:', currentUser);

    // 2. 1차 추천인들 조회 (총인원 계산용) - User 테이블에서 referralCode로 찾기
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

    console.log('🔍 내 정보 - 1차 추천인 User들:', { myCode, count: firstLevelUsers.length, data: firstLevelUsers });

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
        finalPoints: contract?.finalPoints || 0,
        status: contract?.status || 'UNKNOWN'
      });
    }

    console.log('🔍 내 정보 - 1차 추천인 최종 결과:', { myCode, count: firstLevelReferrals.length, data: firstLevelReferrals });

    // 3. 데이터 계산
    const totalMembers = firstLevelReferrals.length;
    const totalPoints = firstLevelReferrals.reduce((sum, contract) => sum + (contract.finalPoints || 0), 0);

    // 4. 응답 데이터 구성
    const responseData = {
      customerName: currentUser?.customerName || '알 수 없음',
      myCode: myCode,
      totalMembers: totalMembers,
      totalPoints: totalPoints
    };

    console.log('응답 데이터:', responseData);

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('내 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '내 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
