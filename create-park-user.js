const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createParkUser() {
  try {
    console.log('🔍 박수용님 계정 생성 중...');
    
    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 박수용님 계정 생성
    const user = await prisma.user.create({
      data: {
        name: '박수용',
        email: 'parksuyong@example.com',
        phone: '01022221234',
        passwordHash: hashedPassword,
        role: 'MEMBER',
        status: 'ACTIVE',
        isActive: true,
        partnerStatus: 'ACTIVE',
        points: 55000,
        level: 1,
        bankName: '국민은행',
        bankAccount: '12345678901234',
        accountHolder: '박수용',
        settlementCycle: 'MONTHLY',
        referralCode: 'PARK001',
        myCode: 'PARK001'
      }
    });
    
    console.log('✅ 박수용님 계정 생성 완료:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - 이름: ${user.name}`);
    console.log(`   - 전화번호: ${user.phone}`);
    console.log(`   - 이메일: ${user.email}`);
    console.log(`   - 역할: ${user.role}`);
    console.log(`   - 상태: ${user.status}`);
    console.log(`   - 포인트: ${user.points}`);
    console.log(`   - 레벨: ${user.level}`);
    console.log(`   - 추천코드: ${user.referralCode}`);
    console.log(`   - 비밀번호: 123456`);
    
  } catch (error) {
    console.error('❌ 박수용님 계정 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createParkUser();
