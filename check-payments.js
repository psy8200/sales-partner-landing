const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPayments() {
  try {
    console.log('🔍 수금관리 데이터 확인...');

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

    console.log(`📊 현재 수금 데이터: ${payments.length}건`);
    
    if (payments.length > 0) {
      payments.forEach((payment, index) => {
        console.log(`${index + 1}. ID: ${payment.id} - ${payment.amount.toLocaleString()}원 - ${payment.type} - ${payment.status} - ${payment.dueDate}`);
      });
    } else {
      console.log('❌ 수금 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 수금 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPayments();
