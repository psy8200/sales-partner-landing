const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 기본 데이터 설정 시작...');

  // 회사 정보 생성
  const companyInfo = await prisma.companyInfo.upsert({
    where: { id: 'default-company' },
    update: {},
    create: {
      id: 'default-company',
      companyName: '스마트파트너',
      companyLogo: '/logo.png',
      bottomLogo: '/sp.png',
      businessNumber: '123-45-67890',
      representative: '김대표',
      address: '서울시 강남구 테헤란로 123',
      phone: '02-1234-5678',
      email: 'info@smartpartner.com',
      website: 'https://smartpartner.com',
      description: '스마트한 파트너십을 통한 성공적인 비즈니스',
      referralCodeDefault: 'SP001',
      isActive: true,
    },
  });

  // 기본 수익 아이템 생성
  const profitItem = await prisma.profitItem.upsert({
    where: { id: 'default-profit' },
    update: {},
    create: {
      id: 'default-profit',
      name: '기본 수익 구조',
      status: 'ACTIVE',
      isDefault: true,
      insurance: 50000,
      telecom: 30000,
      rental: 80000,
      events: 100000,
      insurancePercent: 30,
      telecomPercent: 30,
      rentalPercent: 40,
      eventsPercent: 100,
      insuranceName: '보험료(월)',
      telecomName: '통신비(월)',
      rentalName: '렌탈료(월)',
      eventsName: '이벤트(건)',
    },
  });

  // 기본 아이템 설정 생성
  const itemSettings = [
    {
      category: 'INSURANCE',
      provider: '삼성생명',
      productName: '종신보험',
      paymentTerm: '월납',
      baseAmount: 50000,
      expectedRate: 30,
      pointRate: 5,
      pointAmount: 2500,
    },
    {
      category: 'RENTAL',
      provider: '렌탈업체',
      productName: '가전렌탈',
      paymentTerm: '월납',
      baseAmount: 80000,
      expectedRate: 40,
      pointRate: 8,
      pointAmount: 6400,
    },
    {
      category: 'INTERNET_TV',
      provider: 'SK브로드밴드',
      productName: '인터넷+TV',
      paymentTerm: '월납',
      baseAmount: 30000,
      expectedRate: 30,
      pointRate: 6,
      pointAmount: 1800,
    },
  ];

  for (const setting of itemSettings) {
    await prisma.itemSetting.create({
      data: setting,
    });
  }

  // 시스템 설정 생성
  const systemConfigs = [
    {
      key: 'POINT_RATE_DEFAULT',
      value: '5',
      description: '기본 포인트 적립률 (%)',
      category: 'POINTS',
    },
    {
      key: 'COMMISSION_RATE_DEFAULT',
      value: '30',
      description: '기본 수수료율 (%)',
      category: 'COMMISSION',
    },
    {
      key: 'SETTLEMENT_CYCLE',
      value: 'MONTHLY',
      description: '정산 주기',
      category: 'SETTLEMENT',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }

  console.log('✅ 기본 데이터 설정 완료!');
  console.log('📊 생성된 데이터:');
  console.log(`   - 회사 정보: ${companyInfo.companyName}`);
  console.log(`   - 수익 아이템: ${profitItem.name}`);
  console.log(`   - 아이템 설정: ${itemSettings.length}개`);
  console.log(`   - 시스템 설정: ${systemConfigs.length}개`);
}

main()
  .catch((e) => {
    console.error('❌ 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
