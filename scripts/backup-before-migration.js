const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

/**
 * 마이그레이션 실행 전 데이터베이스 백업 스크립트
 * 
 * 사용법:
 * node scripts/backup-before-migration.js
 * 
 * 주의사항:
 * - 마이그레이션 실행 전에 반드시 이 스크립트를 실행하세요
 * - 백업이 완료된 후에만 마이그레이션을 진행하세요
 */

async function backupBeforeMigration() {
  try {
    const prisma = new PrismaClient();
    
    console.log('🔄 데이터베이스 백업을 시작합니다...');
    console.log('현재 시간:', new Date().toLocaleString('ko-KR'));
    
    // 현재 데이터베이스 상태 확인
    const userCount = await prisma.user.count();
    const contractCount = await prisma.contract.count();
    const itemCount = await prisma.itemSetting.count();
    const questionCount = await prisma.question.count();
    const sidebarItemCount = await prisma.sidebarItem.count();
    
    console.log('\n📊 현재 데이터베이스 상태:');
    console.log(`- 사용자: ${userCount}명`);
    console.log(`- 계약: ${contractCount}개`);
    console.log(`- 아이템: ${itemCount}개`);
    console.log(`- 문의: ${questionCount}개`);
    console.log(`- 사이드바 아이템: ${sidebarItemCount}개`);
    
    // 백업 파일명 생성 (타임스탬프 포함)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `dev-backup-before-migration-${timestamp}.db`;
    const backupPath = path.join(__dirname, '..', 'prisma', backupFileName);
    
    // 현재 데이터베이스 파일 경로
    const currentDbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
    
    // 데이터베이스 파일 복사
    if (fs.existsSync(currentDbPath)) {
      fs.copyFileSync(currentDbPath, backupPath);
      console.log(`\n✅ 백업 완료: ${backupFileName}`);
      console.log(`백업 위치: ${backupPath}`);
      
      // 백업 파일 크기 확인
      const backupStats = fs.statSync(backupPath);
      console.log(`백업 파일 크기: ${(backupStats.size / 1024).toFixed(2)} KB`);
    } else {
      console.error('❌ 현재 데이터베이스 파일을 찾을 수 없습니다:', currentDbPath);
      return;
    }
    
    // 백업 정보를 JSON 파일로 저장
    const backupInfo = {
      timestamp: new Date().toISOString(),
      backupFileName: backupFileName,
      backupPath: backupPath,
      dataCounts: {
        users: userCount,
        contracts: contractCount,
        items: itemCount,
        questions: questionCount,
        sidebarItems: sidebarItemCount
      },
      migrationWarning: '이 백업은 마이그레이션 실행 전에 생성되었습니다.'
    };
    
    const backupInfoPath = path.join(__dirname, '..', 'prisma', `backup-info-${timestamp}.json`);
    fs.writeFileSync(backupInfoPath, JSON.stringify(backupInfo, null, 2));
    console.log(`\n📋 백업 정보 저장: backup-info-${timestamp}.json`);
    
    await prisma.$disconnect();
    
    console.log('\n🎉 백업이 성공적으로 완료되었습니다!');
    console.log('\n⚠️  주의사항:');
    console.log('1. 이제 마이그레이션을 실행할 수 있습니다');
    console.log('2. 마이그레이션 후 데이터를 확인하세요');
    console.log('3. 문제가 발생하면 백업 파일로 복구할 수 있습니다');
    console.log('\n📝 다음 단계:');
    console.log('npx prisma migrate dev --name your_migration_name');
    
  } catch (error) {
    console.error('❌ 백업 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  backupBeforeMigration();
}

module.exports = { backupBeforeMigration };





