const { PrismaClient } = require('@prisma/client');

// GitHub 최신 데이터베이스 사용
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./latest-github.db"
    }
  }
});

async function checkGitHubTables() {
  try {
    console.log('🔍 GitHub 최신 커밋의 데이터베이스 테이블 확인...');

    // 모든 테이블의 데이터 개수 확인
    const tables = [
      'User', 'PartnerApplication', 'Consultation', 'Contract', 
      'Payment', 'Settlement', 'ProfitItem', 'ItemSetting',
      'CompanyInfo', 'Notification', 'ActivityLog'
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`📊 ${table}: ${count}건`);
      } catch (error) {
        console.log(`❌ ${table}: 테이블 없음 또는 오류`);
      }
    }

  } catch (error) {
    console.error('❌ 테이블 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGitHubTables();





