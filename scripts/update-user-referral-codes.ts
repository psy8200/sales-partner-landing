import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUserReferralCodes() {
  try {
    console.log('🔧 사용자 referralCode 업데이트 시작...');

    // 모든 사용자 데이터를 가져옴
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
    });

    console.log(`📊 총 ${users.length}명의 사용자 발견`);

    let updatedCount = 0;
    let alreadyHasCodeCount = 0;

    for (const user of users) {
      if (!user.referralCode || user.referralCode === 'null') {
        // 기본 추천인코드 생성 (이름 기반)
        const defaultCode = `SP${user.name.substring(0, 2)}${Date.now().toString().slice(-4)}`;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode: defaultCode },
        });
        
        console.log(`✅ 업데이트: ${user.name} (${user.email}) -> ${defaultCode}`);
        updatedCount++;
      } else {
        console.log(`ℹ️ 이미 referralCode 있음: ${user.name} -> ${user.referralCode}`);
        alreadyHasCodeCount++;
      }
    }

    console.log('\n📈 업데이트 결과:');
    console.log(`✅ 업데이트된 사용자: ${updatedCount}명`);
    console.log(`ℹ️ 이미 referralCode 있는 사용자: ${alreadyHasCodeCount}명`);

    // 최종 확인
    const finalCheck = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
    });

    console.log('\n🔍 최종 확인:');
    finalCheck.forEach(user => {
      console.log(`사용자: ${user.name} (${user.email}), ReferralCode: "${user.referralCode}"`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserReferralCodes();
