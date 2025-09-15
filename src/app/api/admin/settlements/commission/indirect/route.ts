import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 간접수당 계산 API
 * 2차 추천인들의 결정포인트 합계 × 10%
 * (3차, 4차는 포함하지 않음)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 간접수당 계산 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const phoneLast8 = searchParams.get('phoneLast8'); // 연락처 뒤 8자리

    if (!phoneLast8) {
      return NextResponse.json(
        { success: false, error: '연락처 뒤 8자리가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { phoneLast8 });

    // 1. 직접 추천 회원들 조회 (1차 추천)
    console.log('🔍 1차 추천 회원들 조회 시작...');
    
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

    const allContracts = [...completedContracts, ...lumpSumContracts];

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

    // 1차 추천 회원들 필터링
    const directReferralContracts = allContracts.filter(contract => {
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      return contractReferralCode === phoneLast8;
    });

    console.log('👥 1차 추천 회원 계약 수:', directReferralContracts.length);

    // 2. 1차 추천 회원들의 추천인코드(연락처 끝 8자리) 수집
    const directReferralCodes = new Set<string>();
    directReferralContracts.forEach(contract => {
      const referralCode = contract.customerPhone.slice(-8);
      directReferralCodes.add(referralCode);
    });

    console.log('🔍 1차 추천 회원들의 추천인코드:', Array.from(directReferralCodes));

    // 3. 2차 추천 회원들 조회 (1차 추천 회원들이 추천한 회원들)
    console.log('🔍 2차 추천 회원들 조회 시작...');
    
    const indirectReferralContracts = allContracts.filter(contract => {
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      
      // 1차 추천 회원들의 추천인코드와 일치하는지 확인
      return directReferralCodes.has(contractReferralCode);
    });

    console.log('👥 2차 추천 회원 계약 수:', indirectReferralContracts.length);

    // 4. 2차 추천 회원들을 고객별로 그룹화하여 집계
    const aggregatedData = indirectReferralContracts.reduce((acc, contract) => {
      const key = `${contract.customerName}_${contract.customerPhone}`;
      
      if (!acc[key]) {
        acc[key] = {
          id: key,
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          contractCount: 0,
          totalContractAmount: 0,
          totalFinalPoints: 0,
          firstContractDate: contract.createdAt,
          lastContractDate: contract.createdAt,
          contracts: []
        };
      }
      
      acc[key].contractCount += 1;
      acc[key].totalContractAmount += contract.contractAmount || 0;
      acc[key].totalFinalPoints += contract.finalPoints || 0;
      acc[key].contracts.push(contract);
      
      if (new Date(contract.createdAt) > new Date(acc[key].lastContractDate)) {
        acc[key].lastContractDate = contract.createdAt;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const indirectReferrals = Object.values(aggregatedData);

    // 5. 간접수당 계산: 2차 추천 회원들의 포인트 합계 × 10%
    const totalIndirectPoints = indirectReferrals.reduce((sum, user) => sum + (user.totalFinalPoints || 0), 0);
    const indirectCommission = Math.round(totalIndirectPoints * 0.1);

    console.log('📊 2차 추천 회원 수:', indirectReferrals.length);
    console.log('📊 2차 추천 회원 포인트 합계:', totalIndirectPoints);
    console.log('💰 간접수당 (10%):', indirectCommission);

    return NextResponse.json({
      success: true,
      data: {
        commission: indirectCommission,
        totalIndirectPoints: totalIndirectPoints,
        indirectReferralCount: indirectReferrals.length,
        indirectReferrals: indirectReferrals
      },
      message: `간접수당 계산 완료: ${indirectCommission.toLocaleString()}원`
    });

  } catch (error) {
    console.error('❌ 간접수당 계산 오류:', error);
    return NextResponse.json(
      { success: false, error: '간접수당을 계산할 수 없습니다.' },
      { status: 500 }
    );
  }
}

