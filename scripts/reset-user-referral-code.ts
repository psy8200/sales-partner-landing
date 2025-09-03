import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetUserReferralCode() {
  try {
    console.log('🔧 사용자 referralCode를 null로 되돌리는 중...\n');

    // 모든 사용자의 referralCode를 null로 설정
    const result = await prisma.user.updateMany({
      data: {
        referralCode: null,
      },
    });

    console.log(`✅ ${result.count}명의 사용자 referralCode를 null로 되돌림`);

    // 확인
    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        referralCode: true,
      },
    });

    console.log('\n📊 확인:');
    users.forEach(user => {
      console.log(`사용자: ${user.name} (${user.email}), ReferralCode: "${user.referralCode}"`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetUserReferralCode().then(() => prisma.$disconnect());
