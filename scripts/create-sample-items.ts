import { PrismaClient, ItemCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleItems() {
  console.log('📦 샘플 아이템 데이터를 생성합니다...');

  try {
    await prisma.$connect();

    // 기존 아이템 개수 확인
    const existingCount = await prisma.itemSetting.count();
    console.log(`현재 아이템 수: ${existingCount}`);

    // 샘플 아이템 데이터
    const sampleItems = [
      // 보험 아이템
      {
        category: 'INSURANCE' as ItemCategory,
        provider: '삼성생명',
        productName: '삼성생명 실비보험',
        paymentTerm: '월납',
        baseAmount: 50000,
        expectedRate: 15.0,
        pointRate: 3.0,
        pointAmount: 1500
      },
      {
        category: 'INSURANCE' as ItemCategory,
        provider: '교보생명',
        productName: '교보생명 종신보험',
        paymentTerm: '월납',
        baseAmount: 100000,
        expectedRate: 12.0,
        pointRate: 2.5,
        pointAmount: 2500
      },
      {
        category: 'INSURANCE' as ItemCategory,
        provider: '한화생명',
        productName: '한화생명 암보험',
        paymentTerm: '연납',
        baseAmount: 300000,
        expectedRate: 18.0,
        pointRate: 4.0,
        pointAmount: 12000
      },

      // 렌탈 아이템
      {
        category: 'RENTAL' as ItemCategory,
        provider: 'CJ대한통운',
        productName: 'CJ렌탈 가전제품',
        paymentTerm: '월납',
        baseAmount: 30000,
        expectedRate: 20.0,
        pointRate: 5.0,
        pointAmount: 1500
      },
      {
        category: 'RENTAL' as ItemCategory,
        provider: '현대렌탈',
        productName: '현대렌탈 가구',
        paymentTerm: '월납',
        baseAmount: 50000,
        expectedRate: 18.0,
        pointRate: 4.5,
        pointAmount: 2250
      },
      {
        category: 'RENTAL' as ItemCategory,
        provider: '롯데렌탈',
        productName: '롯데렌탈 생활용품',
        paymentTerm: '월납',
        baseAmount: 25000,
        expectedRate: 22.0,
        pointRate: 5.5,
        pointAmount: 1375
      },

      // 인터넷/방송 아이템
      {
        category: 'INTERNET_TV' as ItemCategory,
        provider: 'KT',
        productName: 'KT 인터넷 + TV',
        paymentTerm: '월납',
        baseAmount: 40000,
        expectedRate: 25.0,
        pointRate: 6.0,
        pointAmount: 2400
      },
      {
        category: 'INTERNET_TV' as ItemCategory,
        provider: 'SK브로드밴드',
        productName: 'SK 인터넷 + 케이블',
        paymentTerm: '월납',
        baseAmount: 35000,
        expectedRate: 23.0,
        pointRate: 5.8,
        pointAmount: 2030
      },
      {
        category: 'INTERNET_TV' as ItemCategory,
        provider: 'LG유플러스',
        productName: 'LG 인터넷 + IPTV',
        paymentTerm: '월납',
        baseAmount: 38000,
        expectedRate: 24.0,
        pointRate: 6.2,
        pointAmount: 2356
      },

      // 상조 아이템
      {
        category: 'FUNERAL' as ItemCategory,
        provider: '동양생명',
        productName: '동양생명 상조보험',
        paymentTerm: '월납',
        baseAmount: 20000,
        expectedRate: 30.0,
        pointRate: 7.0,
        pointAmount: 1400
      },
      {
        category: 'FUNERAL' as ItemCategory,
        provider: '농협생명',
        productName: '농협생명 상조서비스',
        paymentTerm: '연납',
        baseAmount: 200000,
        expectedRate: 35.0,
        pointRate: 8.0,
        pointAmount: 16000
      },

      // 렌탈몰분양 아이템
      {
        category: 'CUSTOM' as ItemCategory,
        provider: '세일즈파트너스',
        productName: '맞춤형 상품 패키지',
        paymentTerm: '월납',
        baseAmount: 100000,
        expectedRate: 40.0,
        pointRate: 10.0,
        pointAmount: 10000
      }
    ];

    // 아이템 생성
    for (const itemData of sampleItems) {
      const item = await prisma.itemSetting.create({
        data: itemData
      });
      console.log(`✅ ${item.provider} - ${item.productName} 생성 완료`);
    }

    console.log(`\n🎉 총 ${sampleItems.length}개의 샘플 아이템이 생성되었습니다.`);
    
    // 카테고리별 개수 확인
    const insuranceCount = await prisma.itemSetting.count({ where: { category: 'INSURANCE' } });
    const rentalCount = await prisma.itemSetting.count({ where: { category: 'RENTAL' } });
    const internetCount = await prisma.itemSetting.count({ where: { category: 'INTERNET_TV' } });
    const funeralCount = await prisma.itemSetting.count({ where: { category: 'FUNERAL' } });
    const customCount = await prisma.itemSetting.count({ where: { category: 'CUSTOM' } });

    console.log('\n📊 카테고리별 아이템 수:');
    console.log(`- 보험: ${insuranceCount}개`);
    console.log(`- 렌탈: ${rentalCount}개`);
    console.log(`- 인터넷/방송: ${internetCount}개`);
    console.log(`- 상조: ${funeralCount}개`);
    console.log(`- 렌탈몰분양: ${customCount}개`);

  } catch (error) {
    console.error('❌ 샘플 아이템 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleItems();

