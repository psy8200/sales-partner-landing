const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 포인트추가 신청 데이터 확인 중...');
    
    // additionalNote에 "선택된 아이템"이 포함된 데이터 찾기
    const pointAddRequests = await prisma.partnerApplication.findMany({
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
      }
    });

    console.log(`📊 발견된 포인트추가 신청: ${pointAddRequests.length}건`);
    
    for (const request of pointAddRequests) {
      console.log(`\n📝 ID: ${request.id}`);
      console.log(`   메모: ${request.additionalNote}`);
      console.log(`   현재 상담종류: ${request.consultationType || 'null'}`);
      console.log(`   추천인코드: ${request.referrer}`);
    }

    // consultationType이 null이거나 "파트너신청"인 경우 "포인트추가"로 업데이트
    const updateCount = await prisma.partnerApplication.updateMany({
      where: {
        additionalNote: {
          contains: "선택된 아이템"
        },
        OR: [
          { consultationType: null },
          { consultationType: "파트너신청" }
        ]
      },
      data: {
        consultationType: "포인트추가"
      }
    });

    console.log(`\n✅ 업데이트 완료: ${updateCount.count}건의 데이터가 "포인트추가"로 변경되었습니다.`);

    // 업데이트 후 결과 확인
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
      }
    });

    console.log('\n📋 업데이트 후 결과:');
    for (const request of updatedRequests) {
      console.log(`   ID: ${request.id} | 상담종류: ${request.consultationType} | 추천인코드: ${request.referrer}`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();





