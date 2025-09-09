const fs = require('fs');
const path = require('path');

/**
 * 백업 파일에서 데이터베이스 복구 스크립트
 * 
 * 사용법:
 * node scripts/restore-from-backup.js [백업파일명]
 * 
 * 예시:
 * node scripts/restore-from-backup.js dev-backup-before-migration-2025-09-08T10-30-00-000Z.db
 */

async function restoreFromBackup(backupFileName) {
  try {
    console.log('🔄 데이터베이스 복구를 시작합니다...');
    console.log('현재 시간:', new Date().toLocaleString('ko-KR'));
    
    const prismaPath = path.join(__dirname, '..', 'prisma');
    
    // 백업 파일명이 제공되지 않은 경우, 사용 가능한 백업 파일 목록 표시
    if (!backupFileName) {
      console.log('\n📁 사용 가능한 백업 파일들:');
      const files = fs.readdirSync(prismaPath);
      const backupFiles = files.filter(file => file.startsWith('dev-backup-') && file.endsWith('.db'));
      
      if (backupFiles.length === 0) {
        console.log('❌ 백업 파일을 찾을 수 없습니다.');
        return;
      }
      
      backupFiles.forEach((file, index) => {
        const filePath = path.join(prismaPath, file);
        const stats = fs.statSync(filePath);
        console.log(`${index + 1}. ${file} (${stats.mtime.toLocaleString('ko-KR')}, ${(stats.size / 1024).toFixed(2)} KB)`);
      });
      
      console.log('\n사용법: node scripts/restore-from-backup.js [백업파일명]');
      return;
    }
    
    // 백업 파일 경로
    const backupPath = path.join(prismaPath, backupFileName);
    const currentDbPath = path.join(prismaPath, 'dev.db');
    
    // 백업 파일 존재 확인
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ 백업 파일을 찾을 수 없습니다: ${backupFileName}`);
      return;
    }
    
    // 현재 데이터베이스 파일 백업 (복구 전 안전장치)
    const currentBackupName = `dev-current-before-restore-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;
    const currentBackupPath = path.join(prismaPath, currentBackupName);
    
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, currentBackupPath);
      console.log(`\n🛡️  현재 데이터베이스 백업: ${currentBackupName}`);
    }
    
    // 백업 파일로 복구
    fs.copyFileSync(backupPath, currentDbPath);
    console.log(`\n✅ 복구 완료: ${backupFileName} → dev.db`);
    
    // 복구된 파일 정보
    const restoredStats = fs.statSync(currentDbPath);
    console.log(`복구된 파일 크기: ${(restoredStats.size / 1024).toFixed(2)} KB`);
    console.log(`복구된 파일 수정일: ${restoredStats.mtime.toLocaleString('ko-KR')}`);
    
    console.log('\n🎉 데이터베이스 복구가 성공적으로 완료되었습니다!');
    console.log('\n⚠️  주의사항:');
    console.log('1. 서버를 재시작하세요');
    console.log('2. 데이터가 정상적으로 복구되었는지 확인하세요');
    console.log('3. 문제가 발생하면 현재 백업 파일로 다시 복구할 수 있습니다');
    console.log(`   백업 파일: ${currentBackupName}`);
    
  } catch (error) {
    console.error('❌ 복구 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  const backupFileName = process.argv[2];
  restoreFromBackup(backupFileName);
}

module.exports = { restoreFromBackup };
