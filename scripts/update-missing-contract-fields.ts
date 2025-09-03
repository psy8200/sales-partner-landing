import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateMissingContractFields() {
  try {
    console.log('기존 계약 데이터의 누락된 필드들을 업데이트합니다...');

    // 모든 계약 조회
    const contracts = await prisma.contract.findMany();
    console.log(`총 계약 수: ${contracts.length}`);

    if (contracts.length > 0) {
      for (const contract of contracts) {
        // 동적필드에서 회사명 추출 시도
        let companyName = contract.companyName;
        let payoutRate = contract.payoutRate;
        let finalPoints = contract.finalPoints;

        // 동적필드가 있으면 파싱해서 회사명 확인
        if (contract.dynamicFields) {
          try {
            const dynamicFields = JSON.parse(contract.dynamicFields);
            // 동적필드에서 회사명 관련 정보가 있는지 확인
            if (dynamicFields.provider) {
              companyName = dynamicFields.provider;
            }
          } catch (e) {
            console.log(`계약 ${contract.contractNumber} 동적필드 파싱 실패`);
          }
        }

        // 결정지급율이 없으면 기본값 100% 설정
        if (!payoutRate) {
          payoutRate = 100;
        }

        // 결정포인트가 없으면 계산
        if (!finalPoints && contract.expectedRate && contract.contractAmount) {
          finalPoints = Math.round(contract.contractAmount * (contract.expectedRate / 100));
        }

        // 계약 업데이트
        await prisma.contract.update({
          where: { id: contract.id },
          data: {
            companyName: companyName,
            payoutRate: payoutRate,
            finalPoints: finalPoints
          }
        });

        console.log(`계약 ${contract.contractNumber} 업데이트 완료`);
      }
    }

    // 업데이트 후 데이터 확인
    const updatedContracts = await prisma.contract.findMany({
      select: {
        contractNumber: true,
        customerName: true,
        companyName: true,
        expectedRate: true,
        payoutRate: true,
        finalPoints: true
      },
      take: 5
    });

    console.log('\n업데이트된 계약 데이터 샘플:');
    updatedContracts.forEach(contract => {
      console.log(`${contract.contractNumber} - ${contract.customerName}: 회사명=${contract.companyName}, 예상지급율=${contract.expectedRate}%, 결정지급율=${contract.payoutRate}%, 결정포인트=${contract.finalPoints}`);
    });

    console.log('\n✅ 모든 계약 데이터 업데이트가 완료되었습니다.');
  } catch (error) {
    console.error('❌ 업데이트 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMissingContractFields();








