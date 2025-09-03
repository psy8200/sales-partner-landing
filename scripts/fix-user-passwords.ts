import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixUserPasswords() {
  console.log('🔧 일반회원 비밀번호 수정 중...');
  
  try {
    await prisma.$connect();

    // 샘플 사용자들 비밀번호 수정 (user1~user5)
    const sampleUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['user1@example.com', 'user2@example.com', 'user3@example.com', 'user4@example.com', 'user5@example.com']
        }
      }
    });

    for (const user of sampleUsers) {
      const newPassword = await bcrypt.hash('12345678', 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPassword }
      });
      console.log(`✅ ${user.email} 비밀번호 수정 완료`);
    }

    // 테스트 사용자 비밀번호 수정
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (testUser) {
      const newPassword = await bcrypt.hash('12345678', 12);
      await prisma.user.update({
        where: { id: testUser.id },
        data: { passwordHash: newPassword }
      });
      console.log(`✅ ${testUser.email} 비밀번호 수정 완료`);
    }

    console.log('\n🔑 수정된 로그인 정보:');
    console.log('📋 샘플 사용자들 (user1~user5):');
    console.log('- 아이디: 전화번호 마지막 8자리');
    console.log('- 비밀번호: 12345678');
    console.log('');
    console.log('📋 테스트 사용자:');
    console.log('- 아이디: 12345678');
    console.log('- 비밀번호: 12345678');
    console.log('');
    console.log('💡 모든 일반회원의 비밀번호가 12345678로 통일되었습니다.');

  } catch (error) {
    console.error('❌ 비밀번호 수정 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserPasswords();









