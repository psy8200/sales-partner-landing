import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 데이터베이스 설정을 시작합니다...');

  // 1. 기본 관리자 계정 생성
  console.log('📝 기본 관리자 계정을 생성합니다...');
  
  const adminPassword = await bcrypt.hash('admin123!@#', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@salespartners.com' },
    update: {},
    create: {
      email: 'admin@salespartners.com',
      phone: '010-0000-0000',
      name: '시스템 관리자',
      passwordHash: adminPassword,
      status: 'ACTIVE',
      role: 'ADMIN',
      marketingAgreed: false,
    },
  });

  console.log('✅ 관리자 계정 생성 완료:', admin.email);

  // 2. 시스템 설정 초기화
  console.log('⚙️ 시스템 설정을 초기화합니다...');
  
  const systemConfigs = [
    {
      key: 'SITE_NAME',
      value: 'Sales Partners',
      description: '사이트 이름',
      category: 'GENERAL',
    },
    {
      key: 'SITE_DESCRIPTION',
      value: '매월 내는 돈을 수익으로 바꾸는 프리미엄 파트너십',
      description: '사이트 설명',
      category: 'GENERAL',
    },
    {
      key: 'DEFAULT_COMMISSION_RATE',
      value: '0.05',
      description: '기본 수수료율 (5%)',
      category: 'BUSINESS',
    },
    {
      key: 'MIN_PAYMENT_AMOUNT',
      value: '10000',
      description: '최소 지급 금액',
      category: 'BUSINESS',
    },
    {
      key: 'SETTLEMENT_CYCLE',
      value: 'MONTHLY',
      description: '정산 주기',
      category: 'BUSINESS',
    },
    {
      key: 'SUPPORT_EMAIL',
      value: 'support@salespartners.com',
      description: '고객지원 이메일',
      category: 'CONTACT',
    },
    {
      key: 'SUPPORT_PHONE',
      value: '1588-0000',
      description: '고객지원 전화번호',
      category: 'CONTACT',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config,
    });
  }

  console.log('✅ 시스템 설정 초기화 완료');

  // 3. 샘플 데이터 생성 (개발 환경에서만)
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 개발용 샘플 데이터를 생성합니다...');
    
    // 샘플 사용자 생성
    const sampleUsers = [];
    for (let i = 1; i <= 10; i++) {
      const password = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email: `user${i}@example.com`,
          phone: `010-1234-${String(i).padStart(4, '0')}`,
          name: `테스트 사용자 ${i}`,
          passwordHash: password,
          status: 'ACTIVE',
          role: 'MEMBER',
          marketingAgreed: Math.random() > 0.5,
        },
      });
      sampleUsers.push(user);
    }

    // 샘플 상담 데이터 생성
    const consultationTypes = ['GENERAL', 'PRODUCT_INQUIRY', 'TECHNICAL_SUPPORT', 'COMPLAINT', 'PARTNERSHIP'];
    const consultationStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    
    for (let i = 1; i <= 20; i++) {
      await prisma.consultation.create({
        data: {
          userId: sampleUsers[Math.floor(Math.random() * sampleUsers.length)].id,
          type: consultationTypes[Math.floor(Math.random() * consultationTypes.length)] as any,
          status: consultationStatuses[Math.floor(Math.random() * consultationStatuses.length)] as any,
          priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)] as any,
          title: `상담 제목 ${i}`,
          description: `상담 내용 ${i}입니다.`,
          category: '일반상담',
          tags: ['상담', '문의'],
          contactName: `연락처 ${i}`,
          contactPhone: `010-9876-${String(i).padStart(4, '0')}`,
          contactEmail: `contact${i}@example.com`,
          requestedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // 샘플 신청 데이터 생성
    const applicationTypes = ['INSURANCE', 'TELECOM', 'RENTAL', 'FUNERAL', 'SHOPPING'];
    const applicationStatuses = ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    
    for (let i = 1; i <= 30; i++) {
      await prisma.application.create({
        data: {
          userId: sampleUsers[Math.floor(Math.random() * sampleUsers.length)].id,
          type: applicationTypes[Math.floor(Math.random() * applicationTypes.length)] as any,
          status: applicationStatuses[Math.floor(Math.random() * applicationStatuses.length)] as any,
          priority: ['LOW', 'NORMAL', 'HIGH', 'URGENT'][Math.floor(Math.random() * 4)] as any,
          productName: `상품 ${i}`,
          productCategory: '일반상품',
          productDetails: { description: `상품 상세 ${i}` },
          monthlyAmount: Math.floor(Math.random() * 100000) + 10000,
          totalAmount: Math.floor(Math.random() * 1000000) + 100000,
          commissionRate: 0.05,
          expectedCommission: Math.floor(Math.random() * 50000) + 5000,
          applicantName: `신청자 ${i}`,
          applicantPhone: `010-5555-${String(i).padStart(4, '0')}`,
          applicantEmail: `applicant${i}@example.com`,
          applicantAddress: `서울시 강남구 테헤란로 ${i}번길`,
        },
      });
    }

    console.log('✅ 샘플 데이터 생성 완료');
  }

  // 4. 마스터 계정 생성 (psy: ADMIN, psy777: MEMBER)
  console.log('🔐 마스터 계정을 생성합니다...');
  await prisma.user.upsert({
    where: { email: 'psy@local' },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
      isActive: true,
      name: 'Master Admin psy',
    },
    create: {
      email: 'psy@local',
      phone: '010-0000-0130',
      name: 'Master Admin psy',
      passwordHash: await bcrypt.hash('0130', 12),
      status: 'ACTIVE',
      role: 'ADMIN',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'psy777@local' },
    update: {
      role: 'MEMBER',
      status: 'ACTIVE',
      isActive: true,
      name: 'Master Member psy777',
    },
    create: {
      email: 'psy777@local',
      phone: '010-7777-0130',
      name: 'Master Member psy777',
      passwordHash: await bcrypt.hash('0130', 12),
      status: 'ACTIVE',
      role: 'MEMBER',
      isActive: true,
    },
  });

  console.log('✅ 마스터 계정 생성 완료');

  console.log('🎉 데이터베이스 설정이 완료되었습니다!');
  console.log('');
  console.log('📋 기본 계정 정보:');
  console.log('   이메일: admin@salespartners.com');
  console.log('   비밀번호: admin123!@#');
  console.log('');
  console.log('⚠️  프로덕션 환경에서는 반드시 기본 비밀번호를 변경하세요!');
}

main()
  .catch((e) => {
    console.error('❌ 데이터베이스 설정 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
