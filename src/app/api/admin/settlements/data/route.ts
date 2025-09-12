import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 정산리스트용 데이터 조회 API
 * 기존 수금관리 API와 완전히 분리된 새로운 API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 정산리스트 데이터 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const search = searchParams.get('search') || '';

    console.log('📋 요청 파라미터:', { page, limit, search });

    // 수금완료계약과 일시납계약 페이지의 데이터를 직접 복사
    // 수금완료계약 페이지: COMPLETED_COLLECTION 상태
    // 일시납계약 페이지: LUMP_SUM 상태
    // 두 페이지의 데이터를 모두 가져와서 합치기
    const completedContractsWhere = {
      status: 'COMPLETED_COLLECTION'
    };
    
    const lumpSumContractsWhere = {
      status: 'LUMP_SUM'
    };

    // 검색 조건 추가
    if (search) {
      completedContractsWhere.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { contractNumber: { contains: search } },
        { companyName: { contains: search } },
        { itemName: { contains: search } }
      ];
      
      lumpSumContractsWhere.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { contractNumber: { contains: search } },
        { companyName: { contains: search } },
        { itemName: { contains: search } }
      ];
    }

    console.log('🔍 수금완료계약 데이터 조회 시작:', completedContractsWhere);
    console.log('🔍 일시납계약 데이터 조회 시작:', lumpSumContractsWhere);

    // 수금완료계약 데이터 조회 (completed-contracts 페이지와 동일)
    const completedContracts = await prisma.contract.findMany({
      where: completedContractsWhere,
      orderBy: { createdAt: 'desc' },
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

    // 일시납계약 데이터 조회 (lump-sum-contracts 페이지와 동일)
    const lumpSumContracts = await prisma.contract.findMany({
      where: lumpSumContractsWhere,
      orderBy: { createdAt: 'desc' },
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
    const contracts = [...completedContracts, ...lumpSumContracts];
    
    // 계약 데이터 로그로 확인
    console.log('📋 계약 데이터 샘플:', contracts.slice(0, 3));
    
    // 전체 개수 조회
    const completedTotal = await prisma.contract.count({
      where: completedContractsWhere
    });
    
    const lumpSumTotal = await prisma.contract.count({
      where: lumpSumContractsWhere
    });
    
    const total = completedTotal + lumpSumTotal;

    console.log('📊 조회된 계약 수:', contracts.length);
    console.log('📈 전체 계약 수:', total);

    // 파트너회원목록에서 추천인코드 조회 (고객명+연락처 기준으로 매칭)
    console.log('🔍 파트너회원목록에서 추천인코드 조회 시작...');
    
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
    
    console.log('👥 파트너회원 수:', partnerUsers.length);
    console.log('📋 파트너회원 샘플:', partnerUsers.slice(0, 3));

    // 데이터 집계 (고객명 + 연락처 기준으로 그룹화)
    const aggregatedData = contracts.reduce((acc, contract) => {
      const key = `${contract.customerName}_${contract.customerPhone}`;
      
      if (!acc[key]) {
        // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
        const matchingPartner = partnerUsers.find(partner => 
          partner.name === contract.customerName && partner.phone === contract.customerPhone
        );
        
        const referralCode = matchingPartner?.referralCode || contract.referralCode || null;
        
        console.log('🔍 계약 데이터:', {
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          contractReferralCode: contract.referralCode,
          partnerReferralCode: matchingPartner?.referralCode,
          finalReferralCode: referralCode,
          matchingPartner: matchingPartner ? '매칭됨' : '매칭안됨'
        });
        
        acc[key] = {
          id: key, // 고유한 key를 id로 사용
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          contractCount: 0,
          contractAmount: 0,
          finalPoints: 0,
          confirmedAt: contract.confirmedAt,
          contractNumbers: [],
          status: contract.status, // 상태값 추가
          referralCode: referralCode, // 파트너회원목록에서 찾은 추천인코드 우선 사용
        };
      }
      
      acc[key].contractCount += 1;
      acc[key].contractAmount += contract.contractAmount;
      acc[key].finalPoints += contract.finalPoints;
      acc[key].contractNumbers.push(contract.contractNumber);
      
      // 가장 최근 확정일시로 업데이트
      if (contract.confirmedAt && (!acc[key].confirmedAt || new Date(contract.confirmedAt) > new Date(acc[key].confirmedAt))) {
        acc[key].confirmedAt = contract.confirmedAt;
      }
      
      return acc;
    }, {} as Record<string, any>);

    const settlementData = Object.values(aggregatedData);

    console.log('📊 집계된 정산 데이터 수:', settlementData.length);
    console.log('✅ API 응답 준비 완료');

    return NextResponse.json({
      success: true,
      data: settlementData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ 정산리스트 데이터 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '정산 데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
