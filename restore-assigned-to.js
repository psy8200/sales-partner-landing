const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function restoreAssignedTo() {
  try {
    // 사용 가능한 담당자 목록 조회
    const managers = await prisma.admin.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        role: true
      }
    });
    
    console.log('사용 가능한 담당자 목록:');
    managers.forEach(manager => {
      console.log(`ID: ${manager.id}, 이름: ${manager.name}, 역할: ${manager.role}`);
    });
    
    // 상담이력의 담당자를 첫 번째 관리자 이름으로 변경
    if (managers.length > 0) {
      const firstManager = managers[0];
      
      const updatedConsultations = await prisma.consultation.updateMany({
        where: {
          assignedTo: 'admin'
        },
        data: {
          assignedTo: firstManager.name
        }
      });
      
      console.log(`\n✅ ${updatedConsultations.count}개의 상담이력 담당자를 "${firstManager.name}"으로 변경했습니다.`);
    } else {
      console.log('사용 가능한 담당자가 없습니다.');
    }
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAssignedTo();





