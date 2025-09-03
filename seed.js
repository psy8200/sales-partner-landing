const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 데이터베이스 시드 시작...');

  // 기존 데이터 삭제
  await prisma.user.deleteMany();
  await prisma.question.deleteMany();
  await prisma.partnerApplication.deleteMany();

  // 관리자 계정 생성
  const adminPassword = await bcrypt.hash('12345678', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      phone: '010-1234-5678',
      name: '관리자',
      passwordHash: adminPassword,
      role: 'ADMIN',
      partnerStatus: 'APPROVED',
      status: 'ACTIVE',
    },
  });

  // 일반 회원 계정 생성
  const userPassword = await bcrypt.hash('12345678', 10);
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@example.com',
      phone: '010-1111-1111',
      name: '김일반',
      passwordHash: userPassword,
      role: 'GENERAL',
      partnerStatus: 'NOT_APPLIED',
      status: 'ACTIVE',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'user2@example.com',
      phone: '010-2222-2222',
      name: '이파트너',
      passwordHash: userPassword,
      role: 'GENERAL',
      partnerStatus: 'PARTNER_APPLIED',
      status: 'ACTIVE',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'user3@example.com',
      phone: '010-3333-3333',
      name: '박승인',
      passwordHash: userPassword,
      role: 'MEMBER',
      partnerStatus: 'APPROVED',
      status: 'ACTIVE',
    },
  });

  // 파트너신청 데이터 생성
  await prisma.partnerApplication.create({
    data: {
      userId: user2.id,
      availableDate: '2024-01-25',
      availableTime: '14:00-15:00',
      preferredTime: '오후 (13:00-17:00)',
      additionalNote: '상담 가능한 시간에 연락 부탁드립니다.',
      status: 'PENDING',
    },
  });

  // 문의글 데이터 생성
  await prisma.question.create({
    data: {
      userId: user1.id,
      title: '파트너 신청 관련 문의',
      content: '파트너 신청 절차에 대해 궁금한 점이 있습니다.',
      status: 'PENDING',
    },
  });

  await prisma.question.create({
    data: {
      userId: user2.id,
      title: '수익 정산 문의',
      content: '이번 달 수익 정산이 언제 되는지 알려주세요.',
      status: 'ANSWERED',
      answer: '매월 25일에 정산 처리됩니다.',
      answeredAt: new Date(),
    },
  });

  console.log('✅ 데이터베이스 시드 완료!');
  console.log('관리자 계정: admin@example.com / 12345678');
  console.log('일반 회원 계정: user1@example.com / 12345678');
}

main()
  .catch((e) => {
    console.error('❌ 시드 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });











