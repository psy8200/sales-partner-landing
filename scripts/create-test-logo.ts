// 간단한 테스트용 로고 이미지 (Base64)
const testLogoBase64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMjU2M0VCIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5URVNUIExPR088L3RleHQ+Cjwvc3ZnPgo=`;

const bottomLogoBase64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRkY2QjM1Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5CT1RUT00gTE9HTzwvdGV4dD4KPC9zdmc+Cg==`;

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCompanyInfoWithTestLogos() {
  console.log('테스트 로고로 회사정보를 업데이트합니다...');

  try {
    // 기존 활성화된 회사정보 비활성화
    await prisma.companyInfo.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // 새로운 회사정보 생성 (테스트 로고 포함)
    const companyInfo = await prisma.companyInfo.create({
      data: {
        companyName: '세일즈 파트너 (테스트)',
        companyLogo: testLogoBase64, // 최상단용 테스트 로고
        bottomLogo: bottomLogoBase64, // Footer용 테스트 로고
        businessNumber: '000-00-00000',
        representative: '테스트 대표자',
        address: '서울특별시 강남구 테헤란로 123',
        phone: '02-0000-0000',
        email: 'test@salespartner.com',
        website: 'https://salespartner.com',
        description: '테스트용 회사정보입니다. 로고가 정상적으로 표시되는지 확인해주세요.',
        isActive: true
      }
    });

    console.log('✅ 테스트 로고가 포함된 회사정보가 성공적으로 업데이트되었습니다!');
    console.log(`회사명: ${companyInfo.companyName}`);
    console.log(`최상단 로고: ${companyInfo.companyLogo.substring(0, 50)}...`);
    console.log(`하단 로고: ${companyInfo.bottomLogo?.substring(0, 50)}...`);

  } catch (error) {
    console.error('❌ 테스트 로고 업데이트 중 오류가 발생했습니다:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCompanyInfoWithTestLogos();









