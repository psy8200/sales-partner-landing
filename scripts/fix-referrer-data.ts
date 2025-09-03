import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixReferrerData() {
  try {
    console.log('🔧 파트너신청 데이터의 referrer 필드 업데이트 시작...');

    // 모든 파트너신청 데이터를 가져옴
    const applications = await prisma.partnerApplication.findMany({
      include: {
        user: {
          select: {
            referralCode: true,
          },
        },
      },
    });

    console.log(`📊 총 ${applications.length}개의 파트너신청 데이터 발견`);

    let updatedCount = 0;
    let emptyReferrerCount = 0;

    for (const application of applications) {
      const userReferralCode = application.user?.referralCode;
      
      if (!application.referrer || application.referrer === '-') {
        if (userReferralCode) {
          // referrer가 비어있고 사용자에게 referralCode가 있는 경우 업데이트
          await prisma.partnerApplication.update({
            where: { id: application.id },
            data: { referrer: userReferralCode },
          });
          console.log(`✅ 업데이트: ${application.id} -> ${userReferralCode}`);
          updatedCount++;
        } else {
          console.log(`⚠️ 사용자 referralCode 없음: ${application.id}`);
          emptyReferrerCount++;
        }
      } else {
        console.log(`ℹ️ 이미 referrer 있음: ${application.id} -> ${application.referrer}`);
      }
    }

    console.log('\n📈 업데이트 결과:');
    console.log(`✅ 업데이트된 데이터: ${updatedCount}개`);
    console.log(`⚠️ referralCode 없는 사용자: ${emptyReferrerCount}개`);
    console.log(`ℹ️ 이미 referrer 있는 데이터: ${applications.length - updatedCount - emptyReferrerCount}개`);

    // 최종 확인
    const finalCheck = await prisma.partnerApplication.findMany({
      select: {
        id: true,
        referrer: true,
        user: {
          select: {
            name: true,
            referralCode: true,
          },
        },
      },
    });

    console.log('\n🔍 최종 확인:');
    finalCheck.forEach(app => {
      console.log(`ID: ${app.id}, Referrer: "${app.referrer}", User: ${app.user.name}, UserReferralCode: "${app.user.referralCode}"`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixReferrerData();
