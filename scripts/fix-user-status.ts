import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserStatus() {
  try {
    console.log('=== 사용자 파트너상태 수정 ===\n');

    // PARTNER_APPLIED 상태인 사용자 찾기
    const usersToFix = await prisma.user.findMany({
      where: {
        partnerStatus: 'PARTNER_APPLIED'
      },
      select: {
        id: true,
        name: true,
        email: true,
        partnerStatus: true
      }
    });

    console.log(`수정이 필요한 사용자: ${usersToFix.length}명`);
    
    if (usersToFix.length === 0) {
      console.log('수정할 사용자가 없습니다.');
      return;
    }

    usersToFix.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   현재 상태: ${user.partnerStatus}`);
    });

    // 사용자 상태 수정
    const updateResult = await prisma.user.updateMany({
      where: {
        partnerStatus: 'PARTNER_APPLIED'
      },
      data: {
        partnerStatus: 'NOT_APPLIED',
        updatedAt: new Date()
      }
    });

    console.log(`\n✅ 수정 완료: ${updateResult.count}명의 사용자 상태가 NOT_APPLIED로 변경되었습니다.`);

    // 수정 후 상태 확인
    console.log('\n=== 수정 후 상태 확인 ===');
    const updatedUsers = await prisma.user.findMany({
      where: {
        role: 'GENERAL'
      },
      select: {
        name: true,
        email: true,
        partnerStatus: true
      }
    });

    updatedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}: ${user.partnerStatus}`);
    });

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserStatus();
