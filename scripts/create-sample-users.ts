import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSampleUsers() {
  try {
    console.log('🧪 샘플 사용자 데이터를 생성합니다...');

    // 기존 사용자 수 확인
    const existingCount = await prisma.user.count();
    console.log(`현재 사용자 수: ${existingCount}`);

    // 샘플 사용자 생성 (중복 방지)
    const sampleUsers = [];
    for (let i = 1; i <= 5; i++) {
      const email = `user${i}@example.com`;
      const phone = `010-1234-${String(i).padStart(4, '0')}`;
      
      // 기존 사용자 확인
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { phone }] }
      });

      if (existingUser) {
        console.log(`사용자 ${i} 이미 존재: ${email}`);
        continue;
      }

      const password = await bcrypt.hash('password123', 12);
      const user = await prisma.user.create({
        data: {
          email,
          phone,
          name: `테스트 사용자 ${i}`,
          passwordHash: password,
          status: 'ACTIVE',
          role: 'GENERAL',
          partnerStatus: 'NOT_APPLIED',
          isActive: true,
          marketingAgreed: Math.random() > 0.5,
        },
      });
      sampleUsers.push(user);
      console.log(`사용자 ${i} 생성 완료: ${email}`);
    }

    console.log(`✅ 총 ${sampleUsers.length}명의 샘플 사용자가 생성되었습니다.`);
    
    // 전체 사용자 수 확인
    const totalCount = await prisma.user.count();
    console.log(`전체 사용자 수: ${totalCount}`);

  } catch (error) {
    console.error('❌ 샘플 사용자 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleUsers();











