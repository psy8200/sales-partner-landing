import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

interface BackupData {
  timestamp: string;
  users: any[];
  contracts: any[];
  items: any[];
  companyInfo: any[];
  partnerApplications: any[];
  consultations: any[];
  payments: any[];
  settlements: any[];
  pointLedgers: any[];
  activityLogs: any[];
}

async function createAutoBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(process.cwd(), 'auto-backups');
  
  try {
    // 백업 디렉토리 생성
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }
    
    console.log('🔄 자동 백업 시작...');
    
    // 모든 중요 데이터 수집 (안전한 방식으로)
    const users = await prisma.user.findMany();
    const contracts = await prisma.contract.findMany();
    const items = await prisma.itemSetting.findMany();
    
    // companyInfo는 안전하게 가져오기
    let companyInfo: any[] = [];
    try {
      companyInfo = await prisma.companyInfo.findMany();
    } catch (error) {
      console.log('⚠️ CompanyInfo 테이블 접근 실패, 건너뜀');
    }
    
    const partnerApplications = await prisma.partnerApplication.findMany();
    const consultations = await prisma.consultation.findMany();
    const payments = await prisma.payment.findMany();
    const settlements = await prisma.settlement.findMany();
    const pointLedgers = await prisma.pointLedger.findMany();
    const activityLogs = await prisma.activityLog.findMany();
    
    // 백업 데이터 구성
    const backupData: BackupData = {
      timestamp,
      users,
      contracts,
      items,
      companyInfo,
      partnerApplications,
      consultations,
      payments,
      settlements,
      pointLedgers,
      activityLogs
    };
    
    // 전체 백업 파일 저장
    const fullBackupPath = join(backupDir, `full-backup-${timestamp}.json`);
    writeFileSync(fullBackupPath, JSON.stringify(backupData, null, 2));
    
    // 개별 백업 파일들도 저장
    const individualBackupDir = join(backupDir, timestamp);
    mkdirSync(individualBackupDir, { recursive: true });
    
    writeFileSync(join(individualBackupDir, 'users.json'), JSON.stringify({ users }, null, 2));
    writeFileSync(join(individualBackupDir, 'contracts.json'), JSON.stringify({ contracts }, null, 2));
    writeFileSync(join(individualBackupDir, 'items.json'), JSON.stringify({ items }, null, 2));
    writeFileSync(join(individualBackupDir, 'company-info.json'), JSON.stringify({ companyInfo }, null, 2));
    
    // 백업 요약 정보
    const summary = {
      timestamp,
      totalUsers: users.length,
      totalContracts: contracts.length,
      totalItems: items.length,
      totalCompanyInfo: companyInfo.length,
      totalPartnerApplications: partnerApplications.length,
      totalConsultations: consultations.length,
      totalPayments: payments.length,
      totalSettlements: settlements.length,
      totalPointLedgers: pointLedgers.length,
      totalActivityLogs: activityLogs.length
    };
    
    const summaryPath = join(backupDir, `backup-summary-${timestamp}.json`);
    writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    
    // 최신 백업 정보 업데이트
    const latestBackupPath = join(backupDir, 'latest-backup.json');
    writeFileSync(latestBackupPath, JSON.stringify(summary, null, 2));
    
    console.log('✅ 자동 백업 완료!');
    console.log(`📁 백업 위치: ${backupDir}`);
    console.log(`📊 백업 요약:`);
    console.log(`   • 사용자: ${users.length}명`);
    console.log(`   • 계약: ${contracts.length}건`);
    console.log(`   • 아이템: ${items.length}개`);
    console.log(`   • 회사정보: ${companyInfo.length}개`);
    console.log(`   • 파트너신청: ${partnerApplications.length}건`);
    console.log(`   • 상담: ${consultations.length}건`);
    console.log(`   • 결제: ${payments.length}건`);
    console.log(`   • 정산: ${settlements.length}건`);
    console.log(`   • 포인트내역: ${pointLedgers.length}건`);
    console.log(`   • 활동로그: ${activityLogs.length}건`);
    
    // 오래된 백업 정리 (30일 이상 된 것)
    await cleanupOldBackups(backupDir);
    
  } catch (error) {
    console.error('❌ 자동 백업 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupOldBackups(backupDir: string) {
  try {
    const fs = require('fs');
    const files = fs.readdirSync(backupDir);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    for (const file of files) {
      if (file.startsWith('full-backup-') && file.endsWith('.json')) {
        const filePath = join(backupDir, file);
        const stats = fs.statSync(filePath);
        const fileDate = new Date(stats.mtime);
        
        if (fileDate < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          console.log(`🗑️ 오래된 백업 삭제: ${file}`);
        }
      }
    }
  } catch (error) {
    console.error('백업 정리 중 오류:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  createAutoBackup()
    .then(() => {
      console.log('🎉 자동 백업 프로세스 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 자동 백업 실패:', error);
      process.exit(1);
    });
}

export { createAutoBackup };
