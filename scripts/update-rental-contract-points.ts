import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateRentalContractPoints() {
  try {
    console.log('🔧 렌탈 상품 계약의 결정포인트를 계산하여 업데이트합니다...');
    
    // 렌탈 상품 계약 조회
    const rentalContracts = await prisma.contract.findMany({
      where: {
        itemCategory: 'RENTAL'
      }
    });
    
    console.log(`📊 렌탈 상품 계약 ${rentalContracts.length}개 발견`);
    
    for (const contract of rentalContracts) {
      if (contract.pointRate && contract.contractAmount && !contract.finalPoints) {
        const calculatedPoints = Math.floor(contract.contractAmount * (contract.pointRate / 100));
        
        console.log(`계약번호: ${contract.contractNumber}`);
        console.log(`계약금액: ${contract.contractAmount.toLocaleString()}원`);
        console.log(`포인트율: ${contract.pointRate}%`);
        console.log(`계산된 포인트: ${calculatedPoints.toLocaleString()} P`);
        
        // 결정포인트 업데이트
        await prisma.contract.update({
          where: { id: contract.id },
          data: { finalPoints: calculatedPoints }
        });
        
        console.log('✅ 업데이트 완료\n');
      } else {
        console.log(`계약번호: ${contract.contractNumber} - 이미 결정포인트가 있거나 계산 불가\n`);
      }
    }
    
    console.log('🎉 모든 렌탈 상품 계약의 결정포인트 업데이트 완료!');
    
  } catch (error) {
    console.error('❌ 렌탈 상품 계약 포인트 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRentalContractPoints();








