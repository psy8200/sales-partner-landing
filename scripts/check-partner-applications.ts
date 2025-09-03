import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPartnerApplications() {
  try {
    console.log('🔍 파트너신청 데이터 확인 중...\n');
    
    const apps = await prisma.partnerApplication.findMany({
      include: {
        user: true
      }
    });

    console.log(`📊 총 ${apps.length}개의 파트너신청 데이터 발견\n`);

    apps.forEach((app, index) => {
      console.log(`=== 파트너신청 #${index + 1} ===`);
      console.log(`ID: ${app.id}`);
      console.log(`사용자: ${app.user.name} (${app.user.email})`);
      console.log(`사용자 referralCode: "${app.user.referralCode}"`);
      console.log(`파트너신청 referrer: "${app.referrer}"`);
      console.log(`지역: "${app.area}"`);
      console.log(`추가메모: "${app.additionalNote}"`);
      console.log(`상태: ${app.status}`);
      console.log(`생성일: ${app.createdAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPartnerApplications();
