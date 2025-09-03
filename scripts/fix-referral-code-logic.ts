import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReferralCodeLogic() {
  try {
    console.log('🔧 추천인코드 로직 수정 시작...\n');

    // 1. 사용자의 referralCode를 null로 되돌리기
    console.log('1️⃣ 사용자 referralCode를 null로 되돌리는 중...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
    });

    let updatedUsers = 0;
    for (const user of users) {
      if (user.referralCode && user.referralCode.startsWith('SP') && user.referralCode.length > 10) {
        // 제가 임의로 생성한 referralCode를 null로 되돌리기
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: null },
        });
        console.log(`✅ ${user.name} (${user.email})의 referralCode를 null로 되돌림`);
        updatedUsers++;
      }
    }

    console.log(`\n📊 사용자 업데이트 완료: ${updatedUsers}명`);

    // 2. 파트너신청의 referrer 필드를 기본추천인코드로 업데이트
    console.log('\n2️⃣ 파트너신청 referrer 필드를 기본추천인코드로 업데이트 중...');
    
    // 기본추천인코드 가져오기
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      select: { referralCodeDefault: true },
    });

    const defaultReferralCode = companyInfo?.referralCodeDefault || 'SP001';
    console.log(`📋 기본추천인코드: ${defaultReferralCode}`);

    const applications = await prisma.partnerApplication.findMany({
      include: {
        user: {
          select: {
            referralCode: true,
          },
        },
      },
    });

    let updatedApplications = 0;
    for (const application of applications) {
      const userReferralCode = application.user?.referralCode;
      
      if (!userReferralCode || userReferralCode === 'null') {
        // 사용자가 추천인코드를 입력하지 않은 경우 기본추천인코드 사용
        await prisma.partnerApplication.update({
          where: { id: application.id },
          data: { referrer: defaultReferralCode },
        });
        console.log(`✅ 파트너신청 #${application.id}의 referrer를 ${defaultReferralCode}로 업데이트`);
        updatedApplications++;
      } else {
        // 사용자가 추천인코드를 입력한 경우 그 값 사용
        await prisma.partnerApplication.update({
          where: { id: application.id },
          data: { referrer: userReferralCode },
        });
        console.log(`✅ 파트너신청 #${application.id}의 referrer를 ${userReferralCode}로 업데이트`);
        updatedApplications++;
      }
    }

    console.log(`\n📊 파트너신청 업데이트 완료: ${updatedApplications}개`);

    // 3. 최종 확인
    console.log('\n3️⃣ 최종 확인:');
    const finalApplications = await prisma.partnerApplication.findMany({
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

    finalApplications.forEach((app, index) => {
      console.log(`\n=== 파트너신청 #${index + 1} ===`);
      console.log(`사용자: ${app.user.name} (${app.user.email})`);
      console.log(`사용자 referralCode: "${app.user.referralCode}"`);
      console.log(`파트너신청 referrer: "${app.referrer}"`);
    });

    console.log('\n✅ 추천인코드 로직 수정 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReferralCodeLogic().then(() => prisma.$disconnect());
