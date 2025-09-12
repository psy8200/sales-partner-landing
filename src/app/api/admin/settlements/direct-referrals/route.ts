import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 직접 추천 회원 조회 API
 * 회원정보박스의 연락처 뒤 8자리를 기준으로 정산리스트에서 추천인코드가 일치하는 회원들의 데이터를 조회
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 직접 추천 회원 조회 API 호출 시작');
    
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
    
    // 정산리스트에서 해당 추천인코드를 사용한 모든 계약 조회
    // (정산리스트 API와 동일한 로직 사용)
    console.log('🔍 정산리스트에서 추천인코드로 계약 조회 시작...');
    
    // 1. 수금완료계약에서 추천인코드가 일치하는 계약들 조회
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

    // 2. 일시납계약에서 추천인코드가 일치하는 계약들 조회
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

    // 3. 두 데이터 합치기
    const allContracts = [...completedContracts, ...lumpSumContracts];

    // 4. 파트너회원목록에서 추천인코드 매칭
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

    // 5. 추천인코드가 일치하는 계약들만 필터링
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

    // 6. 고객별로 그룹화하여 집계
    const aggregatedData = filteredContracts.reduce((acc, contract) => {
      const key = `${contract.customerName}_${contract.customerPhone}`;
      
      // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      
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
          referralCode: contractReferralCode, // 추천인코드 추가
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

    console.log('📊 집계된 직접 추천 회원 수:', result.length);
    console.log('✅ API 응답 준비 완료');

    return NextResponse.json({
      success: true,
      data: {
        directReferrals: result,
        totalCount: result.length,
        searchCriteria: {
          phoneLast8: phoneLast8,
          description: '연락처 뒤 8자리를 추천인코드로 사용한 직접 추천 회원들'
        }
      }
    });

  } catch (error) {
    console.error('❌ 직접 추천 회원 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '직접 추천 회원 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
