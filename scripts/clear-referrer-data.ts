import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearReferrerData() {
  try {
    console.log('🧹 파트너신청 referrer 데이터 정리 중...\n');

    // 모든 파트너신청의 referrer를 빈 값으로 업데이트
    const result = await prisma.partnerApplication.updateMany({
      data: {
        referrer: '',
      },
    });

    console.log(`✅ ${result.count}개의 파트너신청 referrer를 빈 값으로 업데이트`);

    // 확인
    const applications = await prisma.partnerApplication.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });

    console.log('\n📊 확인:');
    applications.forEach((app, index) => {
      console.log(`\n=== 파트너신청 #${index + 1} ===`);
      console.log(`사용자: ${app.user.name} (${app.user.email})`);
      console.log(`사용자 referralCode: "${app.user.referralCode}"`);
      console.log(`파트너신청 referrer: "${app.referrer}"`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearReferrerData();
