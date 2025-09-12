const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // 기존 관리자 확인
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('이미 관리자 사용자가 존재합니다:', existingAdmin.email);
      return;
    }

    // 관리자 사용자 생성
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        name: '관리자',
        email: 'admin@admin.com',
        phone: '010-0000-0000',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        agreeTerms: true,
        agreeTermsAt: new Date(),
        marketingAgreed: true,
        marketingAgreedAt: new Date(),
      }
    });

    console.log('관리자 사용자가 생성되었습니다:', adminUser.email);
    console.log('로그인 정보:');
    console.log('- 이메일: admin@admin.com');
    console.log('- 비밀번호: admin123');
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();



