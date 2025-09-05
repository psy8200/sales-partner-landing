import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCompanyInfo() {
  try {
    console.log('🔍 회사정보 데이터 확인 중...');
    
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (companyInfo) {
      console.log('\n📋 저장된 회사정보:');
      console.log('─'.repeat(50));
      console.log(`ID: ${companyInfo.id}`);
      console.log(`회사명: "${companyInfo.companyName}"`);
      console.log(`최고관리자: "${companyInfo.representative}"`);
      console.log(`사업자등록번호: "${companyInfo.businessNumber}"`);
      console.log(`주소: "${companyInfo.address}"`);
      console.log(`전화번호: "${companyInfo.phone}"`);
      console.log(`이메일: "${companyInfo.email}"`);
      console.log(`웹사이트: "${companyInfo.website}"`);
      console.log(`회사설명: "${companyInfo.description}"`);
      console.log(`기본 추천인코드: "${companyInfo.referralCodeDefault}"`);
      console.log(`생성일: ${companyInfo.createdAt}`);
      console.log(`수정일: ${companyInfo.updatedAt}`);
      console.log('─'.repeat(50));
      
      // 바이트 배열로 확인
      console.log('\n🔍 바이트 배열 확인:');
      console.log(`회사명 바이트: ${Buffer.from(companyInfo.companyName, 'utf8').toString('hex')}`);
      console.log(`최고관리자 바이트: ${Buffer.from(companyInfo.representative, 'utf8').toString('hex')}`);
      console.log(`주소 바이트: ${Buffer.from(companyInfo.address, 'utf8').toString('hex')}`);
    } else {
      console.log('❌ 회사정보가 없습니다.');
    }
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompanyInfo();
