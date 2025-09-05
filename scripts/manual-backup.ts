import { PrismaClient } from '../node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * 수동 백업 스크립트
 * 현재 시스템의 모든 데이터를 JSON 파일로 백업합니다.
 */
async function createManualBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'auto-backups', timestamp);
  
  try {
    // 백업 디렉토리 생성
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log(`🔄 백업 시작: ${timestamp}`);
    console.log(`📁 백업 디렉토리: ${backupDir}`);

    // 각 테이블별 데이터 백업
    const backupData: Record<string, any> = {};

    // 백업할 테이블 목록 (기존 백업 데이터 구조에 맞춤)
    const backupTables = [
      { model: 'user', file: 'users' },
      { model: 'contract', file: 'contracts' },
      { model: 'itemSetting', file: 'items' }, // 기존 백업에서는 'items'
      { model: 'partnerApplication', file: 'partner-applications' }, // 기존 백업에서는 하이픈 사용
      { model: 'question', file: 'questions' },
      { model: 'activityLog', file: 'activity-logs' }, // 기존 백업에서는 하이픈 사용
      { model: 'companyInfo', file: 'company-info' }, // 기존 백업에서는 하이픈 사용
      { model: 'consultation', file: 'consultations' },
      { model: 'application', file: 'applications' },
      { model: 'payment', file: 'payments' },
      { model: 'settlement', file: 'settlements' },
      { model: 'pointLedger', file: 'point-ledgers' }, // 기존 백업에서는 하이픈 사용
      { model: 'withdrawalRequest', file: 'withdrawal-requests' },
      { model: 'userLog', file: 'user-logs' },
      { model: 'notification', file: 'notifications' },
      { model: 'systemConfig', file: 'system-configs' },
      { model: 'exportLog', file: 'export-logs' },
      { model: 'profitItem', file: 'profit-items' },
      { model: 'activityBackup', file: 'activity-backups' }
    ];

    // 각 테이블별 데이터 백업
    for (const { model, file } of backupTables) {
      try {
        console.log(`📊 ${file} 데이터 백업 중...`);
        
        if (!(prisma as any)[model]) {
          console.log(`⚠️  ${model} 모델을 찾을 수 없습니다. 건너뜁니다.`);
          backupData[file] = [];
          continue;
        }

        backupData[file] = await (prisma as any)[model].findMany({
          orderBy: { createdAt: 'desc' }
        });
        
        console.log(`✅ ${file} 백업 완료 (${backupData[file].length}개 레코드)`);
      } catch (error) {
        console.error(`❌ ${file} 백업 실패:`, error);
        backupData[file] = [];
      }
    }

    // 개별 JSON 파일 생성
    for (const [tableName, data] of Object.entries(backupData)) {
      const filePath = path.join(backupDir, `${tableName}.json`);
      fs.writeFileSync(filePath, JSON.stringify({ [tableName]: data }, null, 2));
      console.log(`✅ ${tableName}.json 생성 완료 (${Array.isArray(data) ? data.length : 0}개 레코드)`);
    }

    // 백업 요약 정보 생성 (기존 백업 데이터 구조에 맞춤)
    const summary = {
      timestamp,
      backupDate: new Date().toISOString(),
      totalUsers: backupData.users.length,
      totalContracts: backupData.contracts.length,
      totalItems: backupData.items.length, // 기존 백업에서는 'totalItems'
      totalPartnerApplications: backupData['partner-applications'].length,
      totalQuestions: backupData.questions.length,
      totalActivityLogs: backupData['activity-logs'].length,
      totalCompanyInfo: backupData['company-info'].length,
      totalConsultations: backupData.consultations.length,
      totalApplications: backupData.applications.length,
      totalPayments: backupData.payments.length,
      totalSettlements: backupData.settlements.length,
      totalPointLedgers: backupData['point-ledgers'].length,
      totalWithdrawalRequests: backupData['withdrawal-requests'].length,
      totalUserLogs: backupData['user-logs'].length,
      totalNotifications: backupData.notifications.length,
      totalSystemConfigs: backupData['system-configs'].length,
      totalExportLogs: backupData['export-logs'].length,
      totalProfitItems: backupData['profit-items'].length,
      totalActivityBackups: backupData['activity-backups'].length
    };

    // 요약 파일 생성
    const summaryPath = path.join(backupDir, 'backup-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

    // 전체 백업 파일 생성
    const fullBackupPath = path.join(backupDir, 'full-backup.json');
    fs.writeFileSync(fullBackupPath, JSON.stringify(backupData, null, 2));

    // 최신 백업 정보 업데이트
    const latestBackupPath = path.join(process.cwd(), 'auto-backups', 'latest-backup.json');
    fs.writeFileSync(latestBackupPath, JSON.stringify(summary, null, 2));

    console.log('\n🎉 백업 완료!');
    console.log(`📁 백업 위치: ${backupDir}`);
    console.log(`📊 총 ${Object.keys(backupData).length}개 테이블 백업됨`);
    console.log(`📄 요약 파일: ${summaryPath}`);
    console.log(`📄 전체 백업: ${fullBackupPath}`);
    console.log(`📄 최신 백업: ${latestBackupPath}`);

  } catch (error) {
    console.error('❌ 백업 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  createManualBackup()
    .then(() => {
      console.log('✅ 백업 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 백업 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { createManualBackup };
