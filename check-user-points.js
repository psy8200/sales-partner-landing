const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserPoints() {
  try {
    // 01033331234 회원 정보 조회
    const user = await prisma.user.findFirst({
      where: { phone: '01033331234' },
      select: {
        id: true,
        name: true,
        phone: true,
        finalPoints: true,
        remainingPoints: true,
        totalPaidPoints: true
      }
    });

    console.log('회원 정보:', user);

    // 해당 회원의 출금신청 조회
    const withdrawalRequest = await prisma.withdrawalRequest.findFirst({
      where: { userPhone: '01033331234' },
      select: {
        id: true,
        userName: true,
        userPhone: true,
        finalPoints: true,
        withdrawablePoints: true,
        totalAmount: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('출금신청 정보:', withdrawalRequest);

    if (user && withdrawalRequest) {
      console.log('\n=== 계산 검증 ===');
      console.log('출금가능금액:', withdrawalRequest.withdrawablePoints);
      console.log('출금신청금액:', withdrawalRequest.totalAmount);
      console.log('계산된 잔여포인트:', withdrawalRequest.withdrawablePoints - withdrawalRequest.totalAmount);
      console.log('실제 User.remainingPoints:', user.remainingPoints);
      console.log('차이:', (withdrawalRequest.withdrawablePoints - withdrawalRequest.totalAmount) - user.remainingPoints);
    }

  } catch (error) {
    console.error('오류:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserPoints();


