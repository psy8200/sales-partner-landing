import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 사용자 상세 정보 확인 스크립트
 * 사용자 데이터의 상세 현황을 확인합니다.
 */
async function checkUsersDetail() {
  try {
    console.log('👥 사용자 상세 정보 확인 중...\n');

    // 전체 사용자 수
    const totalUsers = await prisma.user.count();
    console.log(`📊 전체 사용자 수: ${totalUsers}명\n`);

    // 역할별 사용자 수
    console.log('👤 역할별 사용자 현황:');
    console.log('─'.repeat(40));
    
    const roles = ['ADMIN', 'MANAGER', 'STAFF', 'MEMBER', 'GENERAL'];
    for (const role of roles) {
      const count = await prisma.user.count({
        where: { role: role as any }
      });
      console.log(`${role.padEnd(10)}: ${count.toString().padStart(4)}명`);
    }

    // 상태별 사용자 수
    console.log('\n📈 상태별 사용자 현황:');
    console.log('─'.repeat(40));
    
    const statuses = ['PENDING', 'ACTIVE', 'SUSPENDED', 'DELETED'];
    for (const status of statuses) {
      const count = await prisma.user.count({
        where: { status: status as any }
      });
      console.log(`${status.padEnd(10)}: ${count.toString().padStart(4)}명`);
    }

    // 파트너 상태별 사용자 수
    console.log('\n🤝 파트너 상태별 사용자 현황:');
    console.log('─'.repeat(40));
    
    const partnerStatuses = ['NOT_APPLIED', 'PARTNER_APPLIED', 'APPROVED'];
    for (const status of partnerStatuses) {
      const count = await prisma.user.count({
        where: { partnerStatus: status as any }
      });
      console.log(`${status.padEnd(15)}: ${count.toString().padStart(4)}명`);
    }

    // 포인트 현황
    console.log('\n💰 포인트 현황:');
    console.log('─'.repeat(40));
    
    const usersWithPoints = await prisma.user.count({
      where: { points: { gt: 0 } }
    });
    console.log(`포인트 보유자: ${usersWithPoints}명`);

    const totalPoints = await prisma.user.aggregate({
      _sum: { points: true }
    });
    console.log(`총 포인트: ${totalPoints._sum.points?.toLocaleString() || 0}점`);

    const avgPoints = await prisma.user.aggregate({
      _avg: { points: true }
    });
    console.log(`평균 포인트: ${avgPoints._avg.points?.toFixed(2) || 0}점`);

    // 레벨 현황
    console.log('\n🎯 레벨 현황:');
    console.log('─'.repeat(40));
    
    const levelStats = await prisma.user.groupBy({
      by: ['level'],
      _count: { level: true },
      orderBy: { level: 'asc' }
    });

    levelStats.forEach(stat => {
      console.log(`레벨 ${stat.level.toString().padEnd(3)}: ${stat._count.level.toString().padStart(4)}명`);
    });

    // 추천인 코드 현황
    console.log('\n🔗 추천인 코드 현황:');
    console.log('─'.repeat(40));
    
    const usersWithReferralCode = await prisma.user.count({
      where: { referralCode: { not: null } }
    });
    console.log(`추천인 코드 보유자: ${usersWithReferralCode}명`);

    const confirmedReferralCodes = await prisma.user.count({
      where: { referralCodeConfirmed: true }
    });
    console.log(`확인된 추천인 코드: ${confirmedReferralCodes}명`);

    // 최근 가입자 (7일 이내)
    console.log('\n🆕 최근 가입자 (7일 이내):');
    console.log('─'.repeat(40));
    
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`최근 7일 가입자: ${recentUsers}명`);

    // 최근 로그인 (7일 이내)
    const recentLogins = await prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });
    console.log(`최근 7일 로그인: ${recentLogins}명`);

    // 상위 사용자 정보
    console.log('\n🏆 상위 사용자 정보:');
    console.log('─'.repeat(40));
    
    const topUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        points: true,
        level: true,
        totalReferrals: true,
        role: true
      },
      orderBy: { points: 'desc' },
      take: 5
    });

    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   포인트: ${user.points}점, 레벨: ${user.level}, 추천: ${user.totalReferrals}명, 역할: ${user.role}`);
    });

    console.log('\n✅ 사용자 상세 정보 확인 완료!');

  } catch (error) {
    console.error('❌ 사용자 정보 확인 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  checkUsersDetail()
    .then(() => {
      console.log('✅ 사용자 상세 정보 확인 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 사용자 상세 정보 확인 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { checkUsersDetail };
