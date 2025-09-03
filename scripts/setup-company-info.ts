import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupCompanyInfo() {
  console.log('회사정보 설정을 시작합니다...');

  try {
    // 기존 활성화된 회사정보 비활성화
    await prisma.companyInfo.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // 새로운 회사정보 생성
    const companyInfo = await prisma.companyInfo.create({
      data: {
        companyName: '세일즈 파트너',
        companyLogo: '/company-logo.jpg', // 최상단용 로고
        bottomLogo: '/company-logo.jpg',  // Footer용 로고
        businessNumber: '000-00-00000',
        representative: '대표자명',
        address: '서울특별시 강남구 테헤란로 123',
        phone: '02-0000-0000',
        email: 'info@salespartner.com',
        website: 'https://salespartner.com',
        description: '이미 내는 돈으로 매월 수익 창출. 전국 800+ 성공 파트너와 함께하는 안전한 네트워크',
        isActive: true
      }
    });

    console.log('✅ 회사정보가 성공적으로 설정되었습니다!');
    console.log(`회사명: ${companyInfo.companyName}`);
    console.log(`연락처: ${companyInfo.phone}`);
    console.log(`이메일: ${companyInfo.email}`);

  } catch (error) {
    console.error('❌ 회사정보 설정 중 오류가 발생했습니다:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupCompanyInfo();
