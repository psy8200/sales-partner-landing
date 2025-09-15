const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreAdmins() {
  try {
    console.log('🔍 관리자 데이터 복구 시작...');

    // 백업 파일 경로
    const backupDir = path.join(__dirname, '..', 'backup-latest', 'sales-partner-landing', 'auto-backups', '2025-09-10T09-26-17-777Z');
    
    // 1. 관리자 데이터 복구
    const adminsPath = path.join(backupDir, 'users.json');
    if (fs.existsSync(adminsPath)) {
      const backupData = JSON.parse(fs.readFileSync(adminsPath, 'utf8'));
      const usersData = backupData.users || backupData;
      
      // 관리자 역할인 사용자들만 필터링
      const adminUsers = usersData.filter(user => 
        user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
      );
      
      console.log(`📊 복구할 관리자 데이터: ${adminUsers.length}명`);
      
      for (const userData of adminUsers) {
        try {
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
          console.log(`✅ 관리자 복구: ${userData.name} (${userData.role}) - ${userData.email}`);
        } catch (userError) {
          console.error(`❌ 관리자 복구 실패 (${userData.name}):`, userError.message);
        }
      }
    }
    
    // 2. 회사 정보 복구
    const companyInfoPath = path.join(backupDir, 'company-info.json');
    if (fs.existsSync(companyInfoPath)) {
      const backupData = JSON.parse(fs.readFileSync(companyInfoPath, 'utf8'));
      const companyInfoData = backupData.companyInfo || backupData;
      
      if (Array.isArray(companyInfoData)) {
        console.log(`📊 복구할 회사 정보: ${companyInfoData.length}건`);
        
        for (const companyData of companyInfoData) {
          try {
            const processedCompanyData = {
              ...companyData,
              createdAt: companyData.createdAt ? new Date(companyData.createdAt) : new Date(),
              updatedAt: companyData.updatedAt ? new Date(companyData.updatedAt) : new Date(),
            };

            await prisma.companyInfo.upsert({
              where: { id: processedCompanyData.id },
              update: processedCompanyData,
              create: processedCompanyData,
            });
            console.log(`✅ 회사 정보 복구: ${companyData.companyName}`);
          } catch (companyError) {
            console.error(`❌ 회사 정보 복구 실패 (${companyData.companyName}):`, companyError.message);
          }
        }
      }
    }

    console.log('🎉 관리자 데이터 복구 완료!');
    
  } catch (error) {
    console.error('❌ 관리자 데이터 복구 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAdmins();
