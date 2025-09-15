const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTempAdmin() {
  try {
    console.log('🔍 임시 관리자 계정 생성...');

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

    console.log('✅ 임시 관리자 계정 생성 완료!');
    console.log('📋 로그인 정보:');
    console.log('   - 이메일: admin@dbkorea.com');
    console.log('   - 비밀번호: admin123');
    
  } catch (error) {
    console.error('❌ 관리자 계정 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTempAdmin();
