import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync, existsSync } from 'fs';
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

interface BackupSummary {
  timestamp: string;
  totalUsers: number;
  totalContracts: number;
  totalItems: number;
  totalCompanyInfo: number;
  totalPartnerApplications: number;
  totalConsultations: number;
  totalPayments: number;
  totalSettlements: number;
  totalPointLedgers: number;
  totalActivityLogs: number;
}

function getAvailableBackups(): string[] {
  const backupDir = join(process.cwd(), 'auto-backups');
  if (!existsSync(backupDir)) {
    console.log('❌ 백업 디렉토리가 없습니다.');
    return [];
  }
  
  const files = readdirSync(backupDir)
    .filter(f => f.startsWith('full-backup-') && f.endsWith('.json'))
    .sort()
    .reverse(); // 최신 백업부터 정렬
  
  return files;
}

function displayBackupInfo(backupFile: string): BackupSummary | null {
  try {
    const backupDir = join(process.cwd(), 'auto-backups');
    const filePath = join(backupDir, backupFile);
    const data = JSON.parse(readFileSync(filePath, 'utf-8')) as BackupData;
    
    const summary: BackupSummary = {
      timestamp: data.timestamp,
      totalUsers: data.users.length,
      totalContracts: data.contracts.length,
      totalItems: data.items.length,
      totalCompanyInfo: data.companyInfo.length,
      totalPartnerApplications: data.partnerApplications.length,
      totalConsultations: data.consultations.length,
      totalPayments: data.payments.length,
      totalSettlements: data.settlements.length,
      totalPointLedgers: data.pointLedgers.length,
      totalActivityLogs: data.activityLogs.length
    };
    
    console.log(`\n📊 백업 정보: ${backupFile}`);
    console.log(`📅 백업 시간: ${summary.timestamp}`);
    console.log(`👥 사용자: ${summary.totalUsers}명`);
    console.log(`📋 계약: ${summary.totalContracts}건`);
    console.log(`📦 아이템: ${summary.totalItems}개`);
    console.log(`🏢 회사정보: ${summary.totalCompanyInfo}개`);
    console.log(`🤝 파트너신청: ${summary.totalPartnerApplications}건`);
    console.log(`💬 상담: ${summary.totalConsultations}건`);
    console.log(`💳 결제: ${summary.totalPayments}건`);
    console.log(`💰 정산: ${summary.totalSettlements}건`);
    console.log(`🎯 포인트내역: ${summary.totalPointLedgers}건`);
    console.log(`📝 활동로그: ${summary.totalActivityLogs}건`);
    
    return summary;
  } catch (error) {
    console.error('❌ 백업 파일 읽기 실패:', error);
    return null;
  }
}

async function restoreFromBackup(backupFile: string, dryRun: boolean = false) {
  try {
    const backupDir = join(process.cwd(), 'auto-backups');
    const filePath = join(backupDir, backupFile);
    
    if (!existsSync(filePath)) {
      throw new Error(`백업 파일을 찾을 수 없습니다: ${backupFile}`);
    }
    
    console.log(`🔄 백업에서 복원 시작: ${backupFile}`);
    if (dryRun) {
      console.log('🔍 드라이 런 모드 (실제 복원하지 않음)');
    }
    
    const data = JSON.parse(readFileSync(filePath, 'utf-8')) as BackupData;
    
    if (dryRun) {
      console.log('✅ 드라이 런 완료 - 복원할 데이터 확인됨');
      return;
    }
    
    // 데이터베이스 연결
    await prisma.$connect();
    
    // 트랜잭션으로 안전하게 복원
    await prisma.$transaction(async (tx) => {
      console.log('🔄 사용자 데이터 복원 중...');
      for (const user of data.users) {
        await tx.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            phone: user.phone,
            role: user.role,
            status: user.status,
            level: user.level || 0,
            points: user.points || 0,
            partnerStatus: user.partnerStatus || 'NONE',
            marketingAgreed: user.marketingAgreed || false,
            lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
            loginCount: user.loginCount || 0,
            isActive: user.isActive !== undefined ? user.isActive : true
          },
          create: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            passwordHash: user.passwordHash || 'temp-password',
            role: user.role || 'GENERAL',
            status: user.status || 'PENDING',
            level: user.level || 0,
            points: user.points || 0,
            partnerStatus: user.partnerStatus || 'NONE',
            marketingAgreed: user.marketingAgreed || false,
            isActive: user.isActive !== undefined ? user.isActive : true
          }
        });
      }
      
      console.log('🔄 계약 데이터 복원 중...');
      for (const contract of data.contracts) {
        await tx.contract.upsert({
          where: { contractNumber: contract.contractNumber },
          update: {
            customerName: contract.customerName,
            customerPhone: contract.customerPhone,
            customerAddress: contract.customerAddress,
            itemCategory: contract.itemCategory,
            companyName: contract.companyName,
            itemName: contract.itemName,
            contractAmount: contract.contractAmount,
            commissionRate: contract.commissionRate,
            commissionAmount: contract.commissionAmount,
            expectedRate: contract.expectedRate,
            pointRate: contract.pointRate,
            payoutRate: contract.payoutRate,
            finalPoints: contract.finalPoints,
            contractDate: new Date(contract.contractDate),
            startDate: contract.startDate ? new Date(contract.startDate) : null,
            endDate: contract.endDate ? new Date(contract.endDate) : null,
            installationDate: contract.installationDate ? new Date(contract.installationDate) : null,
            status: contract.status,
            notes: contract.notes,
            createdBy: contract.createdBy,
            dynamicFields: contract.dynamicFields
          },
          create: {
            contractNumber: contract.contractNumber,
            customerName: contract.customerName,
            customerPhone: contract.customerPhone,
            customerAddress: contract.customerAddress,
            itemCategory: contract.itemCategory,
            companyName: contract.companyName,
            itemName: contract.itemName,
            contractAmount: contract.contractAmount,
            commissionRate: contract.commissionRate,
            commissionAmount: contract.commissionAmount,
            expectedRate: contract.expectedRate,
            pointRate: contract.pointRate,
            payoutRate: contract.payoutRate,
            finalPoints: contract.finalPoints,
            contractDate: new Date(contract.contractDate),
            startDate: contract.startDate ? new Date(contract.startDate) : null,
            endDate: contract.endDate ? new Date(contract.endDate) : null,
            installationDate: contract.installationDate ? new Date(contract.installationDate) : null,
            status: contract.status,
            notes: contract.notes,
            createdBy: contract.createdBy,
            dynamicFields: contract.dynamicFields
          }
        });
      }
      
      console.log('🔄 아이템 설정 데이터 복원 중...');
      for (const item of data.items) {
        try {
          await tx.itemSetting.upsert({
            where: { id: item.id },
                      update: {
            category: item.category,
            provider: item.provider || 'DEFAULT',
            productName: item.productName || item.name || '기본상품명',
            paymentTerm: item.paymentTerm || 'MONTHLY',
            baseAmount: item.baseAmount || 0,
            expectedRate: item.expectedRate || 0,
            pointRate: item.pointRate || 0,
            pointAmount: item.pointAmount || 0
          },
          create: {
            id: item.id,
            category: item.category,
            provider: item.provider || 'DEFAULT',
            productName: item.productName || item.name || '기본상품명',
            paymentTerm: item.paymentTerm || 'MONTHLY',
            baseAmount: item.baseAmount || 0,
            expectedRate: item.expectedRate || 0,
            pointRate: item.pointRate || 0,
            pointAmount: item.pointAmount || 0
          }
          });
        } catch (error) {
          console.log(`⚠️ 아이템 복원 실패 (${item.id}):`, error);
        }
      }
      
      console.log('🔄 회사정보 복원 중...');
      for (const company of data.companyInfo) {
        await tx.companyInfo.upsert({
          where: { id: company.id },
          update: {
            companyName: company.companyName,
            companyLogo: company.companyLogo,
            bottomLogo: company.bottomLogo,
            businessNumber: company.businessNumber,
            representative: company.representative,
            address: company.address,
            phone: company.phone,
            email: company.email,
            website: company.website,
            description: company.description,
            referralCodeDefault: company.referralCodeDefault,
            isActive: company.isActive !== undefined ? company.isActive : true
          },
          create: {
            id: company.id,
            companyName: company.companyName,
            companyLogo: company.companyLogo,
            bottomLogo: company.bottomLogo,
            businessNumber: company.businessNumber,
            representative: company.representative,
            address: company.address,
            phone: company.phone,
            email: company.email,
            website: company.website,
            description: company.description,
            referralCodeDefault: company.referralCodeDefault,
            isActive: company.isActive !== undefined ? company.isActive : true
          }
        });
      }

      // 파트너신청 데이터 복원 추가
      if (data.partnerApplications && data.partnerApplications.length > 0) {
        console.log('🔄 파트너신청 데이터 복원 중...');
        for (const application of data.partnerApplications) {
          try {
            await tx.partnerApplication.upsert({
              where: { id: application.id },
              update: {
                userId: application.userId,
                availableDate: application.availableDate,
                availableTime: application.availableTime,
                area: application.area || '',
                referrer: application.referrer || '',
                status: application.status || 'PENDING',
                createdAt: application.createdAt ? new Date(application.createdAt) : new Date()
              },
              create: {
                id: application.id,
                userId: application.userId,
                availableDate: application.availableDate,
                availableTime: application.availableTime,
                area: application.area || '',
                referrer: application.referrer || '',
                status: application.status || 'PENDING',
                createdAt: application.createdAt ? new Date(application.createdAt) : new Date()
              }
            });
          } catch (error) {
            console.log(`⚠️ 파트너신청 복원 실패 (${application.id}):`, error);
          }
        }
      }

      // 상담 데이터 복원 추가
      if (data.consultations && data.consultations.length > 0) {
        console.log('🔄 상담 데이터 복원 중...');
        for (const consultation of data.consultations) {
          try {
            await tx.consultation.upsert({
              where: { id: consultation.id },
              update: {
                userId: consultation.userId,
                type: consultation.type || 'GENERAL',
                message: consultation.message,
                status: consultation.status || 'PENDING',
                createdAt: consultation.createdAt ? new Date(consultation.createdAt) : new Date(),
                updatedAt: new Date()
              },
              create: {
                id: consultation.id,
                userId: consultation.userId,
                type: consultation.type || 'GENERAL',
                message: consultation.message,
                status: consultation.status || 'PENDING',
                createdAt: consultation.createdAt ? new Date(consultation.createdAt) : new Date(),
                updatedAt: new Date()
              }
            });
          } catch (error) {
            console.log(`⚠️ 상담 복원 실패 (${consultation.id}):`, error);
          }
        }
      }

      // 활동로그 데이터 복원 추가
      if (data.activityLogs && data.activityLogs.length > 0) {
        console.log('🔄 활동로그 데이터 복원 중...');
        for (const log of data.activityLogs) {
          try {
            await tx.activityLog.upsert({
              where: { id: log.id },
              update: {
                type: log.type,
                title: log.title,
                description: log.description,
                user: { connect: { id: log.userId } },
                metadata: log.metadata,
                createdAt: log.createdAt ? new Date(log.createdAt) : new Date()
              },
              create: {
                id: log.id,
                type: log.type,
                title: log.title,
                description: log.description,
                user: { connect: { id: log.userId } },
                metadata: log.metadata,
                createdAt: log.createdAt ? new Date(log.createdAt) : new Date()
              }
            });
          } catch (error) {
            console.log(`⚠️ 활동로그 복원 실패 (${log.id}):`, error);
          }
        }
      }

      // 결제 데이터 복원 추가
      if (data.payments && data.payments.length > 0) {
        console.log('🔄 결제 데이터 복원 중...');
        for (const payment of data.payments) {
          try {
            await tx.payment.upsert({
              where: { id: payment.id },
              update: {
                userId: payment.userId,
                amount: payment.amount,
                type: payment.type,
                status: payment.status,
                createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
                updatedAt: new Date()
              },
              create: {
                id: payment.id,
                userId: payment.userId,
                amount: payment.amount,
                type: payment.type,
                status: payment.status,
                createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
                updatedAt: new Date()
              }
            });
          } catch (error) {
            console.log(`⚠️ 결제 복원 실패 (${payment.id}):`, error);
          }
        }
      }

      // 정산 데이터 복원 추가
      if (data.settlements && data.settlements.length > 0) {
        console.log('🔄 정산 데이터 복원 중...');
        for (const settlement of data.settlements) {
          try {
            await tx.settlement.upsert({
              where: { id: settlement.id },
              update: {
                userId: settlement.userId,
                amount: settlement.amount,
                type: settlement.type,
                status: settlement.status,
                createdAt: settlement.createdAt ? new Date(settlement.createdAt) : new Date(),
                updatedAt: new Date()
              },
              create: {
                id: settlement.id,
                userId: settlement.userId,
                amount: settlement.amount,
                type: settlement.type,
                status: settlement.status,
                createdAt: settlement.createdAt ? new Date(settlement.createdAt) : new Date(),
                updatedAt: new Date()
              }
            });
          } catch (error) {
            console.log(`⚠️ 정산 복원 실패 (${settlement.id}):`, error);
          }
        }
      }

      // 포인트내역 데이터 복원 추가
      if (data.pointLedgers && data.pointLedgers.length > 0) {
        console.log('🔄 포인트내역 데이터 복원 중...');
        for (const ledger of data.pointLedgers) {
          try {
            await tx.pointLedger.upsert({
              where: { id: ledger.id },
              update: {
                userId: ledger.userId,
                amount: ledger.amount,
                type: ledger.type,
                description: ledger.description,
                createdAt: ledger.createdAt ? new Date(ledger.createdAt) : new Date(),
                updatedAt: new Date()
              },
              create: {
                id: ledger.id,
                userId: ledger.userId,
                amount: ledger.amount,
                type: ledger.type,
                description: ledger.description,
                createdAt: ledger.createdAt ? new Date(ledger.createdAt) : new Date(),
                updatedAt: new Date()
              }
            });
          } catch (error) {
            console.log(`⚠️ 포인트내역 복원 실패 (${ledger.id}):`, error);
          }
        }
      }
    });
    
    console.log('✅ 백업 복원 완료!');
    
  } catch (error) {
    console.error('❌ 백업 복원 실패:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const availableBackups = getAvailableBackups();
  
  if (availableBackups.length === 0) {
    console.log('❌ 사용 가능한 백업이 없습니다.');
    return;
  }
  
  console.log('📁 사용 가능한 백업 파일들:');
  availableBackups.forEach((backup, index) => {
    console.log(`  ${index + 1}. ${backup}`);
  });
  
  // 첫 번째 백업 파일 정보 표시
  const firstBackup = availableBackups[0];
  displayBackupInfo(firstBackup);
  
  // 명령행 인수 확인
  const args = process.argv.slice(2);
  const restoreArg = args.find(arg => arg.startsWith('--restore='));
  const executeArg = args.includes('--execute');
  
  if (restoreArg) {
    const backupFile = restoreArg.split('=')[1];
    console.log(`\n🔄 지정된 백업에서 복원 시작: ${backupFile}`);
    
    if (executeArg) {
      console.log('🚀 실제 복원 실행 중...');
      await restoreFromBackup(backupFile, false);
    } else {
      console.log('🔍 드라이 런 모드 (실제 복원하지 않음)');
      await restoreFromBackup(backupFile, true);
    }
  } else {
    // 기본: 드라이 런 모드
    console.log('\n🔍 백업 데이터 검증 중...');
    await restoreFromBackup(firstBackup, true);
    
    console.log('\n💡 실제 복원을 원하시면 다음 명령어를 실행하세요:');
    console.log(`npx tsx scripts/auto-restore.ts --restore=${firstBackup} --execute`);
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log('🎉 백업 복원 준비 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 백업 복원 준비 실패:', error);
      process.exit(1);
    });
}

export { restoreFromBackup, getAvailableBackups, displayBackupInfo };
