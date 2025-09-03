import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('테스트용 일반회원을 생성 중...');

    // 기존 테스트 사용자가 있는지 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('테스트 사용자가 이미 존재합니다. 업데이트합니다...');
      
      const updatedUser = await prisma.user.update({
        where: { email: 'test@example.com' },
        data: {
          role: 'GENERAL',
          partnerStatus: 'NOT_APPLIED',
          status: 'ACTIVE',
          isActive: true,
        }
      });

      console.log('테스트 사용자 업데이트 완료:', {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        partnerStatus: updatedUser.partnerStatus
      });
    } else {
      // 새 테스트 사용자 생성
      const hashedPassword = await bcrypt.hash('0130', 12);
      
      const newUser = await prisma.user.create({
        data: {
          name: '테스트 사용자',
          email: 'test@example.com',
          phone: '010-1234-5678',
          passwordHash: hashedPassword,
          role: 'GENERAL',
          partnerStatus: 'NOT_APPLIED',
          status: 'ACTIVE',
          isActive: true,
          marketingAgreed: false,
        }
      });

      console.log('테스트 사용자 생성 완료:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        partnerStatus: newUser.partnerStatus
      });
    }

    console.log('\n테스트 계정 정보:');
    console.log('- 로그인 ID: 12345678 (전화번호 마지막 8자리)');
    console.log('- 비밀번호: 0130');
    console.log('- 역할: 예비파트너 (GENERAL)');
    console.log('- 파트너 상태: 미신청 (NOT_APPLIED)');

  } catch (error) {
    console.error('테스트 사용자 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
