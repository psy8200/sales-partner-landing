import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * User 테이블 기반 추천인원 조회 API
 * 회원의 내코드(연락처 뒤 8자리)를 기준으로 User 테이블에서 직접 추천인원을 조회
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 User 테이블 기반 추천인원 조회 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const phoneLast8 = searchParams.get('phoneLast8'); // 연락처 뒤 8자리

    if (!phoneLast8) {
      return NextResponse.json(
        { success: false, error: '연락처 뒤 8자리가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { phoneLast8 });

    // 1. 해당 회원의 추천인코드로 가입한 직접 추천인원 조회
    console.log('🔍 User 테이블에서 직접 추천인원 조회 시작...');
    
    const directReferrals = await prisma.user.findMany({
      where: {
        referralCode: phoneLast8,
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

    console.log('👥 직접 추천인원 수:', directReferrals.length);

    // 2. 간접 추천인원 계산 (재귀적으로 모든 하위 추천인 조회)
    const getAllReferralChain = async (referralCodes: string[], level: number = 1, maxLevel: number = 10): Promise<any[]> => {
      if (level > maxLevel || referralCodes.length === 0) {
        return [];
      }

      console.log(`🔍 ${level}차 추천 회원 조회 시작:`, referralCodes);
      const allReferrals = [];
      const nextLevelCodes = new Set<string>();

      for (const referralCode of referralCodes) {
        try {
          const indirectReferrals = await prisma.user.findMany({
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

          console.log(`✅ ${level}차 - ${referralCode}로 조회된 추천 회원:`, indirectReferrals.length, '명');
          
          // 데이터 변환
          const transformedData = indirectReferrals.map((user: any) => ({
            id: user.id,
            customerName: user.name,
            customerPhone: user.phone,
            contractCount: 1, // User 테이블에서는 1명당 1건으로 계산
            finalPoints: user.points || 0,
            createdAt: user.createdAt,
            referralCode: user.referralCode,
            level: level // 추천 단계 표시
          }));

          allReferrals.push(...transformedData);

          // 다음 단계를 위한 추천인코드 수집 (각 회원의 내코드)
          transformedData.forEach((user: any) => {
            const nextCode = user.customerPhone.slice(-8);
            nextLevelCodes.add(nextCode);
          });
        } catch (error) {
          console.error(`❌ ${level}차 - ${referralCode} 조회 오류:`, error);
        }
      }

      // 다음 단계가 있으면 재귀 호출
      if (nextLevelCodes.size > 0) {
        const nextLevelReferrals = await getAllReferralChain(Array.from(nextLevelCodes), level + 1, maxLevel);
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

    console.log('👥 간접 추천인원 수:', indirectReferrals.length);

    // 3. 직접 추천인원 데이터 변환
    const transformedDirectReferrals = directReferrals.map((user: any) => ({
      id: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      contractCount: 1, // User 테이블에서는 1명당 1건으로 계산
      finalPoints: user.points || 0,
      createdAt: user.createdAt,
      referralCode: user.referralCode,
      level: 1 // 직접 추천은 1단계
    }));

    // 4. 응답 데이터 구성
    const responseData = {
      directReferrals: transformedDirectReferrals,
      indirectReferrals: indirectReferrals,
      totalDirectReferrals: transformedDirectReferrals.length,
      totalIndirectReferrals: indirectReferrals.length,
      totalReferrals: transformedDirectReferrals.length + indirectReferrals.length
    };

    console.log('📊 응답 데이터:', {
      직접추천인원: responseData.totalDirectReferrals,
      간접추천인원: responseData.totalIndirectReferrals,
      총추천인원: responseData.totalReferrals
    });

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('❌ User 테이블 기반 추천인원 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '추천인원 조회 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
