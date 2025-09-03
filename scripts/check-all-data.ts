import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('🔍 전체 데이터베이스 상태 확인 중...\n');
    
    // 사용자 데이터
    const totalUsers = await prisma.user.count();
    const generalUsers = await prisma.user.count({ where: { role: 'GENERAL' } });
    const memberUsers = await prisma.user.count({ where: { role: 'MEMBER' } });
    const adminUsers = await prisma.user.count({ where: { role: 'ADMIN' } });
    
    console.log('👥 사용자 데이터:');
    console.log(`  • 총 사용자 수: ${totalUsers}명`);
    console.log(`  • 일반회원: ${generalUsers}명`);
    console.log(`  • 파트너회원: ${memberUsers}명`);
    console.log(`  • 관리자: ${adminUsers}명`);
    
    // 아이템 설정 데이터
    const totalItems = await prisma.itemSetting.count();
    const itemStats = await prisma.itemSetting.groupBy({
      by: ['category'],
      _count: { category: true }
    });
    
    console.log('\n📦 아이템 설정 데이터:');
    console.log(`  • 총 아이템 수: ${totalItems}개`);
    itemStats.forEach(stat => {
      console.log(`  • ${stat.category}: ${stat._count.category}개`);
    });
    
    // 계약 데이터
    const totalContracts = await prisma.contract.count();
    const contractStats = await prisma.contract.groupBy({
      by: ['itemCategory'],
      _count: { itemCategory: true }
    });
    
    console.log('\n📋 계약 데이터:');
    console.log(`  • 총 계약 수: ${totalContracts}건`);
    if (contractStats.length > 0) {
      contractStats.forEach(stat => {
        console.log(`  • ${stat.itemCategory}: ${stat._count.itemCategory}건`);
      });
    } else {
      console.log('  • 계약 데이터 없음');
    }
    
    // 파트너 신청 데이터
    const totalApplications = await prisma.partnerApplication.count();
    console.log('\n🤝 파트너 신청 데이터:');
    console.log(`  • 총 신청 수: ${totalApplications}건`);
    
    // 상담 데이터
    const totalConsultations = await prisma.consultation.count();
    console.log('\n💬 상담 데이터:');
    console.log(`  • 총 상담 수: ${totalConsultations}건`);
    
    console.log('\n✅ 데이터베이스 상태 확인 완료!');
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();








