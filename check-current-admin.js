const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCurrentAdmin() {
  try {
    console.log('🔍 현재 관리자 정보 확인...');

    // 현재 Admin 테이블의 모든 관리자 조회
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 현재 관리자 수: ${admins.length}명`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role} - ${admin.status} - ID: ${admin.id}`);
      });
    } else {
      console.log('❌ 관리자가 없습니다.');
    }

    // SUPER_ADMIN 권한을 가진 관리자 확인
    const superAdmins = admins.filter(admin => admin.role === 'SUPER_ADMIN');
    console.log(`\n🔍 SUPER_ADMIN 권한 관리자: ${superAdmins.length}명`);
    
    if (superAdmins.length > 0) {
      superAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email}) - ID: ${admin.id}`);
      });
    } else {
      console.log('❌ SUPER_ADMIN 권한을 가진 관리자가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 관리자 정보 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentAdmin();





