const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// 임시 데이터베이스 파일 사용
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./temp-admin.db"
    }
  }
});

async function checkAdminData() {
  try {
    console.log('🔍 이전 커밋의 관리자 데이터 확인...');

    // 모든 사용자 조회
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`📊 총 ${users.length}명의 사용자:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${user.phone}`);
    });

    // 관리자 역할 사용자 필터링
    const admins = users.filter(user => 
      user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'MANAGER'
    );

    console.log(`\n👑 관리자 계정 ${admins.length}명:`);
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
    });

    // 회사 정보 확인
    const companyInfo = await prisma.companyInfo.findMany();
    console.log(`\n🏢 회사 정보 ${companyInfo.length}건:`);
    companyInfo.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName} - ${company.businessNumber}`);
    });

  } catch (error) {
    console.error('❌ 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminData();





