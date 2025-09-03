import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserData() {
  try {
    console.log('🔍 사용자 데이터 확인 중...\n');

    // 모든 사용자 데이터 확인
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        referralCode: true,
        points: true,
        bankName: true,
        accountHolder: true,
        bankAccount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📊 총 ${users.length}명의 사용자 데이터:`);
    users.forEach((user, index) => {
      console.log(`\n=== 사용자 #${index + 1} ===`);
      console.log(`ID: ${user.id}`);
      console.log(`이름: "${user.name}"`);
      console.log(`이메일: "${user.email}"`);
      console.log(`전화번호: "${user.phone}"`);
      console.log(`추천인코드: "${user.referralCode}"`);
      console.log(`포인트: ${user.points}`);
      console.log(`은행명: "${user.bankName}"`);
      console.log(`예금주: "${user.accountHolder}"`);
      console.log(`계좌번호: "${user.bankAccount}"`);
      console.log(`가입일: ${user.createdAt}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserData();
