import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createMissingUsers() {
  try {
    console.log('👥 누락된 회원들을 생성합니다...');
    
    // 기존 사용자 확인
    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: '김성분' },
          { name: '박수용' }
        ]
      }
    });
    
    console.log(`📋 기존 사용자 수: ${existingUsers.length}`);
    existingUsers.forEach(user => {
      console.log(`  • ${user.name} (${user.email})`);
    });
    
    // 김성분 회원 생성
    const kimPassword = await bcrypt.hash('1234', 12);
    const kimUser = await prisma.user.upsert({
      where: { email: 'kimseongbun@example.com' },
      update: {},
      create: {
        email: 'kimseongbun@example.com',
        phone: '010-1234-5678',
        name: '김성분',
        passwordHash: kimPassword,
        status: 'ACTIVE',
        role: 'GENERAL',
        partnerStatus: 'NOT_APPLIED',
        points: 0,
        level: 0,
        marketingAgreed: true,
        isActive: true
      }
    });
    console.log(`✅ 김성분 회원 생성/업데이트 완료: ${kimUser.name} (${kimUser.email})`);
    
    // 박수용 회원 생성
    const parkPassword = await bcrypt.hash('1234', 12);
    const parkUser = await prisma.user.upsert({
      where: { email: 'parksuyong@example.com' },
      update: {},
      create: {
        email: 'parksuyong@example.com',
        phone: '010-9876-5432',
        name: '박수용',
        passwordHash: parkPassword,
        status: 'ACTIVE',
        role: 'GENERAL',
        partnerStatus: 'NOT_APPLIED',
        points: 0,
        level: 0,
        marketingAgreed: true,
        isActive: true
      }
    });
    console.log(`✅ 박수용 회원 생성/업데이트 완료: ${parkUser.name} (${parkUser.email})`);
    
    // 전체 사용자 수 확인
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 총 사용자 수: ${totalUsers}명`);
    
    // 최근 생성된 사용자들 확인
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 최근 사용자 10명:');
    recentUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.phone}`);
    });
    
  } catch (error) {
    console.error('❌ 회원 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingUsers();








