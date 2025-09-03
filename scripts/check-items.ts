import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkItems() {
  console.log('📦 현재 아이템 데이터 확인 중...');
  
  try {
    await prisma.$connect();

    // 전체 아이템 조회
    const items = await prisma.itemSetting.findMany({
      orderBy: { createdAt: 'desc' }
    });

    console.log(`\n📊 총 아이템 수: ${items.length}개`);
    
    if (items.length === 0) {
      console.log('❌ 등록된 아이템이 없습니다.');
      return;
    }

    // 카테고리별 분류
    const categories = {
      INSURANCE: items.filter(item => item.category === 'INSURANCE'),
      RENTAL: items.filter(item => item.category === 'RENTAL'),
      INTERNET_TV: items.filter(item => item.category === 'INTERNET_TV'),
      FUNERAL: items.filter(item => item.category === 'FUNERAL'),
      RENTAL_MALL: items.filter(item => item.category === 'RENTAL_MALL'),
      CUSTOM: items.filter(item => item.category === 'CUSTOM')
    };

    console.log('\n📋 카테고리별 아이템:');
    console.log(`- 보험: ${categories.INSURANCE.length}개`);
    console.log(`- 렌탈: ${categories.RENTAL.length}개`);
    console.log(`- 인터넷/방송: ${categories.INTERNET_TV.length}개`);
    console.log(`- 상조: ${categories.FUNERAL.length}개`);
    console.log(`- 렌탈몰: ${categories.RENTAL_MALL.length}개`);
    console.log(`- CUSTOM (잔여): ${categories.CUSTOM.length}개`);

    console.log('\n📝 상세 아이템 목록:');
    items.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.provider} - ${item.productName}`);
      console.log(`   카테고리: ${item.category}`);
      console.log(`   납입기간: ${item.paymentTerm}`);
      console.log(`   기본금액: ₩${item.baseAmount.toLocaleString()}`);
      console.log(`   예상수익률: ${item.expectedRate}%`);
      console.log(`   포인트율: ${item.pointRate}%`);
      console.log(`   포인트금액: ₩${item.pointAmount.toLocaleString()}`);
      console.log(`   생성일: ${item.createdAt.toLocaleString()}`);
    });

  } catch (error) {
    console.error('❌ 아이템 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkItems();

