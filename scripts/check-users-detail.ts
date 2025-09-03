import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsersDetail() {
  try {
    console.log('🔍 사용자 상세 정보 확인 중...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('\n📋 전체 사용자 목록:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   📱 전화번호: ${user.phone}`);
      console.log(`   🛡️ 역할: ${user.role}`);
      console.log(`   📊 상태: ${user.status} (활성: ${user.isActive})`);
      console.log(`   📅 생성일: ${user.createdAt.toLocaleString('ko-KR')}`);
      console.log('');
    });
    
    // 전화번호 패턴 분석
    console.log('📊 전화번호 패턴 분석:');
    const phonePatterns = users.map(u => u.phone).filter(Boolean);
    const uniquePatterns = [...new Set(phonePatterns)];
    
    uniquePatterns.forEach(pattern => {
      const count = phonePatterns.filter(p => p === pattern).length;
      console.log(`   • ${pattern}: ${count}명`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersDetail();
