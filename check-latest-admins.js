const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLatestAdmins() {
  try {
    console.log('🔍 최신 백업의 관리자 데이터 확인...');

    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN', 'MANAGER']
        }
      },
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
      }
    });

    console.log(`👑 관리자 계정: ${admins.length}명`);
    
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role} - ${admin.phone}`);
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

checkLatestAdmins();





