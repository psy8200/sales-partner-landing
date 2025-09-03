import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixRealUsers() {
  try {
    console.log('🔧 실제 가입 정보로 회원 데이터를 수정합니다...');
    
    // 기존 임의로 생성된 회원들 삭제
    const deleteResult = await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'kimseongbun@example.com' },
          { email: 'parksuyong@example.com' }
        ]
      }
    });
    console.log(`🗑️ 임의로 생성된 회원 ${deleteResult.count}명 삭제 완료`);
    
    // 김성분 회원 생성 (실제 정보)
    const kimPassword = await bcrypt.hash('87587200', 12);
    const kimUser = await prisma.user.create({
      data: {
        email: '58248200@example.com', // 아이디를 이메일로 사용
        phone: '010-1234-5678', // 임시 전화번호
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
    console.log(`✅ 김성분 회원 생성 완료: ${kimUser.name} (아이디: 58248200, 비밀번호: 87587200)`);
    
    // 박수용 회원 생성 (실제 정보)
    const parkPassword = await bcrypt.hash('87587200', 12);
    const parkUser = await prisma.user.create({
      data: {
        email: '58248201@example.com', // 아이디를 이메일로 사용
        phone: '010-9876-5432', // 임시 전화번호
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
    console.log(`✅ 박수용 회원 생성 완료: ${parkUser.name} (아이디: 58248201, 비밀번호: 87587200)`);
    
    // 전체 사용자 수 확인
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 총 사용자 수: ${totalUsers}명`);
    
    // 실제 회원들 확인
    const realUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: '김성분' },
          { name: '박수용' }
        ]
      },
      select: {
        name: true,
        email: true,
        phone: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 실제 회원 정보:');
    realUsers.forEach((user, index) => {
      const id = user.email.split('@')[0];
      console.log(`${index + 1}. ${user.name} - 아이디: ${id}, 비밀번호: 87587200`);
    });
    
    console.log('\n✅ 실제 가입 정보로 수정 완료!');
    
  } catch (error) {
    console.error('❌ 회원 수정 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRealUsers();








