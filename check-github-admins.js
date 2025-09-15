const { PrismaClient } = require('@prisma/client');

// GitHub 최신 데이터베이스 사용
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./latest-github.db"
    }
  }
});

async function checkGitHubAdmins() {
  try {
    console.log('🔍 GitHub 최신 커밋의 관리자 데이터 확인...');

    const users = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      }
    });

    console.log(`📊 총 사용자: ${users.length}명`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.phone}`);
    });

    // 관리자 역할 필터링
    const admins = users.filter(user => 
      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    );

    console.log(`\n👑 관리자 계정: ${admins.length}명`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
      });
    } else {
      console.log('❌ 관리자 계정이 없습니다.');
    }

    // 회사 정보 확인
    const companyInfo = await prisma.companyInfo.findMany();
    console.log(`\n🏢 회사 정보: ${companyInfo.length}건`);
    
    if (companyInfo.length > 0) {
      companyInfo.forEach((company, index) => {
        console.log(`${index + 1}. ${company.companyName} - ${company.businessNumber}`);
      });
    } else {
      console.log('❌ 회사 정보가 없습니다.');
    }

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGitHubAdmins();
