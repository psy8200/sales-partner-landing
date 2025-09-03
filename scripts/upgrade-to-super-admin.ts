import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upgradeToSuperAdmin() {
  try {
    console.log('🔧 최고등급 어드민으로 업그레이드 중...\n');

    // 현재 ADMIN 역할을 가진 사용자 찾기
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        status: true
      }
    });

    console.log(`📊 현재 ADMIN 사용자 ${adminUsers.length}명:`);
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - 역할: ${user.role}, 레벨: ${user.level}, 상태: ${user.status}`);
    });

    if (adminUsers.length === 0) {
      console.log('❌ ADMIN 역할을 가진 사용자가 없습니다.');
      return;
    }

    // 첫 번째 ADMIN 사용자를 최고등급으로 업그레이드
    const targetUser = adminUsers[0];
    console.log(`\n🎯 업그레이드 대상: ${targetUser.name} (${targetUser.email})`);

    const result = await prisma.user.update({
      where: { id: targetUser.id },
      data: {
        role: 'ADMIN',
        level: 10,
        status: 'ACTIVE'
      }
    });

    console.log(`✅ 최고등급 어드민 업그레이드 완료!`);
    console.log(`사용자: ${result.name} (${result.email})`);
    console.log(`역할: ADMIN, 레벨: 10, 상태: ACTIVE`);

    // 확인
    const updatedUser = await prisma.user.findUnique({
      where: { id: targetUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        level: true,
        status: true
      }
    });

    console.log('\n📋 업데이트 확인:');
    console.log(`ID: ${updatedUser?.id}`);
    console.log(`이름: ${updatedUser?.name}`);
    console.log(`이메일: ${updatedUser?.email}`);
    console.log(`역할: ${updatedUser?.role}`);
    console.log(`레벨: ${updatedUser?.level}`);
    console.log(`상태: ${updatedUser?.status}`);

    console.log('\n🎉 이제 파트너승인처리 버튼이 정상 작동할 것입니다!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeToSuperAdmin();
