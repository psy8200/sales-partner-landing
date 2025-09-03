import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStartDate() {
  try {
    console.log('🔍 startDate 필드값 전체 조회 중...\n');

    // 모든 계약의 startDate 필드 조회
    const contracts = await prisma.contract.findMany({
      select: {
        id: true,
        contractNumber: true,
        customerName: true,
        startDate: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 총 ${contracts.length}개의 계약이 있습니다.\n`);

    if (contracts.length === 0) {
      console.log('❌ 계약 데이터가 없습니다.');
      return;
    }

    // 표 헤더
    console.log('┌─────────────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│                                    startDate 필드값 전체 표                                    │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');
    console.log('│  ID (앞 8자리)  │  계약번호  │  고객명  │  startDate 값  │  상태  │  생성일  │');
    console.log('├─────────────────────────────────────────────────────────────────────────────────────────────┤');

    // 데이터 행
    contracts.forEach((contract, index) => {
      const id = contract.id.substring(0, 8);
      const contractNum = contract.contractNumber.padEnd(10);
      const customerName = contract.customerName.padEnd(8);
      const startDate = contract.startDate ? 
        new Date(contract.startDate).toLocaleDateString('ko-KR') : 
        'NULL'.padEnd(12);
      const status = contract.status.padEnd(4);
      const createdAt = new Date(contract.createdAt).toLocaleDateString('ko-KR');

      console.log(`│  ${id}  │  ${contractNum}  │  ${customerName}  │  ${startDate}  │  ${status}  │  ${createdAt}  │`);
    });

    console.log('└─────────────────────────────────────────────────────────────────────────────────────────────┘');

    // 통계 정보
    const nullCount = contracts.filter(c => c.startDate === null).length;
    const dateCount = contracts.filter(c => c.startDate !== null).length;
    
    console.log('\n📈 통계 정보:');
    console.log(`   • NULL 값: ${nullCount}개`);
    console.log(`   • 날짜 값: ${dateCount}개`);
    console.log(`   • NULL 비율: ${((nullCount / contracts.length) * 100).toFixed(1)}%`);

    // NULL이 아닌 startDate 값들의 예시
    const nonNullDates = contracts.filter(c => c.startDate !== null).slice(0, 5);
    if (nonNullDates.length > 0) {
      console.log('\n📅 startDate 값 예시 (최근 5개):');
      nonNullDates.forEach(contract => {
        console.log(`   • ${contract.customerName}: ${new Date(contract.startDate!).toLocaleDateString('ko-KR')}`);
      });
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStartDate();





