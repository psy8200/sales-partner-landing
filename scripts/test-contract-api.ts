import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testContractAPI() {
  try {
    console.log('🧪 계약 입력 API를 테스트합니다...');
    
    // 테스트 데이터
    const testContractData = {
      customerName: '테스트고객',
      customerPhone: '010-1234-5678',
      customerAddress: '서울 강남구',
      itemCategory: 'INSURANCE',
      companyName: '테스트보험',
      itemName: '테스트상품',
      contractAmount: '1000000',
      commissionRate: '10',
      expectedRate: '80',
      pointRate: '99',
      payoutRate: '100',
      finalPoints: 33000,
      contractDate: '2025-08-30',
      startDate: '20년납',
      endDate: '100세만기',
      notes: '테스트 계약',
      dynamicFields: {
        paymentTerm: '20년납',
        endTerm: '100세만기'
      }
    };
    
    console.log('📋 테스트 데이터:', JSON.stringify(testContractData, null, 2));
    
    // API 호출 시뮬레이션
    const response = await fetch('http://localhost:3000/api/admin/contracts/entries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testContractData),
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ API 호출 성공!');
      console.log('📄 응답:', JSON.stringify(result, null, 2));
    } else {
      console.log('❌ API 호출 실패!');
      console.log('📄 오류 응답:', JSON.stringify(result, null, 2));
    }
    
    // 현재 계약 수 확인
    const contractCount = await prisma.contract.count();
    console.log(`📊 현재 계약 수: ${contractCount}개`);
    
  } catch (error) {
    console.error('❌ API 테스트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContractAPI();








