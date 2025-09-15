const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreUsers() {
  try {
    console.log('🔍 사용자 데이터 복원 시작...');

    // 9월 7일 수동백업에서 사용자 데이터 복원 (10명)
    const backupFilePath = path.join(__dirname, 'manual-backups', '2025-09-07-2025-09-07T14-20-18-588Z', 'users.json');
    
    if (!fs.existsSync(backupFilePath)) {
      console.log('❌ 백업 파일을 찾을 수 없습니다:', backupFilePath);
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    const usersData = backupData.users || backupData;

    if (!usersData || usersData.length === 0) {
      console.log('복원할 사용자 데이터가 백업 파일에 없습니다.');
      return;
    }

    console.log(`📊 복원할 사용자 데이터: ${usersData.length}명`);

    for (const userData of usersData) {
      try {
        // createdAt, updatedAt 필드를 Date 객체로 변환
        const processedUserData = {
          ...userData,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
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
        console.log(`✅ 사용자 복원/업데이트: ${userData.name} (${userData.phone})`);
      } catch (userError) {
        console.error(`❌ 사용자 복원 실패 (${userData.name} - ${userData.phone}):`, userError);
      }
    }

    console.log(`🎉 총 ${usersData.length}명의 사용자 데이터 복원 완료.`);
  } catch (error) {
    console.error('❌ 사용자 데이터 복원 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreUsers();