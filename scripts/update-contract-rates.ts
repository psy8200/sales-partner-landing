import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateContractRates() {
  try {
    console.log('기존 계약 데이터의 expectedRate와 pointRate 업데이트를 시작합니다...');

    // expectedRate나 pointRate가 null인 계약들을 찾아서 기본값 설정
    const contractsToUpdate = await prisma.contract.findMany({
      where: {
        OR: [
          { expectedRate: null },
          { pointRate: null }
        ]
      }
    });

    console.log(`업데이트할 계약 수: ${contractsToUpdate.length}`);

    if (contractsToUpdate.length > 0) {
      // 각 계약에 대해 기본값 설정 (100%로 설정)
      for (const contract of contractsToUpdate) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: {
            expectedRate: contract.expectedRate ?? 100,
            pointRate: contract.pointRate ?? 100
          }
        });
        console.log(`계약 ${contract.contractNumber} 업데이트 완료`);
      }
    }

    // 전체 계약 수 확인
    const totalContracts = await prisma.contract.count();
    console.log(`전체 계약 수: ${totalContracts}`);

    // 업데이트 후 데이터 확인
    const contractsWithRates = await prisma.contract.findMany({
      select: {
        contractNumber: true,
        customerName: true,
        contractAmount: true,
        expectedRate: true,
        pointRate: true
      },
      take: 5
    });

    console.log('\n업데이트된 계약 데이터 샘플:');
    contractsWithRates.forEach(contract => {
      console.log(`${contract.contractNumber} - ${contract.customerName}: ${contract.contractAmount}원, expectedRate: ${contract.expectedRate}%, pointRate: ${contract.pointRate}%`);
    });

    console.log('\n✅ 계약 데이터 업데이트가 완료되었습니다.');
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateContractRates();








