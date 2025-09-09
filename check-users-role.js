const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });
    console.log('현재 사용자 목록:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role} - ${user.status}`);
    });
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
