import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 배당등급별 계산 API
 * 결정포인트합계의 20%를 제원으로 하여 합산포인트 기준으로 차등 지급
 * 동적 단위 방식: 합산포인트합계 ÷ 100을 단위로 사용
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 배당등급별 계산 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const phoneLast8 = searchParams.get('phoneLast8'); // 연락처 뒤 8자리

    if (!phoneLast8) {
      return NextResponse.json(
        { success: false, error: '연락처 뒤 8자리가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { phoneLast8 });

    // 1. 모든 회원의 결정포인트와 합산포인트 계산을 위해 정산리스트 데이터 조회
    console.log('🔍 모든 회원의 결정포인트와 합산포인트 계산 시작...');
    
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

    // 2. 모든 회원별로 결정포인트와 합산포인트 계산
    const customerMap = new Map();
    
    allContracts.forEach((contract) => {
      const customerKey = `${contract.customerName}_${contract.customerPhone}`;
      
      if (!customerMap.has(customerKey)) {
        customerMap.set(customerKey, {
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          totalPoints: 0,
          totalAmount: 0,
          contractCount: 0,
          referralCode: contract.referralCode,
          latestConfirmedAt: contract.confirmedAt,
          contractNumbers: []
        });
      }
      
      const customer = customerMap.get(customerKey);
      customer.totalPoints += contract.finalPoints || 0;
      customer.totalAmount += contract.contractAmount || 0;
      customer.contractCount += 1;
      customer.contractNumbers.push(contract.contractNumber);
      
      if (new Date(contract.confirmedAt) > new Date(customer.latestConfirmedAt)) {
        customer.latestConfirmedAt = contract.confirmedAt;
      }
    });

    // 3. 각 회원별로 합산포인트 계산 (직접 추천 + 간접 추천)
    const allMembers = Array.from(customerMap.values());
    const memberSumPoints = new Map();

    for (const customer of allMembers) {
      const myCode = customer.customerPhone.slice(-8);
      
      try {
        // 직접 추천 회원들의 포인트 합계
        const directResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/settlements/direct-referrals?phoneLast8=${myCode}`);
        const directData = await directResponse.json();
        
        let totalSumPoints = 0;
        
        if (directData.success && directData.data && directData.data.directReferrals) {
          const directPoints = directData.data.directReferrals.reduce((sum: number, user: any) => {
            return sum + (user.totalFinalPoints || 0);
          }, 0);
          totalSumPoints += directPoints;
          
          // 간접 추천 회원들의 포인트 합계 (2차까지만)
          const getAllIndirectPoints = async (referralCodes: string[], level: number = 1, maxLevel: number = 2): Promise<number> => {
            if (level > maxLevel || referralCodes.length === 0) {
              return 0;
            }
            
            let indirectPoints = 0;
            const nextLevelCodes = new Set<string>();
            
            for (const referralCode of referralCodes) {
              try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/settlements/direct-referrals?phoneLast8=${referralCode}`);
                const data = await response.json();
                
                if (data.success && data.data && data.data.directReferrals) {
                  const levelPoints = data.data.directReferrals.reduce((sum: number, user: any) => {
                    return sum + (user.totalFinalPoints || 0);
                  }, 0);
                  indirectPoints += levelPoints;
                  
                  if (level < maxLevel) {
                    data.data.directReferrals.forEach((user: any) => {
                      const nextCode = user.customerPhone.slice(-8);
                      nextLevelCodes.add(nextCode);
                    });
                  }
                }
              } catch (error) {
                console.error(`❌ ${level}차 - ${referralCode} 조회 오류:`, error);
              }
            }
            
            if (nextLevelCodes.size > 0 && level < maxLevel) {
              const nextLevelPoints = await getAllIndirectPoints(Array.from(nextLevelCodes), level + 1, maxLevel);
              indirectPoints += nextLevelPoints;
            }
            
            return indirectPoints;
          };
          
          const directUserCodes = directData.data.directReferrals.map((user: any) => user.customerPhone.slice(-8));
          const indirectPoints = await getAllIndirectPoints(directUserCodes);
          totalSumPoints += indirectPoints;
        }
        
        memberSumPoints.set(myCode, totalSumPoints);
        
      } catch (error) {
        console.error(`❌ ${customer.customerName}의 합산포인트 계산 오류:`, error);
        memberSumPoints.set(myCode, 0);
      }
    }

    // 4. 총결정포인트와 총합산포인트 계산
    const totalFinalPoints = allMembers.reduce((sum, customer) => sum + customer.totalPoints, 0);
    const totalSumPoints = Array.from(memberSumPoints.values()).reduce((sum, points) => sum + points, 0);
    
    // 5. 제원 계산 (결정포인트합계의 20%)
    const totalMembers = allMembers.length;
    const dividendPool = Math.round(totalFinalPoints * 0.2); // 결정포인트합계의 20%
    
    // 6. 동적 단위 계산 (합산포인트합계 ÷ 100)
    const dynamicUnit = Math.round(totalSumPoints / 100);
    
    // 7. 각 회원별로 단위 개수 계산
    const memberUnits = new Map();
    let totalUnits = 0;
    
    for (const customer of allMembers) {
      const myCode = customer.customerPhone.slice(-8);
      const sumPoints = memberSumPoints.get(myCode) || 0;
      const units = Math.floor(sumPoints / dynamicUnit);
      memberUnits.set(myCode, units);
      totalUnits += units;
    }
    
    // 8. 1개당 지급액 계산
    const unitPayment = totalUnits > 0 ? Math.round(dividendPool / totalUnits) : 0;
    
    // 9. 개인별 배당등급별 계산
    const mySumPoints = memberSumPoints.get(phoneLast8) || 0;
    const myUnits = Math.floor(mySumPoints / dynamicUnit);
    const levelDividend = myUnits * unitPayment;

    console.log('📊 전체 회원 수:', totalMembers);
    console.log('📊 총결정포인트:', totalFinalPoints);
    console.log('📊 총합산포인트:', totalSumPoints);
    console.log('📊 제원 (20%):', dividendPool);
    console.log('📊 동적 단위:', dynamicUnit);
    console.log('📊 총 단위 수:', totalUnits);
    console.log('📊 1개당 지급액:', unitPayment);
    console.log('📊 개인 합산포인트:', mySumPoints);
    console.log('📊 개인 단위 수:', myUnits);
    console.log('💰 배당등급별 (개인):', levelDividend);

    return NextResponse.json({
      success: true,
      data: {
        commission: levelDividend, // 개인별 배당등급별
        totalFinalPoints: totalFinalPoints,
        totalSumPoints: totalSumPoints,
        dividendPool: dividendPool,
        dynamicUnit: dynamicUnit,
        totalUnits: totalUnits,
        unitPayment: unitPayment,
        mySumPoints: mySumPoints,
        myUnits: myUnits,
        totalMembers: totalMembers
      },
      message: `배당등급별 계산 완료: ${levelDividend.toLocaleString()}원`
    });

  } catch (error) {
    console.error('❌ 배당등급별 계산 오류:', error);
    return NextResponse.json(
      { success: false, error: '배당등급별을 계산할 수 없습니다.' },
      { status: 500 }
    );
  }
}

