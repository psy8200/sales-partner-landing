const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simpleClear() {
  try {
    console.log('🔍 기존 데이터 삭제 시작...');
    
    // 정산 기록 삭제
    await prisma.settlementRecord.deleteMany({});
    console.log('✅ 정산 기록 삭제 완료');
    
    // 사용자 삭제
    await prisma.user.deleteMany({});
    console.log('✅ 사용자 삭제 완료');
    
    console.log('🎉 기존 데이터 삭제 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simpleClear();
