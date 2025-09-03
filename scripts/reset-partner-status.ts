import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetPartnerStatus() {
  try {
    console.log('🔄 일반회원들의 파트너상태를 NOT_APPLIED로 초기화 중...');
    
    // 일반회원들의 파트너상태를 NOT_APPLIED로 변경
    const updatedUsers = await prisma.user.updateMany({
      where: {
        role: 'GENERAL',
        partnerStatus: {
          not: 'NOT_APPLIED'
        }
      },
      data: {
        partnerStatus: 'NOT_APPLIED'
      }
    });
    
    console.log(`✅ ${updatedUsers.count}명의 일반회원 파트너상태가 NOT_APPLIED로 초기화되었습니다.`);
    
    // 변경된 사용자 목록 확인
    const users = await prisma.user.findMany({
      where: {
        role: 'GENERAL'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        partnerStatus: true
      }
    });
    
    console.log('\n📋 일반회원 파트너상태 현황:');
    users.forEach(user => {
      console.log(`  • ${user.name} (${user.phone}): ${user.partnerStatus}`);
    });
    
  } catch (error) {
    console.error('❌ 파트너상태 초기화 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
resetPartnerStatus()
  .then(() => {
    console.log('\n🎉 파트너상태 초기화 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 파트너상태 초기화 실패:', error);
    process.exit(1);
  });
