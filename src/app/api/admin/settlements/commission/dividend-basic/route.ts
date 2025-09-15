import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 기본배당 계산 API
 * 결정포인트합계의 10% 금액을 전체 회원수로 나눈 값을 모든 회원에게 기본배당으로 지급
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 기본배당 계산 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const phoneLast8 = searchParams.get('phoneLast8'); // 연락처 뒤 8자리

    if (!phoneLast8) {
      return NextResponse.json(
        { success: false, error: '연락처 뒤 8자리가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { phoneLast8 });

    // 1. 모든 회원의 결정포인트 계산을 위해 정산리스트 데이터 조회
    console.log('🔍 모든 회원의 결정포인트 계산 시작...');
    
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

    // 2. 모든 회원별로 결정포인트 계산
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

    // 3. 총결정포인트 계산
    const allMembers = Array.from(customerMap.values());
    const totalFinalPoints = allMembers.reduce((sum, customer) => sum + customer.totalPoints, 0);
    
    // 4. 기본배당 계산
    const totalMembers = allMembers.length;
    const dividendPool = Math.round(totalFinalPoints * 0.1); // 결정포인트합계의 10%
    const basicDividend = totalMembers > 0 ? Math.round(dividendPool / totalMembers) : 0; // 전체 회원수로 나누기

    console.log('📊 전체 회원 수:', totalMembers);
    console.log('📊 총결정포인트:', totalFinalPoints);
    console.log('📊 배당풀 (10%):', dividendPool);
    console.log('💰 기본배당 (회원당):', basicDividend);

    return NextResponse.json({
      success: true,
      data: {
        commission: basicDividend, // 모든 회원에게 동일한 기본배당
        totalFinalPoints: totalFinalPoints,
        dividendPool: dividendPool,
        totalMembers: totalMembers
      },
      message: `기본배당 계산 완료: 회원당 ${basicDividend.toLocaleString()}원`
    });

  } catch (error) {
    console.error('❌ 기본배당 계산 오류:', error);
    return NextResponse.json(
      { success: false, error: '기본배당을 계산할 수 없습니다.' },
      { status: 500 }
    );
  }
}
