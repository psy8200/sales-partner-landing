const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreAllData() {
  try {
    console.log('🔍 모든 데이터 복원 시작...');

    // 백업 파일 경로
    const backupDir = path.join(__dirname, '..', 'backup-latest', 'sales-partner-landing', 'auto-backups', '2025-09-10T09-26-17-777Z');
    
    // 1. 회원 데이터 복원
    console.log('📊 1. 회원 데이터 복원...');
    await restoreUsers(backupDir);
    
    // 2. 파트너 신청 데이터 복원
    console.log('📊 2. 파트너 신청 데이터 복원...');
    await restorePartnerApplications(backupDir);
    
    // 3. 상담 신청 데이터 복원
    console.log('📊 3. 상담 신청 데이터 복원...');
    await restoreConsultations(backupDir);
    
    // 4. 계약 데이터 복원
    console.log('📊 4. 계약 데이터 복원...');
    await restoreContracts(backupDir);
    
    // 5. 수금 데이터 복원
    console.log('📊 5. 수금 데이터 복원...');
    await restorePayments(backupDir);
    
    // 6. 정산 데이터 복원
    console.log('📊 6. 정산 데이터 복원...');
    await restoreSettlements(backupDir);
    
    // 7. 아이템 데이터 복원
    console.log('📊 7. 아이템 데이터 복원...');
    await restoreItems(backupDir);
    
    // 8. 회사 정보 복원
    console.log('📊 8. 회사 정보 복원...');
    await restoreCompanyInfo(backupDir);
    
    // 9. 알림 데이터 복원
    console.log('📊 9. 알림 데이터 복원...');
    await restoreNotifications(backupDir);
    
    // 10. 활동 로그 복원
    console.log('📊 10. 활동 로그 복원...');
    await restoreActivityLogs(backupDir);

    console.log('🎉 모든 데이터 복원 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 복원 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreUsers(backupDir) {
  try {
    const usersPath = path.join(backupDir, 'users.json');
    if (fs.existsSync(usersPath)) {
      const backupData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      const usersData = backupData.users || backupData;
      
      for (const userData of usersData) {
        const processedUserData = {
          ...userData,
          createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
          updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
          agreeTermsAt: userData.agreeTermsAt ? new Date(userData.agreeTermsAt) : null,
          marketingAgreedAt: userData.marketingAgreedAt ? new Date(userData.marketingAgreedAt) : null,
          lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : null,
          lastLogoutAt: userData.lastLogoutAt ? new Date(userData.lastLogoutAt) : null,
          deletedAt: userData.deletedAt ? new Date(userData.deletedAt) : null,
        };

        await prisma.user.upsert({
          where: { id: processedUserData.id },
          update: processedUserData,
          create: processedUserData,
        });
      }
      console.log(`✅ 회원 ${usersData.length}명 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 회원 데이터 복원 실패:', error);
  }
}

async function restorePartnerApplications(backupDir) {
  try {
    const partnerAppsPath = path.join(backupDir, 'partner-applications.json');
    if (fs.existsSync(partnerAppsPath)) {
      const backupData = JSON.parse(fs.readFileSync(partnerAppsPath, 'utf8'));
      const partnerAppsData = backupData.partnerApplications || backupData;
      
      for (const appData of partnerAppsData) {
        const processedAppData = {
          ...appData,
          createdAt: new Date(appData.createdAt),
          updatedAt: new Date(appData.updatedAt),
          processedAt: appData.processedAt ? new Date(appData.processedAt) : null,
        };

        await prisma.partnerApplication.upsert({
          where: { id: processedAppData.id },
          update: processedAppData,
          create: processedAppData,
        });
      }
      console.log(`✅ 파트너 신청 ${partnerAppsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 파트너 신청 데이터 복원 실패:', error);
  }
}

async function restoreConsultations(backupDir) {
  try {
    const consultationsPath = path.join(backupDir, 'consultations.json');
    if (fs.existsSync(consultationsPath)) {
      const backupData = JSON.parse(fs.readFileSync(consultationsPath, 'utf8'));
      const consultationsData = backupData.consultations || backupData;
      
      for (const consultationData of consultationsData) {
        const processedConsultationData = {
          ...consultationData,
          createdAt: new Date(consultationData.createdAt),
          updatedAt: new Date(consultationData.updatedAt),
        };

        await prisma.consultation.upsert({
          where: { id: processedConsultationData.id },
          update: processedConsultationData,
          create: processedConsultationData,
        });
      }
      console.log(`✅ 상담 신청 ${consultationsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 상담 신청 데이터 복원 실패:', error);
  }
}

async function restoreContracts(backupDir) {
  try {
    const contractsPath = path.join(backupDir, 'contracts.json');
    if (fs.existsSync(contractsPath)) {
      const backupData = JSON.parse(fs.readFileSync(contractsPath, 'utf8'));
      const contractsData = backupData.contracts || backupData;
      
      for (const contractData of contractsData) {
        const processedContractData = {
          ...contractData,
          createdAt: new Date(contractData.createdAt),
          updatedAt: new Date(contractData.updatedAt),
          contractDate: new Date(contractData.contractDate),
        };

        await prisma.contract.upsert({
          where: { id: processedContractData.id },
          update: processedContractData,
          create: processedContractData,
        });
      }
      console.log(`✅ 계약 ${contractsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 계약 데이터 복원 실패:', error);
  }
}

async function restorePayments(backupDir) {
  try {
    const paymentsPath = path.join(backupDir, 'payments.json');
    if (fs.existsSync(paymentsPath)) {
      const backupData = JSON.parse(fs.readFileSync(paymentsPath, 'utf8'));
      const paymentsData = backupData.payments || backupData;
      
      for (const paymentData of paymentsData) {
        const processedPaymentData = {
          ...paymentData,
          createdAt: new Date(paymentData.createdAt),
          updatedAt: new Date(paymentData.updatedAt),
          paymentDate: new Date(paymentData.paymentDate),
        };

        await prisma.payment.upsert({
          where: { id: processedPaymentData.id },
          update: processedPaymentData,
          create: processedPaymentData,
        });
      }
      console.log(`✅ 수금 ${paymentsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 수금 데이터 복원 실패:', error);
  }
}

async function restoreSettlements(backupDir) {
  try {
    const settlementsPath = path.join(backupDir, 'settlements.json');
    if (fs.existsSync(settlementsPath)) {
      const backupData = JSON.parse(fs.readFileSync(settlementsPath, 'utf8'));
      const settlementsData = backupData.settlements || backupData;
      
      for (const settlementData of settlementsData) {
        const processedSettlementData = {
          ...settlementData,
          createdAt: new Date(settlementData.createdAt),
          updatedAt: new Date(settlementData.updatedAt),
        };

        await prisma.settlement.upsert({
          where: { id: processedSettlementData.id },
          update: processedSettlementData,
          create: processedSettlementData,
        });
      }
      console.log(`✅ 정산 ${settlementsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 정산 데이터 복원 실패:', error);
  }
}

async function restoreItems(backupDir) {
  try {
    const itemsPath = path.join(backupDir, 'items.json');
    if (fs.existsSync(itemsPath)) {
      const backupData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
      const itemsData = backupData.items || backupData;
      
      for (const itemData of itemsData) {
        const processedItemData = {
          ...itemData,
          createdAt: new Date(itemData.createdAt),
          updatedAt: new Date(itemData.updatedAt),
        };

        await prisma.item.upsert({
          where: { id: processedItemData.id },
          update: processedItemData,
          create: processedItemData,
        });
      }
      console.log(`✅ 아이템 ${itemsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 아이템 데이터 복원 실패:', error);
  }
}

async function restoreCompanyInfo(backupDir) {
  try {
    const companyInfoPath = path.join(backupDir, 'company-info.json');
    if (fs.existsSync(companyInfoPath)) {
      const backupData = JSON.parse(fs.readFileSync(companyInfoPath, 'utf8'));
      const companyInfoData = backupData.companyInfo || backupData;
      
      for (const companyData of companyInfoData) {
        const processedCompanyData = {
          ...companyData,
          createdAt: new Date(companyData.createdAt),
          updatedAt: new Date(companyData.updatedAt),
        };

        await prisma.companyInfo.upsert({
          where: { id: processedCompanyData.id },
          update: processedCompanyData,
          create: processedCompanyData,
        });
      }
      console.log(`✅ 회사 정보 ${companyInfoData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 회사 정보 복원 실패:', error);
  }
}

async function restoreNotifications(backupDir) {
  try {
    const notificationsPath = path.join(backupDir, 'notifications.json');
    if (fs.existsSync(notificationsPath)) {
      const backupData = JSON.parse(fs.readFileSync(notificationsPath, 'utf8'));
      const notificationsData = backupData.notifications || backupData;
      
      for (const notificationData of notificationsData) {
        const processedNotificationData = {
          ...notificationData,
          createdAt: new Date(notificationData.createdAt),
          updatedAt: new Date(notificationData.updatedAt),
          readAt: notificationData.readAt ? new Date(notificationData.readAt) : null,
        };

        await prisma.notification.upsert({
          where: { id: processedNotificationData.id },
          update: processedNotificationData,
          create: processedNotificationData,
        });
      }
      console.log(`✅ 알림 ${notificationsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 알림 데이터 복원 실패:', error);
  }
}

async function restoreActivityLogs(backupDir) {
  try {
    const activityLogsPath = path.join(backupDir, 'activity-logs.json');
    if (fs.existsSync(activityLogsPath)) {
      const backupData = JSON.parse(fs.readFileSync(activityLogsPath, 'utf8'));
      const activityLogsData = backupData.activityLogs || backupData;
      
      if (!Array.isArray(activityLogsData)) {
        console.log('❌ 활동 로그 데이터가 배열이 아닙니다:', typeof activityLogsData);
        return;
      }
      
      for (const logData of activityLogsData) {
        const processedLogData = {
          ...logData,
          createdAt: logData.createdAt ? new Date(logData.createdAt) : new Date(),
        };

        await prisma.activityLog.upsert({
          where: { id: processedLogData.id },
          update: processedLogData,
          create: processedLogData,
        });
      }
      console.log(`✅ 활동 로그 ${activityLogsData.length}건 복원 완료`);
    }
  } catch (error) {
    console.error('❌ 활동 로그 복원 실패:', error);
  }
}

restoreAllData();
