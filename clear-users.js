const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearUsers() {
  try {
    console.log('🔍 기존 사용자 데이터 삭제 중...');
    const result = await prisma.user.deleteMany({});
    console.log(`✅ ${result.count}명의 사용자 데이터 삭제 완료`);
  } catch (error) {
    console.error('❌ 사용자 데이터 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearUsers();
