const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfileRequests() {
  try {
    console.log('=== 프로필변경요청 데이터 확인 ===\n');
    
    const requests = await prisma.profileChangeRequest.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        userName: true,
        userPhone: true,
        content: true,
        status: true,
        createdAt: true,
      }
    });

    console.log(`총 ${requests.length}개의 요청이 있습니다:\n`);
    
    requests.forEach((request, index) => {
      console.log(`${index + 1}. ID: ${request.id}`);
      console.log(`   사용자ID: ${request.userId}`);
      console.log(`   이름: ${request.userName}`);
      console.log(`   전화번호: ${request.userPhone}`);
      console.log(`   내용: ${request.content}`);
      console.log(`   상태: ${request.status}`);
      console.log(`   생성일: ${request.createdAt}`);
      console.log('   ---');
    });

    // 특정 사용자로 필터링 테스트
    console.log('\n=== 특정 사용자 필터링 테스트 ===');
    const testUserId = 'cmfbx21z50003arawod5d54wo';
    const testUserName = '박수용';
    const testUserPhone = '01011111234';
    
    const filteredRequests = await prisma.profileChangeRequest.findMany({
      where: {
        AND: [
          { userId: testUserId },
          { userName: testUserName },
          { userPhone: testUserPhone }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        userName: true,
        userPhone: true,
        content: true,
        status: true,
        createdAt: true,
      }
    });

    console.log(`\n필터링 결과: ${filteredRequests.length}개의 요청`);
    filteredRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.userName} (${request.userPhone}) - ${request.content}`);
    });

  } catch (error) {
    console.error('데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfileRequests();


