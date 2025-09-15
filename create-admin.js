const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔍 관리자 계정 생성 시작...');

    // 기본 관리자 계정 생성
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        name: '관리자',
        phone: '010-0000-0000',
        email: 'admin@dbkorea.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        partnerStatus: 'APPROVED',
        agreeTerms: true,
        agreeTermsAt: new Date(),
        marketingAgreed: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ 관리자 계정 생성 완료:', admin);

    // 슈퍼 관리자 계정 생성
    const superAdmin = await prisma.user.create({
      data: {
        name: '슈퍼관리자',
        phone: '010-1111-1111',
        email: 'superadmin@dbkorea.com',
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        partnerStatus: 'APPROVED',
        agreeTerms: true,
        agreeTermsAt: new Date(),
        marketingAgreed: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ 슈퍼관리자 계정 생성 완료:', superAdmin);

    // 회사 정보 생성
    const companyInfo = await prisma.companyInfo.create({
      data: {
        companyName: 'DB코리아',
        businessNumber: '123-45-67890',
        representative: '대표이사',
        address: '서울시 강남구',
        phone: '02-1234-5678',
        email: 'info@dbkorea.com',
        website: 'https://dbkorea.com',
        description: '정산관리 시스템',
        referralCodeDefault: 'DBKOREA',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ 회사 정보 생성 완료:', companyInfo);

    console.log('\n🎉 관리자 계정 및 회사 정보 생성 완료!');
    console.log('📋 로그인 정보:');
    console.log('   - 관리자: admin@dbkorea.com / admin123');
    console.log('   - 슈퍼관리자: superadmin@dbkorea.com / admin123');
    
  } catch (error) {
    console.error('❌ 관리자 계정 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
