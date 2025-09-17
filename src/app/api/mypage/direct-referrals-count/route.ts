import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 회원의 1차추천인수 조회 API
 * 특정 회원이 직접 추천한 회원의 수를 정확하게 계산
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 1차추천인수 조회 API 호출 시작');
    
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

    // 2. 정산리스트에서 해당 추천인코드로 가입한 회원들 조회
    console.log('🔍 정산리스트에서 직접 추천 회원 조회 시작...');
    
    // 수금완료계약에서 추천인코드가 일치하는 계약들 조회
    const completedContracts = await prisma.contract.findMany({
      where: {
        status: 'COMPLETED_COLLECTION'
      },
      select: {
        id: true,
        contractNumber: true,
        customerName: true,
        customerPhone: true,
        contractAmount: true,
        finalPoints: true,
        confirmedAt: true,
        status: true,
        referralCode: true,
        createdAt: true
      }
    });

    // 일시납계약에서 추천인코드가 일치하는 계약들 조회
    const lumpSumContracts = await prisma.contract.findMany({
      where: {
        status: 'LUMP_SUM'
      },
      select: {
        id: true,
        contractNumber: true,
        customerName: true,
        customerPhone: true,
        contractAmount: true,
        finalPoints: true,
        confirmedAt: true,
        status: true,
        referralCode: true,
        createdAt: true
      }
    });

    // 두 데이터 합치기
    const allContracts = [...completedContracts, ...lumpSumContracts];

    // 파트너회원목록에서 추천인코드 매칭
    const partnerUsers = await prisma.user.findMany({
      where: {
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        referralCode: true
      }
    });

    // 추천인코드가 일치하는 계약들만 필터링
    const filteredContracts = allContracts.filter(contract => {
      // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      
      // 요청한 추천인코드와 일치하는지 확인
      return contractReferralCode === referralCode;
    });

    console.log('👥 필터링된 계약 수:', filteredContracts.length);

    // 고객별로 그룹화하여 중복 제거 (같은 고객이 여러 계약을 가진 경우 1명으로 계산)
    const uniqueCustomers = new Set();
    filteredContracts.forEach(contract => {
      const customerKey = `${contract.customerName}_${contract.customerPhone}`;
      uniqueCustomers.add(customerKey);
    });

    const directReferralsCount = uniqueCustomers.size;

    console.log('📊 1차추천인수 계산 완료:', {
      userName,
      userPhone,
      referralCode,
      totalContracts: filteredContracts.length,
      uniqueCustomers: directReferralsCount
    });

    return NextResponse.json({
      success: true,
      data: {
        directReferralsCount,
        referralCode,
        totalContracts: filteredContracts.length,
        uniqueCustomers: directReferralsCount
      }
    });

  } catch (error) {
    console.error('❌ 1차추천인수 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '1차추천인수 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


