import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 상품 정보 확인 스크립트
 * 상품 데이터의 상세 현황을 확인합니다.
 */
async function checkItems() {
  try {
    console.log('🛍️ 상품 정보 확인 중...\n');

    // 전체 상품 수
    const totalItems = await prisma.itemSetting.count();
    console.log(`📊 전체 상품 수: ${totalItems}개\n`);

    // 카테고리별 상품 수
    console.log('🏷️ 카테고리별 상품 현황:');
    console.log('─'.repeat(40));
    
    const categories = ['RENTAL', 'FUNERAL', 'INSURANCE', 'INTERNET_TV', 'RENTAL_MALL'];
    for (const category of categories) {
      const count = await prisma.itemSetting.count({
        where: { category: category as any }
      });
      console.log(`${category.padEnd(15)}: ${count.toString().padStart(4)}개`);
    }

    // 상태별 상품 수
    console.log('\n📈 상태별 상품 현황:');
    console.log('─'.repeat(40));
    
    const activeItems = await prisma.itemSetting.count({
      where: { isActive: true }
    });
    console.log(`활성 상품: ${activeItems}개`);

    const inactiveItems = await prisma.itemSetting.count({
      where: { isActive: false }
    });
    console.log(`비활성 상품: ${inactiveItems}개`);

    // 가격 현황
    console.log('\n💰 가격 현황:');
    console.log('─'.repeat(40));
    
    const priceStats = await prisma.itemSetting.aggregate({
      _sum: { price: true },
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true }
    });

    console.log(`총 상품 가격: ${priceStats._sum.price?.toLocaleString() || 0}원`);
    console.log(`평균 상품 가격: ${priceStats._avg.price?.toLocaleString() || 0}원`);
    console.log(`최소 상품 가격: ${priceStats._min.price?.toLocaleString() || 0}원`);
    console.log(`최대 상품 가격: ${priceStats._max.price?.toLocaleString() || 0}원`);

    // 포인트 전환율 현황
    console.log('\n🎯 포인트 전환율 현황:');
    console.log('─'.repeat(40));
    
    const pointRateStats = await prisma.itemSetting.aggregate({
      _avg: { pointConversionRate: true },
      _min: { pointConversionRate: true },
      _max: { pointConversionRate: true }
    });

    console.log(`평균 포인트 전환율: ${pointRateStats._avg.pointConversionRate?.toFixed(2) || 0}%`);
    console.log(`최소 포인트 전환율: ${pointRateStats._min.pointConversionRate?.toFixed(2) || 0}%`);
    console.log(`최대 포인트 전환율: ${pointRateStats._max.pointConversionRate?.toFixed(2) || 0}%`);

    // 예상 지급율 현황
    console.log('\n📊 예상 지급율 현황:');
    console.log('─'.repeat(40));
    
    const expectedRateStats = await prisma.itemSetting.aggregate({
      _avg: { expectedPayoutRate: true },
      _min: { expectedPayoutRate: true },
      _max: { expectedPayoutRate: true }
    });

    console.log(`평균 예상 지급율: ${expectedRateStats._avg.expectedPayoutRate?.toFixed(2) || 0}%`);
    console.log(`최소 예상 지급율: ${expectedRateStats._min.expectedPayoutRate?.toFixed(2) || 0}%`);
    console.log(`최대 예상 지급율: ${expectedRateStats._max.expectedPayoutRate?.toFixed(2) || 0}%`);

    // 최근 추가된 상품 (7일 이내)
    console.log('\n🆕 최근 추가된 상품 (7일 이내):');
    console.log('─'.repeat(40));
    
    const recentItems = await prisma.itemSetting.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`최근 7일 추가 상품: ${recentItems}개`);

    // 상위 상품 정보 (가격 기준)
    console.log('\n🏆 상위 상품 정보 (가격 기준 상위 5개):');
    console.log('─'.repeat(40));
    
    const topItems = await prisma.itemSetting.findMany({
      select: {
        name: true,
        category: true,
        price: true,
        pointConversionRate: true,
        expectedPayoutRate: true,
        isActive: true
      },
      orderBy: { price: 'desc' },
      take: 5
    });

    topItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.category})`);
      console.log(`   가격: ${item.price?.toLocaleString() || 0}원, 포인트율: ${item.pointConversionRate || 0}%, 지급율: ${item.expectedPayoutRate || 0}%`);
      console.log(`   상태: ${item.isActive ? '활성' : '비활성'}`);
    });

    // 카테고리별 상세 현황
    console.log('\n📋 카테고리별 상세 현황:');
    console.log('─'.repeat(40));
    
    for (const category of categories) {
      const categoryItems = await prisma.itemSetting.findMany({
        where: { category: category as any },
        select: {
          name: true,
          price: true,
          isActive: true
        }
      });

      if (categoryItems.length > 0) {
        console.log(`\n${category}:`);
        categoryItems.forEach(item => {
          const status = item.isActive ? '✅' : '❌';
          console.log(`  ${status} ${item.name} - ${item.price?.toLocaleString() || 0}원`);
        });
      }
    }

    // 상품별 계약 수 확인
    console.log('\n📊 상품별 계약 수:');
    console.log('─'.repeat(40));
    
    const itemContractCounts = await prisma.contract.groupBy({
      by: ['itemSettingId'],
      _count: { itemSettingId: true },
      orderBy: { _count: { itemSettingId: 'desc' } },
      take: 10
    });

    for (const itemContract of itemContractCounts) {
      const item = await prisma.itemSetting.findUnique({
        where: { id: itemContract.itemSettingId },
        select: { name: true, category: true }
      });
      
      if (item) {
        console.log(`${item.name} (${item.category}): ${itemContract._count.itemSettingId}건`);
      }
    }

    console.log('\n✅ 상품 정보 확인 완료!');

  } catch (error) {
    console.error('❌ 상품 정보 확인 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  checkItems()
    .then(() => {
      console.log('✅ 상품 정보 확인 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 상품 정보 확인 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { checkItems };
