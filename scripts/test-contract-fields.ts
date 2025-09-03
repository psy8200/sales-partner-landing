import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testContractFields() {
  try {
    console.log('사용자 요청 18개 필드 저장 테스트를 시작합니다...');

    // 테스트용 계약 데이터 생성 (실제 계산 방식 적용)
    const testContracts = [
      {
        // 기본 정보 (12개)
        customerName: '테스트고객1',
        customerPhone: '010-1234-5678',
        customerAddress: '서울시 강남구 테스트동 123-45',
        itemCategory: 'INSURANCE' as const,
        companyName: '테스트보험사',
        itemName: '테스트보험상품',
        contractAmount: 1000000,
        contractDate: new Date('2025-08-30'),
        startDate: new Date('2025-09-01'),
        endDate: new Date('2045-08-30'),
        
        // 비율/포인트 정보 (4개) - 사용자 요청 필드만
        expectedRate: 1200, // 1200% = 50% (1200/24)
        pointRate: 100,     // 100%
        payoutRate: 100,    // 100%
        // finalPoints 계산: 1,000,000 * (50/100) * (100/100) * (100/100) = 500,000
        finalPoints: 500000,
        
        // 동적필드 (납입기간, 종료기간)
        dynamicFields: JSON.stringify({
          paymentTerm: '20년납',
          endTerm: '100세만기',
          policyNumber: 'TEST001',
          productDetail: '테스트상품상세',
          policyholder: '테스트계약자',
          insured: '테스트피보험자',
          contractMethod: '온라인계약'
        }),
        
        contractNumber: 'CT20250830001',
        status: 'ACTIVE' as const,
        createdBy: '테스트관리자',
        commissionRate: 5, // 기본값
        commissionAmount: 50000 // 기본값
      },
      {
        // 기본 정보 (12개)
        customerName: '테스트고객2',
        customerPhone: '010-9876-5432',
        customerAddress: '부산시 해운대구 테스트동 456-78',
        itemCategory: 'RENTAL' as const,
        companyName: '테스트렌탈사',
        itemName: '테스트렌탈상품',
        contractAmount: 500000,
        contractDate: new Date('2025-08-30'),
        startDate: new Date('2025-09-01'),
        endDate: new Date('2027-08-30'),
        
        // 비율/포인트 정보 (4개) - 사용자 요청 필드만
        expectedRate: 800,  // 800% = 33.33% (800/24)
        pointRate: 90,      // 90%
        payoutRate: 90,     // 90%
        // finalPoints 계산: 500,000 * (33.33/100) * (90/100) * (90/100) = 135,000
        finalPoints: 135000,
        
        // 동적필드 (납입기간, 종료기간)
        dynamicFields: JSON.stringify({
          paymentTerm: '2년납',
          endTerm: '2년만기',
          rentalCompany: '테스트렌탈',
          productDetail: '테스트렌탈상품상세',
          installationAddress: '부산시 해운대구 설치주소',
          recipientName: '테스트설치받는분',
          recipientPhone: '010-1111-2222',
          installationDate: '2025-09-15',
          notes: '테스트메모'
        }),
        
        contractNumber: 'CT20250830002',
        status: 'ACTIVE' as const,
        createdBy: '테스트관리자',
        commissionRate: 3, // 기본값
        commissionAmount: 15000 // 기본값
      },
      {
        // 기본 정보 (12개)
        customerName: '테스트고객3',
        customerPhone: '010-5555-6666',
        customerAddress: '대구시 수성구 테스트동 789-12',
        itemCategory: 'RENTAL_MALL' as const,
        companyName: '테스트렌탈몰',
        itemName: '테스트렌탈몰상품',
        contractAmount: 2000000,
        contractDate: new Date('2025-08-30'),
        startDate: new Date('2025-09-01'),
        endDate: new Date('2030-08-30'),
        
        // 비율/포인트 정보 (4개) - 사용자 요청 필드만
        expectedRate: 1000, // 1000% = 41.67% (1000/24)
        pointRate: 95,      // 95%
        payoutRate: 95,     // 95%
        // finalPoints 계산: 2,000,000 * (41.67/100) * (95/100) * (95/100) = 750,000
        finalPoints: 750000,
        
        // 동적필드 (납입기간, 종료기간)
        dynamicFields: JSON.stringify({
          paymentTerm: '5년납',
          endTerm: '5년만기',
          policyNumber: '123-45-67890',
          contractorName: '테스트사업자',
          insuredPerson: '010-7777-8888',
          customField1: 'www.testmall.com',
          customField2: 'test@testmall.com',
          notes: '테스트렌탈몰메모'
        }),
        
        contractNumber: 'CT20250830003',
        status: 'ACTIVE' as const,
        createdBy: '테스트관리자',
        commissionRate: 7, // 기본값
        commissionAmount: 140000 // 기본값
      }
    ];

    // 기존 테스트 데이터 삭제
    await prisma.contract.deleteMany({
      where: {
        contractNumber: {
          in: ['CT20250830001', 'CT20250830002', 'CT20250830003']
        }
      }
    });

    // 테스트 데이터 생성
    for (const contractData of testContracts) {
      await prisma.contract.create({
        data: contractData
      });
      console.log(`계약 ${contractData.contractNumber} 생성 완료`);
    }

    // 생성된 데이터 조회 및 검증
    const createdContracts = await prisma.contract.findMany({
      where: {
        contractNumber: {
          in: ['CT20250830001', 'CT20250830002', 'CT20250830003']
        }
      },
      orderBy: {
        contractNumber: 'asc'
      }
    });

    console.log('\n=== 사용자 요청 18개 필드 저장 테스트 결과 ===');
    
    createdContracts.forEach((contract, index) => {
      console.log(`\n[계약 ${index + 1}] ${contract.contractNumber}`);
      console.log('┌─────────────────────────────────────────────────────────┐');
      
      // 기본 정보 검증 (12개 필드)
      console.log('│ 📋 기본 정보 (12개 필드)');
      console.log('│ ├─ 고객명:', contract.customerName);
      console.log('│ ├─ 연락처:', contract.customerPhone);
      console.log('│ ├─ 주소:', contract.customerAddress);
      console.log('│ ├─ 상품카테고리:', contract.itemCategory);
      console.log('│ ├─ 회사명:', (contract as Record<string, unknown>).companyName);
      console.log('│ ├─ 상품명:', contract.itemName);
      console.log('│ ├─ 계약금액:', contract.contractAmount.toLocaleString());
      console.log('│ ├─ 계약일:', contract.contractDate.toLocaleDateString());
      console.log('│ ├─ 시작일:', contract.startDate?.toLocaleDateString());
      console.log('│ ├─ 종료일:', contract.endDate?.toLocaleDateString());
      
      // 동적필드에서 납입기간, 종료기간 확인
      if (contract.dynamicFields) {
        const dynamicFields = JSON.parse(contract.dynamicFields);
        console.log('│ ├─ 납입기간:', dynamicFields.paymentTerm);
        console.log('│ └─ 종료기간:', dynamicFields.endTerm);
      }
      
      // 비율/포인트 정보 검증 (4개 필드만)
      console.log('│ 💰 비율/포인트 정보 (4개 필드)');
      console.log('│ ├─ 예상지급율:', (contract.expectedRate || 0) + '%');
      console.log('│ ├─ 포인트전환율:', (contract.pointRate || 0) + '%');
      console.log('│ ├─ 결정지급율:', (contract as Record<string, unknown>).payoutRate + '%');
      console.log('│ └─ 결정포인트:', (contract as Record<string, unknown>).finalPoints?.toLocaleString() + ' P');
      
      // 계산 검증
      console.log('│ 🔍 계산 검증');
      const monthlyRate = (contract.expectedRate || 0) / 24;
      const monthlyAmount = Math.round(contract.contractAmount * (monthlyRate / 100));
      const pointAmount = Math.round(monthlyAmount * ((contract.pointRate || 0) / 100));
      const payoutRate = (contract as Record<string, unknown>).payoutRate as number || 100;
      const calculatedFinalPoints = Math.round(pointAmount * (payoutRate / 100));
      
      console.log('│ ├─ 월별지급율:', monthlyRate.toFixed(2) + '%');
      console.log('│ ├─ 월별금액:', monthlyAmount.toLocaleString());
      console.log('│ ├─ 포인트금액:', pointAmount.toLocaleString());
      console.log('│ └─ 계산된결정포인트:', calculatedFinalPoints.toLocaleString() + ' P');
      
      console.log('└─────────────────────────────────────────────────────────┘');
    });

    console.log('\n✅ 사용자 요청 18개 필드 저장 테스트 완료!');
    console.log('📊 총 생성된 계약 수:', createdContracts.length);
    console.log('📋 테스트된 필드: 기본정보 12개 + 비율/포인트정보 4개 = 총 16개 필드');
    console.log('⚠️  참고: 수당율, 수당금액은 사용자 요청 필드가 아니므로 제외됨');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testContractFields();
