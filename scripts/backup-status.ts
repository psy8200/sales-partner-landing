import { PrismaClient } from '../node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * 백업 상태 확인 스크립트
 * 현재 데이터베이스 상태와 백업 파일 상태를 확인합니다.
 */
async function checkBackupStatus() {
  try {
    console.log('🔍 백업 상태 확인 중...\n');

    // 1. 현재 데이터베이스 상태 확인
    console.log('📊 현재 데이터베이스 상태:');
    console.log('─'.repeat(50));

    const dbStats = {
      users: await prisma.user.count(),
      contracts: await prisma.contract.count(),
      items: await prisma.itemSetting.count(), // 기존 백업에서는 'items'
      'partner-applications': await prisma.partnerApplication.count(),
      questions: await prisma.question.count(),
      'activity-logs': await prisma.activityLog.count(),
      'company-info': await prisma.companyInfo.count(),
      consultations: await prisma.consultation.count(),
      applications: await prisma.application.count(),
      payments: await prisma.payment.count(),
      settlements: await prisma.settlement.count(),
      'point-ledgers': await prisma.pointLedger.count(),
      'withdrawal-requests': await prisma.withdrawalRequest.count(),
      'user-logs': await prisma.userLog.count(),
      notifications: await prisma.notification.count(),
      'system-configs': await prisma.systemConfig.count(),
      'export-logs': await prisma.exportLog.count(),
      'profit-items': await prisma.profitItem.count(),
      'activity-backups': await prisma.activityBackup.count()
    };

    for (const [table, count] of Object.entries(dbStats)) {
      console.log(`  ${table.padEnd(20)}: ${count.toString().padStart(6)}개`);
    }

    console.log('─'.repeat(50));
    console.log(`  총 레코드 수: ${Object.values(dbStats).reduce((sum, count) => sum + count, 0).toLocaleString()}개\n`);

    // 2. 백업 파일 상태 확인
    console.log('📁 백업 파일 상태:');
    console.log('─'.repeat(50));

    const backupDir = path.join(process.cwd(), 'auto-backups');
    
    if (!fs.existsSync(backupDir)) {
      console.log('  ❌ 백업 디렉토리가 존재하지 않습니다.');
      return;
    }

    const backupDirs = fs.readdirSync(backupDir)
      .filter(item => {
        const itemPath = path.join(backupDir, item);
        return fs.statSync(itemPath).isDirectory() && item.match(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z$/);
      })
      .sort()
      .reverse(); // 최신순 정렬

    if (backupDirs.length === 0) {
      console.log('  ❌ 백업 디렉토리가 없습니다.');
      return;
    }

    console.log(`  📁 총 ${backupDirs.length}개의 백업 디렉토리 발견\n`);

    // 최신 백업 정보
    const latestBackup = backupDirs[0];
    const latestBackupPath = path.join(backupDir, latestBackup);
    const summaryPath = path.join(latestBackupPath, 'backup-summary.json');

    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      console.log('📊 최신 백업 정보:');
      console.log('─'.repeat(50));
      console.log(`  백업 일시: ${summary.backupDate}`);
      console.log(`  백업 경로: ${latestBackupPath}`);
      console.log('');

      // 백업된 테이블별 레코드 수
      console.log('📊 백업된 데이터:');
      console.log('─'.repeat(50));
      
      const backupStats = Object.entries(summary)
        .filter(([key, value]) => key.startsWith('total') && typeof value === 'number')
        .map(([key, value]) => [key.replace('total', '').toLowerCase(), value]);

      for (const [table, count] of backupStats) {
        const currentCount = dbStats[table] || 0;
        const diff = (count as number) - currentCount;
        const status = diff === 0 ? '✅' : diff > 0 ? '⚠️' : '📉';
        console.log(`  ${status} ${table.padEnd(20)}: ${(count as number).toString().padStart(6)}개 (현재: ${currentCount}개, 차이: ${diff > 0 ? '+' : ''}${diff}개)`);
      }
    }

    // 3. 백업 디렉토리 목록
    console.log('\n📁 백업 디렉토리 목록:');
    console.log('─'.repeat(50));
    
    for (let i = 0; i < Math.min(backupDirs.length, 10); i++) {
      const backup = backupDirs[i];
      const backupPath = path.join(backupDir, backup);
      const summaryPath = path.join(backupPath, 'backup-summary.json');
      
      let info = '';
      if (fs.existsSync(summaryPath)) {
        const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
        const totalRecords = Object.values(summary)
          .filter(value => typeof value === 'number' && value > 0)
          .reduce((sum, count) => sum + (count as number), 0);
        info = ` (${totalRecords.toLocaleString()}개 레코드)`;
      }
      
      const marker = i === 0 ? '🟢' : '⚪';
      console.log(`  ${marker} ${backup}${info}`);
    }

    if (backupDirs.length > 10) {
      console.log(`  ... 및 ${backupDirs.length - 10}개 더`);
    }

    // 4. 권장사항
    console.log('\n💡 권장사항:');
    console.log('─'.repeat(50));
    
    const daysSinceLastBackup = backupDirs.length > 0 ? 
      Math.floor((Date.now() - new Date(backupDirs[0].replace(/-/g, ':').replace('T', 'T').replace(/-/g, '-')).getTime()) / (1000 * 60 * 60 * 24)) : 
      Infinity;

    if (daysSinceLastBackup > 7) {
      console.log('  ⚠️  마지막 백업이 7일 이상 지났습니다. 백업을 실행하세요.');
    } else if (daysSinceLastBackup > 3) {
      console.log('  💡 마지막 백업이 3일 이상 지났습니다. 백업을 고려하세요.');
    } else {
      console.log('  ✅ 백업 상태가 양호합니다.');
    }

    console.log('  📝 수동 백업 실행: npm run backup');
    console.log('  🔄 복구 실행: npm run restore <백업경로>');

  } catch (error) {
    console.error('❌ 백업 상태 확인 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  checkBackupStatus()
    .then(() => {
      console.log('\n✅ 백업 상태 확인 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 백업 상태 확인 실패:', error);
      process.exit(1);
    });
}

export { checkBackupStatus };
