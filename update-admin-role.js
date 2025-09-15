const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateAdminRole() {
  try {
    console.log('🔍 관리자 권한을 SUPER_ADMIN으로 변경...');

    const updatedAdmin = await prisma.admin.update({
      where: { email: 'admin@dbkorea.com' },
      data: {
        role: 'SUPER_ADMIN',
        updatedAt: new Date(),
      },
    });

    console.log('✅ 관리자 권한 변경 완료!');
    console.log('📋 업데이트된 정보:');
    console.log(`   - 이메일: ${updatedAdmin.email}`);
    console.log(`   - 이름: ${updatedAdmin.name}`);
    console.log(`   - 권한: ${updatedAdmin.role}`);
    console.log(`   - 상태: ${updatedAdmin.status}`);

  } catch (error) {
    console.error('❌ 관리자 권한 변경 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole();
