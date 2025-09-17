const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkContracts() {
  try {
    console.log('🔍 계약 데이터 확인...');

    const contracts = await prisma.contract.findMany({
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        contractAmount: true,
        status: true,
        contractDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 현재 계약 데이터: ${contracts.length}건`);
    
    if (contracts.length > 0) {
      contracts.forEach((contract, index) => {
        console.log(`${index + 1}. ${contract.customerName} (${contract.customerPhone}) - ${contract.contractAmount.toLocaleString()}원 - ${contract.status} - ${contract.contractDate}`);
      });
    } else {
      console.log('❌ 계약 데이터가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 계약 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContracts();





