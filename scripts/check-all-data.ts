import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 전체 데이터 현황 확인 스크립트
 * 모든 테이블의 데이터 수와 상태를 확인합니다.
 */
async function checkAllData() {
  try {
    console.log('🔍 전체 데이터 현황 확인 중...\n');

    // 각 테이블별 데이터 수 확인
    const dataStats = {
      users: await prisma.user.count(),
      partnerApplications: await prisma.partnerApplication.count(),
      contracts: await prisma.contract.count(),
      itemSettings: await prisma.itemSetting.count(),
      companyInfo: await prisma.companyInfo.count(),
      payments: await prisma.payment.count(),
      settlements: await prisma.settlement.count(),
      pointLedgers: await prisma.pointLedger.count(),
      withdrawalRequests: await prisma.withdrawalRequest.count(),
      activityLogs: await prisma.activityLog.count(),
      notifications: await prisma.notification.count(),
      questions: await prisma.question.count(),
      profitItems: await prisma.profitItem.count(),
      consultations: await prisma.consultation.count(),
      applications: await prisma.application.count(),
      userLogs: await prisma.userLog.count(),
      systemConfigs: await prisma.systemConfig.count(),
      exportLogs: await prisma.exportLog.count()
    };

    console.log('📊 데이터베이스 현황:');
    console.log('─'.repeat(50));
    
    // 테이블별 데이터 수 출력
    Object.entries(dataStats).forEach(([table, count]) => {
      const status = count > 0 ? '✅' : '⚠️';
      console.log(`${status} ${table.padEnd(20)}: ${count.toString().padStart(6)}개`);
    });

    // 총 데이터 수 계산
    const totalRecords = Object.values(dataStats).reduce((sum, count) => sum + count, 0);
    console.log('─'.repeat(50));
    console.log(`📈 총 레코드 수: ${totalRecords.toLocaleString()}개`);

    // 활성 사용자 수 확인
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });
    console.log(`👥 활성 사용자: ${activeUsers}명`);

    // 파트너 신청 대기 수 확인
    const pendingApplications = await prisma.partnerApplication.count({
      where: { status: 'PENDING' }
    });
    console.log(`⏳ 파트너 신청 대기: ${pendingApplications}건`);

    // 활성 계약 수 확인
    const activeContracts = await prisma.contract.count({
      where: { status: 'ACTIVE' }
    });
    console.log(`📋 활성 계약: ${activeContracts}건`);

    // 최근 활동 로그 확인
    const recentActivities = await prisma.activityLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24시간 이내
        }
      }
    });
    console.log(`🕐 최근 24시간 활동: ${recentActivities}건`);

    console.log('\n✅ 전체 데이터 확인 완료!');

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  checkAllData()
    .then(() => {
      console.log('✅ 전체 데이터 확인 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 전체 데이터 확인 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { checkAllData };
