const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 최근 포인트추가 신청 데이터 확인...');
    
    const recentRequests = await prisma.partnerApplication.findMany({
      where: {
        additionalNote: {
          contains: "선택된 아이템"
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    console.log(`📊 발견된 데이터: ${recentRequests.length}건\n`);
    
    for (const request of recentRequests) {
      console.log(`ID: ${request.id}`);
      console.log(`추천인코드: ${request.referrer}`);
      console.log(`상담종류: ${request.consultationType || 'null'}`);
      console.log(`메모: ${request.additionalNote}`);
      console.log(`생성일: ${request.createdAt}`);
      console.log('---');
    }

  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();





