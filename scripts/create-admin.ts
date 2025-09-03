import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🛡️ 관리자 계정 생성 중...');
  
  try {
    await prisma.$connect();

    // 기존 관리자 확인
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      console.log('⚠️ 이미 관리자 계정이 존재합니다:');
      console.log(`- 이메일: ${existingAdmin.email}`);
      console.log(`- 이름: ${existingAdmin.name}`);
      return;
    }

    // 새 관리자 생성
    const admin = await prisma.user.create({
      data: {
        name: '관리자',
        email: 'admin@sales-partner.com',
        passwordHash: 'admin1234', // 실제 운영시에는 해시된 비밀번호 사용
        phone: '010-0000-0000',
        role: 'ADMIN',
        level: 10,
        points: 10000,
        partnerStatus: 'APPROVED'
      }
    });

    console.log('✅ 관리자 계정 생성 완료:');
    console.log(`- 이메일: ${admin.email}`);
    console.log(`- 이름: ${admin.name}`);
    console.log(`- 역할: ${admin.role}`);
    console.log(`- 레벨: ${admin.level}`);
    console.log(`- 포인트: ${admin.points}`);
    console.log('\n🔑 로그인 정보:');
    console.log('- 이메일: admin@sales-partner.com');
    console.log('- 비밀번호: admin1234');

  } catch (error) {
    console.error('❌ 관리자 계정 생성 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
