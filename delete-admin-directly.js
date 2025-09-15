const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAdminDirectly() {
  try {
    console.log('🔍 관리자 직접 삭제...');

    // 삭제할 관리자 ID (터미널 로그에서 확인된 ID)
    const adminIdToDelete = 'cmfk29qhj0000ary8y9fcr8qj';

    // 먼저 관련된 AdminLoginLog 삭제
    console.log('📤 관련 로그 삭제 중...');
    const deletedLogs = await prisma.adminLoginLog.deleteMany({
      where: {
        adminId: adminIdToDelete
      }
    });
    console.log(`✅ 삭제된 로그: ${deletedLogs.count}건`);

    // 관리자 삭제
    console.log('📤 관리자 삭제 중...');
    const deletedAdmin = await prisma.admin.delete({
      where: {
        id: adminIdToDelete
      }
    });

    console.log('✅ 관리자 삭제 완료!');
    console.log(`삭제된 관리자: ${deletedAdmin.name} (${deletedAdmin.email})`);

  } catch (error) {
    console.error('❌ 관리자 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAdminDirectly();
