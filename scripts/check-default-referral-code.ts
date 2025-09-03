import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDefaultReferralCode() {
  try {
    console.log('🔍 기본추천인코드 확인 중...\n');

    // 회사정보에서 기본추천인코드 확인
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      select: { 
        id: true,
        referralCodeDefault: true,
        companyName: true,
      },
    });

    if (companyInfo) {
      console.log('📋 회사정보:');
      console.log(`회사명: ${companyInfo.companyName}`);
      console.log(`기본추천인코드: "${companyInfo.referralCodeDefault}"`);
    } else {
      console.log('❌ 활성화된 회사정보가 없습니다.');
    }

    // 현재 파트너신청 데이터의 referrer 확인
    const applications = await prisma.partnerApplication.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
            referralCode: true,
          },
        },
      },
    });

    console.log('\n📊 파트너신청 데이터:');
    applications.forEach((app, index) => {
      console.log(`\n=== 파트너신청 #${index + 1} ===`);
      console.log(`사용자: ${app.user.name} (${app.user.email})`);
      console.log(`사용자 referralCode: "${app.user.referralCode}"`);
      console.log(`파트너신청 referrer: "${app.referrer}"`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDefaultReferralCode();
