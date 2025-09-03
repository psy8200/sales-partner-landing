import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 데이터베이스 연결 테스트 중...');
    
    // 연결 테스트
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공');
    
    // 사용자 수 확인
    const userCount = await prisma.user.count();
    console.log(`📊 총 사용자 수: ${userCount}`);
    
    // 일반회원 수 확인
    const generalCount = await prisma.user.count({
      where: { role: 'GENERAL' }
    });
    console.log(`👤 일반회원 수: ${generalCount}`);
    
    // 파트너회원 수 확인
    const partnerCount = await prisma.user.count({
      where: { role: 'MEMBER' }
    });
    console.log(`🤝 파트너회원 수: ${partnerCount}`);
    
    // 관리자 수 확인
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });
    console.log(`🛡️ 관리자 수: ${adminCount}`);
    
    // 샘플 사용자 조회
    const sampleUsers = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        partnerStatus: true
      }
    });
    
    console.log('📋 샘플 사용자:');
    sampleUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.role} / ${user.partnerStatus}`);
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 테스트 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
