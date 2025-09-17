const { PrismaClient } = require('@prisma/client');

// GitHub 최신 데이터베이스 사용
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./latest-github.db"
    }
  }
});

async function checkGitHubPayments() {
  try {
    console.log('🔍 GitHub 최신 커밋의 수금 데이터 확인...');

    const payments = await prisma.payment.findMany({
      select: {
        id: true,
        userId: true,
        amount: true,
        type: true,
        status: true,
        dueDate: true,
        paidDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 GitHub 수금 데이터: ${payments.length}건`);
    
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. ID: ${payment.id} - ${payment.amount.toLocaleString()}원 - ${payment.type} - ${payment.status} - ${payment.dueDate}`);
      });
    } else {
      console.log('❌ GitHub에도 수금 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('❌ GitHub 수금 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGitHubPayments();





