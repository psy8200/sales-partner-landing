const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestRequest() {
  try {
    console.log('=== 다른 사용자의 테스트 요청 생성 ===\n');
    
    // 다른 사용자 정보로 테스트 요청 생성
    const testRequest = await prisma.profileChangeRequest.create({
      data: {
        userId: 'test-user-id-12345', // 다른 사용자 ID
        userName: '김테스트', // 다른 이름
        userPhone: '01099999999', // 다른 전화번호
        content: '테스트 요청입니다 - 다른 사용자',
        status: 'PENDING',
      },
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

    console.log('테스트 요청이 생성되었습니다:');
    console.log(`ID: ${testRequest.id}`);
    console.log(`사용자ID: ${testRequest.userId}`);
    console.log(`이름: ${testRequest.userName}`);
    console.log(`전화번호: ${testRequest.userPhone}`);
    console.log(`내용: ${testRequest.content}`);
    console.log(`상태: ${testRequest.status}`);
    console.log(`생성일: ${testRequest.createdAt}`);

    // 이제 필터링 테스트
    console.log('\n=== 필터링 테스트 ===');
    
    // 박수용 사용자로 필터링 (기존 사용자)
    const parkRequests = await prisma.profileChangeRequest.findMany({
      where: {
        AND: [
          { userId: 'cmfbx21z50003arawod5d54wo' },
          { userName: '박수용' },
          { userPhone: '01011111234' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userName: true,
        userPhone: true,
        content: true,
      }
    });

    console.log(`\n박수용 사용자 요청: ${parkRequests.length}개`);
    parkRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.content}`);
    });

    // 김테스트 사용자로 필터링 (새로 생성한 사용자)
    const kimRequests = await prisma.profileChangeRequest.findMany({
      where: {
        AND: [
          { userId: 'test-user-id-12345' },
          { userName: '김테스트' },
          { userPhone: '01099999999' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userName: true,
        userPhone: true,
        content: true,
      }
    });

    console.log(`\n김테스트 사용자 요청: ${kimRequests.length}개`);
    kimRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.content}`);
    });

  } catch (error) {
    console.error('테스트 요청 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestRequest();


