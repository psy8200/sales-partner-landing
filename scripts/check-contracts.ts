import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 계약 정보 확인 스크립트
 * 계약 데이터의 상세 현황을 확인합니다.
 */
async function checkContracts() {
  try {
    console.log('📋 계약 정보 확인 중...\n');

    // 전체 계약 수
    const totalContracts = await prisma.contract.count();
    console.log(`📊 전체 계약 수: ${totalContracts}건\n`);

    // 상태별 계약 수
    console.log('📈 상태별 계약 현황:');
    console.log('─'.repeat(40));
    
    const statuses = ['PENDING', 'ACTIVE', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'SUSPENDED'];
    for (const status of statuses) {
      const count = await prisma.contract.count({
        where: { status: status as any }
      });
      console.log(`${status.padEnd(12)}: ${count.toString().padStart(4)}건`);
    }

    // 카테고리별 계약 수
    console.log('\n🏷️ 카테고리별 계약 현황:');
    console.log('─'.repeat(40));
    
    const categories = ['RENTAL', 'FUNERAL', 'INSURANCE', 'INTERNET_TV', 'RENTAL_MALL'];
    for (const category of categories) {
      const count = await prisma.contract.count({
        where: { category: category as any }
      });
      console.log(`${category.padEnd(15)}: ${count.toString().padStart(4)}건`);
    }

    // 계약 금액 현황
    console.log('\n💰 계약 금액 현황:');
    console.log('─'.repeat(40));
    
    const contractAmounts = await prisma.contract.aggregate({
      _sum: { contractAmount: true },
      _avg: { contractAmount: true },
      _min: { contractAmount: true },
      _max: { contractAmount: true }
    });

    console.log(`총 계약 금액: ${contractAmounts._sum.contractAmount?.toLocaleString() || 0}원`);
    console.log(`평균 계약 금액: ${contractAmounts._avg.contractAmount?.toLocaleString() || 0}원`);
    console.log(`최소 계약 금액: ${contractAmounts._min.contractAmount?.toLocaleString() || 0}원`);
    console.log(`최대 계약 금액: ${contractAmounts._max.contractAmount?.toLocaleString() || 0}원`);

    // 포인트 현황
    console.log('\n🎯 포인트 현황:');
    console.log('─'.repeat(40));
    
    const pointStats = await prisma.contract.aggregate({
      _sum: { finalPoints: true },
      _avg: { finalPoints: true }
    });

    console.log(`총 포인트: ${pointStats._sum.finalPoints?.toLocaleString() || 0}점`);
    console.log(`평균 포인트: ${pointStats._avg.finalPoints?.toLocaleString() || 0}점`);

    // 월별 계약 현황 (최근 6개월)
    console.log('\n📅 월별 계약 현황 (최근 6개월):');
    console.log('─'.repeat(40));
    
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyContracts = await prisma.contract.groupBy({
      by: ['contractDate'],
      _count: { contractDate: true },
      where: {
        contractDate: {
          gte: sixMonthsAgo
        }
      },
      orderBy: { contractDate: 'desc' }
    });

    monthlyContracts.forEach(stat => {
      const month = new Date(stat.contractDate).toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'short' 
      });
      console.log(`${month.padEnd(10)}: ${stat._count.contractDate.toString().padStart(4)}건`);
    });

    // 최근 계약 정보
    console.log('\n🆕 최근 계약 정보 (상위 5건):');
    console.log('─'.repeat(40));
    
    const recentContracts = await prisma.contract.findMany({
      select: {
        id: true,
        customerName: true,
        contractAmount: true,
        category: true,
        status: true,
        contractDate: true,
        finalPoints: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    recentContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.customerName} (${contract.category})`);
      console.log(`   금액: ${contract.contractAmount?.toLocaleString() || 0}원, 포인트: ${contract.finalPoints || 0}점`);
      console.log(`   상태: ${contract.status}, 계약일: ${contract.contractDate?.toLocaleDateString('ko-KR') || 'N/A'}`);
    });

    // 계약 승인 대기 현황
    console.log('\n⏳ 계약 승인 대기 현황:');
    console.log('─'.repeat(40));
    
    const pendingContracts = await prisma.contract.count({
      where: { status: 'PENDING' }
    });
    console.log(`승인 대기 계약: ${pendingContracts}건`);

    // 활성 계약 현황
    const activeContracts = await prisma.contract.count({
      where: { status: 'ACTIVE' }
    });
    console.log(`활성 계약: ${activeContracts}건`);

    // 완료된 계약 현황
    const completedContracts = await prisma.contract.count({
      where: { status: 'COMPLETED' }
    });
    console.log(`완료된 계약: ${completedContracts}건`);

    console.log('\n✅ 계약 정보 확인 완료!');

  } catch (error) {
    console.error('❌ 계약 정보 확인 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  checkContracts()
    .then(() => {
      console.log('✅ 계약 정보 확인 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 계약 정보 확인 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { checkContracts };
