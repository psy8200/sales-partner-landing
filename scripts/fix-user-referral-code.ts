import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserReferralCode() {
  try {
    console.log('🔧 사용자 referralCode 수정 중...\n');

    // 모든 사용자의 referralCode를 58248200으로 업데이트
    const result = await prisma.user.updateMany({
      data: {
        referralCode: '58248200',
      },
    });

    console.log(`✅ ${result.count}명의 사용자 referralCode를 58248200으로 업데이트`);

    // 파트너신청의 referrer도 58248200으로 업데이트
    const partnerResult = await prisma.partnerApplication.updateMany({
      data: {
        referrer: '58248200',
      },
    });

    console.log(`✅ ${partnerResult.count}개의 파트너신청 referrer를 58248200으로 업데이트`);

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

fixUserReferralCode();
