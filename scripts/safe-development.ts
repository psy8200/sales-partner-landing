import { PrismaClient } from '@prisma/client';
import { createInterface } from 'readline';

const prisma = new PrismaClient();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function safeDevelopment() {
  console.log('🛡️ 안전한 개발 환경 체크리스트');
  console.log('=====================================\n');

  try {
    // 1. 현재 데이터 상태 확인
    console.log('📊 현재 데이터 상태 확인 중...');
    const userCount = await prisma.user.count();
    const itemCount = await prisma.itemSetting.count();
    const partnerAppCount = await prisma.partnerApplication.count();
    
    console.log(`- 사용자: ${userCount}명`);
    console.log(`- 아이템: ${itemCount}개`);
    console.log(`- 파트너 신청: ${partnerAppCount}건\n`);

    // 2. 백업 생성 확인
    console.log('💾 백업 생성이 필요합니다.');
    const backupAnswer = await askQuestion('백업을 생성하시겠습니까? (yes/no): ');
    
    if (backupAnswer.toLowerCase() === 'yes') {
      console.log('백업 생성 중...');
      // 백업 스크립트 실행
      const { execSync } = require('child_process');
      try {
        execSync('npx tsx scripts/backup-users.ts', { stdio: 'inherit' });
        execSync('npx tsx scripts/backup-items.ts', { stdio: 'inherit' });
        console.log('✅ 백업 생성 완료\n');
      } catch (error) {
        console.log('❌ 백업 생성 실패. 작업을 중단합니다.');
        return;
      }
    } else {
      console.log('⚠️ 백업 없이 진행합니다. (위험할 수 있습니다.)\n');
    }

    // 3. 작업 범위 확인
    console.log('🔍 작업 범위를 명확히 해주세요.');
    const workScope = await askQuestion('어떤 작업을 하시겠습니까? ');
    console.log(`작업 범위: ${workScope}\n`);

    // 4. 위험도 평가
    const riskLevel = await askQuestion('이 작업의 위험도를 평가해주세요 (LOW/MEDIUM/HIGH): ');
    console.log(`위험도: ${riskLevel}\n`);

    if (riskLevel.toUpperCase() === 'HIGH') {
      console.log('🚨 고위험 작업입니다!');
      const confirmHighRisk = await askQuestion('정말로 진행하시겠습니까? (CONFIRM): ');
      if (confirmHighRisk !== 'CONFIRM') {
        console.log('❌ 작업이 취소되었습니다.');
        return;
      }
    }

    // 5. 롤백 계획 확인
    console.log('🔄 롤백 계획을 확인해주세요.');
    const rollbackPlan = await askQuestion('롤백 계획이 있습니까? (yes/no): ');
    if (rollbackPlan.toLowerCase() === 'no') {
      console.log('⚠️ 롤백 계획이 없습니다. 작업을 중단하는 것을 권장합니다.');
      const continueAnyway = await askQuestion('그래도 진행하시겠습니까? (yes/no): ');
      if (continueAnyway.toLowerCase() !== 'yes') {
        console.log('❌ 작업이 취소되었습니다.');
        return;
      }
    }

    // 6. 최종 확인
    console.log('\n📋 최종 확인사항:');
    console.log(`- 작업 범위: ${workScope}`);
    console.log(`- 위험도: ${riskLevel}`);
    console.log(`- 백업: ${backupAnswer.toLowerCase() === 'yes' ? '완료' : '없음'}`);
    console.log(`- 롤백 계획: ${rollbackPlan.toLowerCase() === 'yes' ? '있음' : '없음'}\n`);

    const finalConfirm = await askQuestion('모든 사항이 확인되었습니다. 작업을 시작하시겠습니까? (START): ');
    
    if (finalConfirm === 'START') {
      console.log('✅ 안전한 개발 환경이 준비되었습니다.');
      console.log('🚀 작업을 시작하세요!');
      console.log('\n📝 작업 완료 후 다음을 확인하세요:');
      console.log('- 데이터 정합성 검증');
      console.log('- 기능 테스트');
      console.log('- 성능 영향도 측정');
      console.log('- 사용자 확인');
    } else {
      console.log('❌ 작업이 취소되었습니다.');
    }

  } catch (error) {
    console.error('❌ 안전 체크 중 오류 발생:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

safeDevelopment();









