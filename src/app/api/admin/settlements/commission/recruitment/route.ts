import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 모집수당 계산 API
 * 내가 추천해서 가입한 회원들의 포인트 합산 × 20%
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 모집수당 계산 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const phoneLast8 = searchParams.get('phoneLast8'); // 연락처 뒤 8자리

    if (!phoneLast8) {
      return NextResponse.json(
        { success: false, error: '연락처 뒤 8자리가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { phoneLast8 });

    // 1. 정산리스트에서 해당 추천인코드로 가입한 회원들 조회
    console.log('🔍 정산리스트에서 직접 추천 회원 조회 시작...');
    
    // 수금완료계약과 일시납계약에서 추천인코드가 일치하는 계약들 조회
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

    // 두 데이터 합치기
    const allContracts = [...completedContracts, ...lumpSumContracts];

    // 2. 파트너회원목록에서 추천인코드 매칭
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

    // 3. 추천인코드가 일치하는 계약들만 필터링
    const filteredContracts = allContracts.filter(contract => {
      // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      
      // 요청한 추천인코드와 일치하는지 확인
      return contractReferralCode === phoneLast8;
    });

    console.log('👥 필터링된 계약 수:', filteredContracts.length);

    // 4. 고객별로 그룹화하여 집계
    const aggregatedData = filteredContracts.reduce((acc, contract) => {
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
      
      // 가장 최근 계약일로 업데이트
      if (new Date(contract.createdAt) > new Date(acc[key].lastContractDate)) {
        acc[key].lastContractDate = contract.createdAt;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const result = Object.values(aggregatedData);

    // 5. 모집수당 계산: 직접 추천 회원들의 포인트 합산 × 20%
    const totalDirectPoints = result.reduce((sum, user) => sum + (user.totalFinalPoints || 0), 0);
    const recruitmentCommission = Math.round(totalDirectPoints * 0.2);

    console.log('📊 직접 추천 회원 수:', result.length);
    console.log('📊 직접 추천 회원 포인트 합계:', totalDirectPoints);
    console.log('💰 모집수당 (20%):', recruitmentCommission);

    return NextResponse.json({
      success: true,
      data: {
        commission: recruitmentCommission,
        totalDirectPoints: totalDirectPoints,
        directReferralCount: result.length,
        directReferrals: result
      },
      message: `모집수당 계산 완료: ${recruitmentCommission.toLocaleString()}원`
    });

  } catch (error) {
    console.error('❌ 모집수당 계산 오류:', error);
    return NextResponse.json(
      { success: false, error: '모집수당을 계산할 수 없습니다.' },
      { status: 500 }
    );
  }
}






