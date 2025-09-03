import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestContracts() {
  try {
    console.log('🗑️ 테스트 계약 데이터를 삭제합니다...');
    
    // 테스트 고객명으로 계약 삭제
    const deleteResult = await prisma.contract.deleteMany({
      where: {
        customerName: {
          startsWith: '테스트'
        }
      }
    });
    
    console.log(`✅ 테스트 계약 ${deleteResult.count}개 삭제 완료!`);
    
    // 삭제 후 남은 계약 수 확인
    const remainingContracts = await prisma.contract.count();
    console.log(`📊 남은 계약 수: ${remainingContracts}개`);
    
    if (remainingContracts > 0) {
      const remaining = await prisma.contract.findMany({
        select: {
          customerName: true,
          itemName: true,
          contractAmount: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log('\n📋 남은 계약 목록:');
      remaining.forEach((contract, index) => {
        console.log(`${index + 1}. ${contract.customerName} - ${contract.itemName} (${contract.contractAmount.toLocaleString()}원) - ${contract.status}`);
      });
    } else {
      console.log('✅ 모든 계약이 삭제되었습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 계약 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteTestContracts();








