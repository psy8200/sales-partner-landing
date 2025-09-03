import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserStatus() {
  try {
    console.log('=== 사용자별 상세 상태 확인 ===\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        partnerStatus: true,
        points: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`총 ${users.length}명의 사용자:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name} (${user.email})`);
      console.log(`   전화번호: ${user.phone}`);
      console.log(`   역할: ${user.role}`);
      console.log(`   파트너상태: ${user.partnerStatus}`);
      console.log(`   포인트: ${user.points}`);
      console.log(`   가입일: ${user.createdAt.toLocaleDateString('ko-KR')}`);
      console.log(`   최종수정: ${user.updatedAt.toLocaleDateString('ko-KR')}`);
      
      // 파트너신청 상태가 있는지 확인
      if (user.partnerStatus !== 'NOT_APPLIED') {
        console.log(`   ⚠️  파트너신청 상태: ${user.partnerStatus}`);
      }
    });

    // 파트너신청 데이터 확인
    console.log('\n=== 파트너신청 데이터 확인 ===');
    const partnerApplications = await prisma.partnerApplication.findMany({
      select: {
        id: true,
        userId: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`총 ${partnerApplications.length}건의 파트너신청:`);
    
    if (partnerApplications.length === 0) {
      console.log('   파트너신청 데이터가 없습니다.');
    } else {
      partnerApplications.forEach((app, index) => {
        console.log(`\n${index + 1}. ID: ${app.id}`);
        console.log(`   사용자: ${app.user?.name} (${app.user?.email})`);
        console.log(`   상태: ${app.status}`);
        console.log(`   신청일: ${app.createdAt.toLocaleDateString('ko-KR')}`);
      });
    }

  } catch (error) {
    console.error('오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStatus();
