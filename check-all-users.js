const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllUsers() {
  try {
    console.log('🔍 모든 사용자 확인...');

    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      }
    });

    console.log(`📊 총 사용자: ${users.length}명`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.phone}`);
    });

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllUsers();





