const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🔍 최고관리자 계정 생성...');
    
    const hashedPassword = await bcrypt.hash('admin123', 12); // 기본 비밀번호

    const superAdmin = await prisma.user.upsert({
      where: { email: 'admin@dbkorea.com' },
      update: {
        name: '최고관리자',
        phone: '01000000000',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        partnerStatus: 'APPROVED',
        isActive: true,
        agreeTerms: true,
        updatedAt: new Date(),
      },
      create: {
        email: 'admin@dbkorea.com',
        phone: '01000000000',
        name: '최고관리자',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        partnerStatus: 'APPROVED',
        agreeTerms: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ 최고관리자 계정 생성 완료!');
    console.log('📋 로그인 정보:');
    console.log(`   - 이메일: ${superAdmin.email}`);
    console.log(`   - 전화번호: ${superAdmin.phone}`);
    console.log(`   - 비밀번호: admin123`);
    console.log(`   - 권한: ${superAdmin.role}`);
    console.log(`   - 상태: ${superAdmin.status}`);

  } catch (error) {
    console.error('❌ 최고관리자 계정 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
