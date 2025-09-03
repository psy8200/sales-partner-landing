import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupReferralCodes() {
  try {
    console.log('🔧 추천인코드 설정 시작...');

    // 1. CompanyInfo 테이블에 기본 회사정보 생성 (이미 있다면 건너뜀)
    const companyInfo = await prisma.companyInfo.findFirst();
    
    if (!companyInfo) {
      console.log('📝 CompanyInfo 테이블에 기본 회사정보 생성...');
      await prisma.companyInfo.create({
        data: {
          companyName: '세일즈파트너',
          companyLogo: '/company-logo.jpg',
          businessNumber: '123-45-67890',
          representative: '대표자',
          address: '서울시 강남구',
          phone: '02-1234-5678',
          email: 'admin@salespartner.com'
        }
      });
      console.log('✅ 기본 회사정보 생성 완료');
    } else {
      console.log('✅ CompanyInfo 테이블 존재 확인');
    }

    // 2. 기존 사용자들에게 기본 추천인코드 설정
    const users = await prisma.user.findMany({
      where: {
        referralCode: ""
      }
    });

    console.log(`📊 ${users.length}명의 사용자에게 추천인코드 설정 필요`);

    for (const user of users) {
      // 전화번호 뒤 8자리를 추천인코드로 사용
      const phoneDigits = user.phone.replace(/\D/g, '');
      const referralCode = phoneDigits.slice(-8) || 'SP' + user.id.slice(-6);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          referralCode: referralCode,
          referralCodeConfirmed: true // 기존 사용자는 자동 확정
        }
      });
      
      console.log(`✅ ${user.name} (${user.phone}) -> 추천인코드: ${referralCode}`);
    }

    console.log('🎉 추천인코드 설정 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupReferralCodes();
