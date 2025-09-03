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

async function safeDelete() {
  console.log('⚠️  안전한 삭제 도구');
  console.log('이 도구는 데이터 삭제 전 반드시 확인을 받습니다.\n');

  try {
    // 현재 데이터 상태 확인
    const userCount = await prisma.user.count();
    const partnerAppCount = await prisma.partnerApplication.count();
    const questionCount = await prisma.question.count();
    const itemSettingCount = await prisma.itemSetting.count();

    console.log('📊 현재 데이터 상태:');
    console.log(`- 사용자: ${userCount}명`);
    console.log(`- 파트너 신청: ${partnerAppCount}건`);
    console.log(`- 문의사항: ${questionCount}건`);
    console.log(`- 아이템 설정: ${itemSettingCount}건\n`);

    const answer = await askQuestion('정말로 데이터를 삭제하시겠습니까? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ 삭제가 취소되었습니다.');
      return;
    }

    const confirmAnswer = await askQuestion('⚠️  경고: 이 작업은 되돌릴 수 없습니다. "DELETE"를 입력하여 확인하세요: ');
    
    if (confirmAnswer !== 'DELETE') {
      console.log('❌ 삭제가 취소되었습니다.');
      return;
    }

    console.log('🗑️  데이터 삭제를 시작합니다...');
    
    // 백업 생성
    console.log('💾 백업 생성 중...');
    const { execSync } = require('child_process');
    execSync('npx tsx scripts/backup-users.ts', { stdio: 'inherit' });

    // 삭제 실행
    await prisma.partnerApplication.deleteMany();
    await prisma.question.deleteMany();
    await prisma.itemSetting.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ 모든 데이터가 삭제되었습니다.');
    console.log('💾 백업 파일이 생성되었으므로 필요시 복원할 수 있습니다.');

  } catch (error) {
    console.error('❌ 삭제 중 오류 발생:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

safeDelete();









