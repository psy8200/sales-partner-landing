const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 포인트추가 신청 데이터의 상담종류 수정 중...');
    
    // additionalNote에 "선택된 아이템"이 포함된 데이터의 consultationType을 "포인트추가"로 업데이트
    const updateResult = await prisma.partnerApplication.updateMany({
      where: {
        additionalNote: {
          contains: "선택된 아이템"
        }
      },
      data: {
        consultationType: "포인트추가"
      }
    });

    console.log(`✅ 업데이트 완료: ${updateResult.count}건의 데이터가 수정되었습니다.`);

    // 수정 후 결과 확인
    const updatedRequests = await prisma.partnerApplication.findMany({
      where: {
        additionalNote: {
          contains: "선택된 아이템"
        }
      },
      select: {
        id: true,
        additionalNote: true,
        consultationType: true,
        referrer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('\n📋 수정 후 결과:');
    for (const request of updatedRequests) {
      console.log(`   ID: ${request.id}`);
      console.log(`   상담종류: ${request.consultationType}`);
      console.log(`   추천인코드: ${request.referrer}`);
      console.log(`   메모: ${request.additionalNote}`);
      console.log('   ---');
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();





