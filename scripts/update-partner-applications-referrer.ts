import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updatePartnerApplicationsReferrer() {
  try {
    console.log('🔧 파트너신청 referrer 필드를 기본추천인코드로 업데이트 중...\n');

    // 기본추천인코드 가져오기
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      select: { referralCodeDefault: true },
    });

    const defaultReferralCode = companyInfo?.referralCodeDefault || 'SP001';
    console.log(`📋 기본추천인코드: ${defaultReferralCode}`);

    // 모든 파트너신청의 referrer를 기본추천인코드로 업데이트
    const result = await prisma.partnerApplication.updateMany({
      data: {
        referrer: defaultReferralCode,
      },
    });

    console.log(`✅ ${result.count}개의 파트너신청 referrer를 ${defaultReferralCode}로 업데이트`);

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

updatePartnerApplicationsReferrer().then(() => prisma.$disconnect());
