const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function updateAdminPassword() {
  try {
    console.log('🔍 관리자 비밀번호 수정...');
    
    const hashedPassword = await bcrypt.hash('87587200', 12); // 새 비밀번호

    const updatedAdmin = await prisma.user.update({
      where: { email: 'admin@dbkorea.com' },
      data: {
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      },
    });

    console.log('✅ 관리자 비밀번호 수정 완료!');
    console.log('📋 로그인 정보:');
    console.log(`   - 이메일: ${updatedAdmin.email}`);
    console.log(`   - 전화번호: ${updatedAdmin.phone}`);
    console.log(`   - 비밀번호: 87587200`);
    console.log(`   - 권한: ${updatedAdmin.role}`);
    console.log(`   - 상태: ${updatedAdmin.status}`);

  } catch (error) {
    console.error('❌ 관리자 비밀번호 수정 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPassword();





