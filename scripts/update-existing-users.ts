import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingUsers() {
  try {
    console.log('기존 사용자 데이터를 예비파트너로 업데이트 중...');

    // 기존 사용자들을 예비파트너로 업데이트
    const result = await prisma.user.updateMany({
      where: {
        role: {
          not: 'ADMIN' // 관리자는 제외
        }
      },
      data: {
        role: 'GENERAL', // 예비파트너로 설정
        partnerStatus: 'NOT_APPLIED', // 미신청 상태로 설정
      }
    });

    console.log(`총 ${result.count}명의 사용자가 예비파트너로 업데이트되었습니다.`);

    // 업데이트된 사용자 목록 확인
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        partnerStatus: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n업데이트된 사용자 목록:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role} / ${user.partnerStatus}`);
    });

  } catch (error) {
    console.error('사용자 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingUsers();
