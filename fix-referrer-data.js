const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔧 포인트추가 신청 데이터의 추천인코드 수정 중...');
    
    // additionalNote에 "선택된 아이템"이 포함된 데이터 찾기
    const pointAddRequests = await prisma.partnerApplication.findMany({
      where: {
        additionalNote: {
          contains: "선택된 아이템"
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            referralCode: true
          }
        }
      }
    });

    console.log(`📊 발견된 포인트추가 신청: ${pointAddRequests.length}건\n`);
    
    for (const request of pointAddRequests) {
      console.log(`📝 ID: ${request.id}`);
      console.log(`   사용자: ${request.user?.name} (${request.user?.phone})`);
      console.log(`   현재 추천인코드: ${request.referrer}`);
      console.log(`   실제 추천인코드: ${request.user?.referralCode || '없음'}`);
      console.log(`   메모: ${request.additionalNote}`);
      console.log('   ---');
    }

    // 각 포인트추가 신청의 추천인코드를 실제 사용자의 추천인코드로 업데이트
    for (const request of pointAddRequests) {
      if (request.user?.referralCode) {
        await prisma.partnerApplication.update({
          where: { id: request.id },
          data: {
            referrer: request.user.referralCode
          }
        });
        console.log(`✅ ID ${request.id}: "${request.referrer}" → "${request.user.referralCode}"`);
      } else {
        console.log(`⚠️ ID ${request.id}: 사용자 추천인코드가 없음`);
      }
    }

    console.log('\n🎉 추천인코드 수정 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();





