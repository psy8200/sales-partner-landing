import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCompanyInfo() {
  try {
    console.log('🏢 회사정보 생성 중...\n');

    // 기존 회사정보 확인
    const existingCompany = await prisma.companyInfo.findFirst({
      where: { isActive: true },
    });

    if (existingCompany) {
      console.log('ℹ️ 이미 활성화된 회사정보가 있습니다.');
      console.log(`회사명: ${existingCompany.companyName}`);
      console.log(`기본추천인코드: "${existingCompany.referralCodeDefault}"`);
      return;
    }

    // 새로운 회사정보 생성
    const companyInfo = await prisma.companyInfo.create({
      data: {
        companyName: '스마트파트너',
        companyAddress: '서울시 강남구',
        companyPhone: '02-1234-5678',
        companyEmail: 'info@smartpartner.com',
        referralCodeDefault: 'SP001', // 기본추천인코드
        companyLogo: '', // 빈 문자열로 설정
        isActive: true,
      },
    });

    console.log('✅ 회사정보 생성 완료!');
    console.log(`회사명: ${companyInfo.companyName}`);
    console.log(`기본추천인코드: "${companyInfo.referralCodeDefault}"`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCompanyInfo();
