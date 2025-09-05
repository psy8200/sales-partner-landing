import { PrismaClient } from '../node_modules/@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

/**
 * 수동 복구 스크립트
 * 백업된 JSON 파일에서 데이터를 복구합니다.
 */
async function restoreFromBackup(backupPath: string) {
  try {
    console.log(`🔄 복구 시작: ${backupPath}`);

    // 백업 디렉토리 확인
    if (!fs.existsSync(backupPath)) {
      throw new Error(`백업 디렉토리를 찾을 수 없습니다: ${backupPath}`);
    }

    // 백업 요약 정보 확인
    const summaryPath = path.join(backupPath, 'backup-summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      console.log(`📊 백업 정보: ${summary.backupDate}`);
      console.log(`📊 백업된 테이블 수: ${Object.keys(summary).filter(key => key.startsWith('total')).length}`);
    }

    // 복구할 테이블 목록 (기존 백업 데이터 구조에 맞춤)
    const restoreOrder = [
      'users',
      'company-info',
      'system-configs',
      'profit-items',
      'items', // 기존 백업에서는 'items'
      'partner-applications', // 기존 백업에서는 하이픈 사용
      'questions',
      'consultations',
      'applications',
      'contracts',
      'payments',
      'settlements',
      'point-ledgers', // 기존 백업에서는 하이픈 사용
      'withdrawal-requests',
      'user-logs',
      'notifications',
      'export-logs',
      'activity-logs', // 기존 백업에서는 하이픈 사용
      'activity-backups'
    ];

    for (const tableName of restoreOrder) {
      const filePath = path.join(backupPath, `${tableName}.json`);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${tableName}.json 파일이 없습니다. 건너뜁니다.`);
        continue;
      }

      console.log(`🔄 ${tableName} 복구 중...`);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);
        const records = data[tableName];

        if (!Array.isArray(records) || records.length === 0) {
          console.log(`📊 ${tableName}: 복구할 데이터가 없습니다.`);
          continue;
        }

        // 기존 데이터 삭제 (주의: 모든 데이터가 삭제됩니다)
        console.log(`🗑️  ${tableName} 기존 데이터 삭제 중...`);
        
        // Prisma 모델명 매핑 (기존 백업 데이터 구조에 맞춤)
        const modelMap: Record<string, string> = {
          'users': 'user',
          'contracts': 'contract',
          'items': 'itemSetting', // 기존 백업에서는 'items' -> 'itemSetting'
          'partner-applications': 'partnerApplication',
          'questions': 'question',
          'activity-logs': 'activityLog',
          'company-info': 'companyInfo',
          'consultations': 'consultation',
          'applications': 'application',
          'payments': 'payment',
          'settlements': 'settlement',
          'point-ledgers': 'pointLedger',
          'withdrawal-requests': 'withdrawalRequest',
          'user-logs': 'userLog',
          'notifications': 'notification',
          'system-configs': 'systemConfig',
          'export-logs': 'exportLog',
          'profit-items': 'profitItem',
          'activity-backups': 'activityBackup'
        };

        const prismaModelName = modelMap[tableName] || tableName;
        
        if (!(prisma as any)[prismaModelName]) {
          console.log(`⚠️  ${tableName} 모델을 찾을 수 없습니다. 건너뜁니다.`);
          continue;
        }

        await (prisma as any)[prismaModelName].deleteMany({});

        // 새 데이터 삽입
        console.log(`➕ ${tableName} 새 데이터 삽입 중... (${records.length}개 레코드)`);
        
        // 배치 처리로 성능 최적화
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
          const batch = records.slice(i, i + batchSize);
          await (prisma as any)[prismaModelName].createMany({
            data: batch
          });
        }

        console.log(`✅ ${tableName} 복구 완료 (${records.length}개 레코드)`);

      } catch (error) {
        console.error(`❌ ${tableName} 복구 실패:`, error);
        // 개별 테이블 오류는 전체 복구를 중단하지 않음
        continue;
      }
    }

    console.log('\n🎉 복구 완료!');
    console.log('⚠️  주의: 복구 후 데이터베이스 상태를 확인하세요.');

  } catch (error) {
    console.error('❌ 복구 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 특정 테이블만 복구
 */
async function restoreTable(backupPath: string, tableName: string) {
  try {
    console.log(`🔄 ${tableName} 테이블 복구 시작`);

    const filePath = path.join(backupPath, `${tableName}.json`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`${tableName}.json 파일을 찾을 수 없습니다: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);
    const records = data[tableName];

    if (!Array.isArray(records)) {
      throw new Error(`${tableName} 데이터 형식이 올바르지 않습니다.`);
    }

    if (records.length === 0) {
      console.log(`📊 ${tableName}: 복구할 데이터가 없습니다.`);
      return;
    }

    // 기존 데이터 삭제
    console.log(`🗑️  ${tableName} 기존 데이터 삭제 중...`);
    await (prisma as any)[tableName].deleteMany({});

    // 새 데이터 삽입
    console.log(`➕ ${tableName} 새 데이터 삽입 중... (${records.length}개 레코드)`);
    
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await (prisma as any)[tableName].createMany({
        data: batch,
        skipDuplicates: true
      });
    }

    console.log(`✅ ${tableName} 복구 완료 (${records.length}개 레코드)`);

  } catch (error) {
    console.error(`❌ ${tableName} 복구 실패:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('사용법:');
    console.log('  전체 복구: npm run restore <백업경로>');
    console.log('  테이블 복구: npm run restore <백업경로> <테이블명>');
    console.log('');
    console.log('예시:');
    console.log('  npm run restore auto-backups/2025-09-04T16-52-03-086Z');
    console.log('  npm run restore auto-backups/2025-09-04T16-52-03-086Z users');
    process.exit(1);
  }

  const backupPath = args[0];
  const tableName = args[1];

  if (tableName) {
    restoreTable(backupPath, tableName)
      .then(() => {
        console.log('✅ 테이블 복구 완료');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ 테이블 복구 실패:', error);
        process.exit(1);
      });
  } else {
    restoreFromBackup(backupPath)
      .then(() => {
        console.log('✅ 전체 복구 완료');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ 전체 복구 실패:', error);
        process.exit(1);
      });
  }
}

export { restoreFromBackup, restoreTable };
