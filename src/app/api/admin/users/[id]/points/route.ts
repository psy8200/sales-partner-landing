import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 포인트 API 호출:', { userId: id });
    
    // 먼저 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, phone: true }
    });

    if (!user) {
      console.log('❌ 사용자를 찾을 수 없음:', id);
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    console.log('✅ 사용자 정보 조회 성공:', { name: user.name, email: user.email });

    // 해당 사용자의 모든 확정된 계약 조회 (이름 + 전화번호로 정확 매칭)
    // 수금관리탭의 모든 페이지 합산:
    // - 수금완료계약 페이지: COMPLETED_COLLECTION (완전수금확정된 계약)
    // - 수금관리계약 페이지: COLLECTION (수금확인중인 계약)  
    // - 일시납계약 페이지: LUMP_SUM (일시납 완료된 계약)
    // - 전체계약 페이지: CONFIRMED (계약확정된 계약)
    const contracts = await prisma.contract.findMany({
      where: {
        customerName: user.name,
        customerPhone: user.phone, // 전화번호도 일치해야 함
        status: {
          in: ['CONFIRMED', 'COLLECTION', 'LUMP_SUM', 'COMPLETED_COLLECTION'] // 모든 확정된 계약 상태 포함
        }
      },
      select: {
        id: true,
        itemCategory: true,
        finalPoints: true,
        startDate: true,
        customerName: true,
        customerPhone: true,
        itemName: true, // 상품명 추가
        dynamicFields: true // 상품 포인트와 결정포인트를 위해
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    
    console.log('📊 조회된 계약 수:', contracts.length);
    if (contracts.length > 0) {
      console.log('📋 첫 번째 계약 샘플:', {
        id: contracts[0].id,
        category: contracts[0].itemCategory,
        dynamicFields: contracts[0].dynamicFields
      });
    }

    // 카테고리별로 포인트 그룹화 (상품 포인트 + 결정포인트)
    const categoryPoints = contracts.reduce((acc, contract) => {
      const category = contract.itemCategory;
      
      // finalPoints를 사용 (이미 상품포인트 + 결정포인트가 합산된 값)
      const totalContractPoints = contract.finalPoints || 0;
      
      // dynamicFields에서 상품 포인트와 결정포인트 추출 (선택적)
      let productPoints = 0;
      let decisionPoints = 0;
      
      try {
        if (contract.dynamicFields) {
          let dynamicFields;
          
          if (typeof contract.dynamicFields === 'string') {
            dynamicFields = JSON.parse(contract.dynamicFields);
          } else if (typeof contract.dynamicFields === 'object') {
            dynamicFields = contract.dynamicFields;
          } else {
            dynamicFields = {};
          }
          
          // 상품 포인트 (productPoints 또는 points) - 있으면 사용, 없으면 finalPoints의 70%로 추정
          const productPointsValue = dynamicFields.productPoints || dynamicFields.points;
          if (productPointsValue) {
            productPoints = parseInt(String(productPointsValue).replace(/[^0-9]/g, '')) || 0;
          } else {
            productPoints = Math.floor(totalContractPoints * 0.7); // 70% 추정
          }
          
          // 결정포인트 (decisionPoints) - 있으면 사용, 없으면 finalPoints의 30%로 추정
          const decisionPointsValue = dynamicFields.decisionPoints;
          if (decisionPointsValue) {
            decisionPoints = parseInt(String(decisionPointsValue).replace(/[^0-9]/g, '')) || 0;
          } else {
            decisionPoints = totalContractPoints - productPoints; // 나머지
          }
        } else {
          // dynamicFields가 없으면 finalPoints를 70:30으로 분할
          productPoints = Math.floor(totalContractPoints * 0.7);
          decisionPoints = totalContractPoints - productPoints;
        }
      } catch (error) {
        console.error('dynamicFields 파싱 오류:', error, 'contract:', contract.id);
        // 오류 발생 시 finalPoints를 70:30으로 분할
        productPoints = Math.floor(totalContractPoints * 0.7);
        decisionPoints = totalContractPoints - productPoints;
      }
      
      if (!acc[category]) {
        acc[category] = {
          category,
          points: 0,
          count: 0,
          contracts: []
        };
      }
      
      acc[category].points += totalContractPoints;
      acc[category].count += 1;
      acc[category].contracts.push({
        id: contract.id,
        startDate: contract.startDate,
        finalPoints: totalContractPoints,
        productPoints,
        decisionPoints,
        itemName: contract.itemName || '상품명 없음' // 상품명 추가
      });
      
      return acc;
    }, {} as Record<string, {category: string, points: number, count: number, contracts: Array<{id: string, startDate: Date | null, finalPoints: number, productPoints: number, decisionPoints: number, itemName: string}>}>);

    // 전체 합계 계산 (finalPoints 사용)
    const totalPoints = contracts.reduce((sum, contract) => {
      return sum + (contract.finalPoints || 0);
    }, 0);
    const totalContracts = contracts.length;

    const response = {
      totalPoints,
      totalContracts,
      categoryPoints: Object.values(categoryPoints)
    };
    
    // 상태별 계약 수 계산
    const statusCounts = contracts.reduce((acc, contract) => {
      const status = contract.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log('✅ 포인트 API 응답:', {
      totalPoints,
      totalContracts,
      categoryCount: Object.keys(categoryPoints).length,
      statusCounts
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ 포인트 조회 오류:', error);
    console.error('❌ 오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: '포인트 정보를 불러오지 못했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
