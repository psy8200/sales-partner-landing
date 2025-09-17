const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createAdminInAdminTable() {
  try {
    console.log('🔍 Admin 테이블에 관리자 계정 생성...');
    
    const hashedPassword = await bcrypt.hash('87587200', 12); // 비밀번호

    const admin = await prisma.admin.upsert({
      where: { email: 'admin@dbkorea.com' },
      update: {
        name: '최고관리자',
        phone: '01000000000',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        joinDate: new Date(),
        updatedAt: new Date(),
      },
      create: {
        email: 'admin@dbkorea.com',
        phone: '01000000000',
        name: '최고관리자',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        joinDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('✅ Admin 테이블에 관리자 계정 생성 완료!');
    console.log('📋 로그인 정보:');
    console.log(`   - 이메일: ${admin.email}`);
    console.log(`   - 전화번호: ${admin.phone}`);
    console.log(`   - 비밀번호: 87587200`);
    console.log(`   - 권한: ${admin.role}`);
    console.log(`   - 상태: ${admin.status}`);

  } catch (error) {
    console.error('❌ Admin 테이블 관리자 계정 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminInAdminTable();





