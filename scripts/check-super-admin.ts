import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * 슈퍼 관리자 정보 확인 스크립트
 * 슈퍼 관리자 계정의 상태와 권한을 확인합니다.
 */
async function checkSuperAdmin() {
  try {
    console.log('👑 슈퍼 관리자 정보 확인 중...\n');

    // 슈퍼 관리자 계정 조회
    const superAdmins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        status: true,
        role: true,
        partnerStatus: true,
        points: true,
        level: true,
        lastLoginAt: true,
        loginCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log(`📊 슈퍼 관리자 계정 수: ${superAdmins.length}개\n`);

    if (superAdmins.length === 0) {
      console.log('⚠️ 슈퍼 관리자 계정이 없습니다!');
      console.log('💡 다음 명령어로 슈퍼 관리자를 생성하세요:');
      console.log('   npm run create:admin');
      return;
    }

    // 각 슈퍼 관리자 정보 출력
    superAdmins.forEach((admin, index) => {
      console.log(`👑 슈퍼 관리자 #${index + 1}:`);
      console.log('─'.repeat(50));
      console.log(`이름: ${admin.name}`);
      console.log(`이메일: ${admin.email}`);
      console.log(`전화번호: ${admin.phone}`);
      console.log(`상태: ${admin.status}`);
      console.log(`역할: ${admin.role}`);
      console.log(`파트너 상태: ${admin.partnerStatus}`);
      console.log(`포인트: ${admin.points}점`);
      console.log(`레벨: ${admin.level}`);
      console.log(`활성 상태: ${admin.isActive ? '활성' : '비활성'}`);
      console.log(`마지막 로그인: ${admin.lastLoginAt ? admin.lastLoginAt.toLocaleString('ko-KR') : '없음'}`);
      console.log(`로그인 횟수: ${admin.loginCount}회`);
      console.log(`생성일: ${admin.createdAt.toLocaleString('ko-KR')}`);
      console.log(`수정일: ${admin.updatedAt.toLocaleString('ko-KR')}`);
      console.log('');
    });

    // 슈퍼 관리자 권한 확인
    console.log('🔐 슈퍼 관리자 권한 확인:');
    console.log('─'.repeat(50));

    const activeAdmins = superAdmins.filter(admin => admin.isActive);
    const inactiveAdmins = superAdmins.filter(admin => !admin.isActive);

    console.log(`활성 관리자: ${activeAdmins.length}명`);
    console.log(`비활성 관리자: ${inactiveAdmins.length}명`);

    // 최근 로그인한 관리자
    const recentlyLoggedIn = superAdmins.filter(admin => 
      admin.lastLoginAt && 
      admin.lastLoginAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );
    console.log(`최근 7일 로그인: ${recentlyLoggedIn.length}명`);

    // 로그인하지 않은 관리자
    const neverLoggedIn = superAdmins.filter(admin => !admin.lastLoginAt);
    console.log(`로그인 이력 없음: ${neverLoggedIn.length}명`);

    // 관리자별 활동 통계
    console.log('\n📊 관리자별 활동 통계:');
    console.log('─'.repeat(50));

    for (const admin of superAdmins) {
      // 관리자 활동 로그 수
      const activityCount = await prisma.activityLog.count({
        where: { userId: admin.id }
      });

      // 관리자가 처리한 파트너 신청 수
      const processedApplications = await prisma.partnerApplication.count({
        where: { 
          OR: [
            { approvedBy: admin.id },
            { rejectedBy: admin.id }
          ]
        }
      });

      // 관리자가 생성한 계약 수
      const createdContracts = await prisma.contract.count({
        where: { createdBy: admin.id }
      });

      console.log(`\n👤 ${admin.name} (${admin.email}):`);
      console.log(`  활동 로그: ${activityCount}건`);
      console.log(`  처리한 파트너 신청: ${processedApplications}건`);
      console.log(`  생성한 계약: ${createdContracts}건`);
    }

    // 시스템 보안 상태 확인
    console.log('\n🔒 시스템 보안 상태:');
    console.log('─'.repeat(50));

    // 비활성 관리자 확인
    if (inactiveAdmins.length > 0) {
      console.log(`⚠️ 비활성 관리자 ${inactiveAdmins.length}명 발견:`);
      inactiveAdmins.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email})`);
      });
    }

    // 로그인 이력이 없는 관리자 확인
    if (neverLoggedIn.length > 0) {
      console.log(`⚠️ 로그인 이력이 없는 관리자 ${neverLoggedIn.length}명 발견:`);
      neverLoggedIn.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email})`);
      });
    }

    // 오래된 관리자 계정 확인 (30일 이상 로그인 안함)
    const oldAdmins = superAdmins.filter(admin => 
      admin.lastLoginAt && 
      admin.lastLoginAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    if (oldAdmins.length > 0) {
      console.log(`⚠️ 30일 이상 로그인하지 않은 관리자 ${oldAdmins.length}명 발견:`);
      oldAdmins.forEach(admin => {
        console.log(`  - ${admin.name} (${admin.email}) - 마지막 로그인: ${admin.lastLoginAt?.toLocaleDateString('ko-KR')}`);
      });
    }

    // 권장사항
    console.log('\n💡 권장사항:');
    console.log('─'.repeat(50));

    if (superAdmins.length === 1) {
      console.log('⚠️ 슈퍼 관리자가 1명뿐입니다. 백업 관리자를 추가하는 것을 권장합니다.');
    }

    if (activeAdmins.length === 0) {
      console.log('❌ 활성 관리자가 없습니다. 관리자 계정을 활성화하세요.');
    }

    if (recentlyLoggedIn.length === 0) {
      console.log('⚠️ 최근 로그인한 관리자가 없습니다. 관리자 활동을 확인하세요.');
    }

    console.log('\n✅ 슈퍼 관리자 정보 확인 완료!');

  } catch (error) {
    console.error('❌ 슈퍼 관리자 정보 확인 중 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  checkSuperAdmin()
    .then(() => {
      console.log('✅ 슈퍼 관리자 정보 확인 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 슈퍼 관리자 정보 확인 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { checkSuperAdmin };
