const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkOtherUsers() {
  try {
    console.log('=== 다른 사용자 확인 ===\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      }
    });

    console.log(`총 ${users.length}명의 사용자가 있습니다:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   이름: ${user.name}`);
      console.log(`   이메일: ${user.email}`);
      console.log(`   전화번호: ${user.phone}`);
      console.log(`   역할: ${user.role}`);
      console.log('   ---');
    });

    // 각 사용자별 프로필변경요청 개수 확인
    console.log('\n=== 사용자별 프로필변경요청 개수 ===\n');
    
    for (const user of users) {
      const requestCount = await prisma.profileChangeRequest.count({
        where: {
          AND: [
            { userId: user.id },
            { userName: user.name },
            { userPhone: user.phone }
          ]
        }
      });
      
      console.log(`${user.name} (${user.phone}): ${requestCount}개 요청`);
    }

  } catch (error) {
    console.error('사용자 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOtherUsers();


