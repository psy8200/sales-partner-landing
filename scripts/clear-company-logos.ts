import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearCompanyLogos() {
  console.log('기존 회사 로고 데이터를 완전히 삭제하고 초기화합니다...');

  try {
    // 모든 회사정보 삭제
    await prisma.companyInfo.deleteMany({});
    console.log('✅ 기존 회사정보가 모두 삭제되었습니다.');

    // 새로운 기본 회사정보 생성 (로고 없이)
    const newCompanyInfo = await prisma.companyInfo.create({
      data: {
        companyName: '주식회사 세일즈파트너스',
        companyLogo: '', // 빈 값으로 설정
        bottomLogo: '',  // 빈 값으로 설정
        businessNumber: '367-87-02260',
        representative: '박수용',
        address: '서울특별시 금천구 디지털로9길 68 대륭포스트타워5차 232호',
        phone: '1600-5360',
        email: 'psy777@naver.com',
        website: 'https://salespartner.com',
        description: '평생 연금을 만들어보세요. 행복한 노후보장 ~!!',
        isActive: true
      }
    });

    console.log('✅ 새로운 기본 회사정보가 생성되었습니다!');
    console.log(`회사명: ${newCompanyInfo.companyName}`);
    console.log(`상단 로고: ${newCompanyInfo.companyLogo || '없음'}`);
    console.log(`하단 로고: ${newCompanyInfo.bottomLogo || '없음'}`);
    console.log('이제 어드민에서 새로운 로고를 업로드해주세요.');

  } catch (error) {
    console.error('❌ 로고 초기화 중 오류가 발생했습니다:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearCompanyLogos();









