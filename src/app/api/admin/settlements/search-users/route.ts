import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 정산리스트에서 회원 검색 API
 * 이름과 연락처로 정산리스트의 회원들을 검색합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';
    const phone = searchParams.get('phone') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🔍 회원 검색 API 호출:', { name, phone, limit });

    // 이름이 없으면 빈 결과 반환
    if (!name.trim()) {
      return NextResponse.json({
        success: true,
        data: [],
        message: '검색어를 입력해주세요.'
      });
    }

    // 정산리스트 데이터 API와 동일한 방식으로 검색
    console.log('🔍 정산리스트 방식으로 검색 시작');

    // 수금완료계약과 일시납계약 데이터를 모두 가져와서 합치기 (정산리스트 API와 동일)
    const completedContractsWhere = {
      status: 'COMPLETED_COLLECTION',
      customerName: {
        contains: name.trim()
      }
    };
    
    const lumpSumContractsWhere = {
      status: 'COMPLETED_COLLECTION',
      customerName: {
        contains: name.trim()
      }
    };

    // 연락처가 있으면 추가 필터링
    if (phone.trim()) {
      completedContractsWhere.customerPhone = {
        contains: phone.trim()
      };
      lumpSumContractsWhere.customerPhone = {
        contains: phone.trim()
      };
    }

    console.log('🔍 검색 조건:', { completedContractsWhere, lumpSumContractsWhere });

    // 수금완료계약 데이터 조회
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

    // 일시납계약 데이터 조회
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
    
    console.log('📋 검색된 계약 수:', contracts.length);
    console.log('📋 검색 결과 샘플:', contracts.slice(0, 3));

    // 파트너회원목록에서 추천인코드 조회 (고객명+연락처 기준으로 매칭)
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

    // 중복 제거 (같은 이름+연락처 조합)
    const uniqueUsers = new Map();
    contracts.forEach(contract => {
      const key = `${contract.customerName}_${contract.customerPhone}`;
      if (!uniqueUsers.has(key)) {
        // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
        const matchingPartner = partnerUsers.find(partner => 
          partner.name === contract.customerName && partner.phone === contract.customerPhone
        );
        
        const referralCode = matchingPartner?.referralCode || contract.referralCode || null;
        
        uniqueUsers.set(key, {
          id: contract.id,
          name: contract.customerName,
          phone: contract.customerPhone,
          referralCode: referralCode,
          finalPoints: contract.finalPoints,
          createdAt: contract.createdAt
        });
      }
    });

    const searchResults = Array.from(uniqueUsers.values());

    return NextResponse.json({
      success: true,
      data: searchResults,
      message: `${searchResults.length}명의 회원을 찾았습니다.`
    });

  } catch (error) {
    console.error('회원 검색 오류:', error);
    return NextResponse.json({
      success: false,
      data: [],
      message: '회원 검색 중 오류가 발생했습니다.'
    }, { status: 500 });
  }
}
