const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('🔍 모든 데이터 삭제 시작...');
    
    // 외래키 제약조건 때문에 순서대로 삭제
    await prisma.activityLog.deleteMany({});
    console.log('✅ 활동 로그 삭제 완료');
    
    await prisma.notification.deleteMany({});
    console.log('✅ 알림 삭제 완료');
    
    await prisma.settlementRecord.deleteMany({});
    console.log('✅ 정산 기록 삭제 완료');
    
    await prisma.settlement.deleteMany({});
    console.log('✅ 정산 삭제 완료');
    
    await prisma.payment.deleteMany({});
    console.log('✅ 수금 삭제 완료');
    
    await prisma.contract.deleteMany({});
    console.log('✅ 계약 삭제 완료');
    
    await prisma.consultation.deleteMany({});
    console.log('✅ 상담 삭제 완료');
    
    await prisma.partnerApplication.deleteMany({});
    console.log('✅ 파트너 신청 삭제 완료');
    
    await prisma.item.deleteMany({});
    console.log('✅ 아이템 삭제 완료');
    
    await prisma.companyInfo.deleteMany({});
    console.log('✅ 회사 정보 삭제 완료');
    
    await prisma.user.deleteMany({});
    console.log('✅ 사용자 삭제 완료');
    
    console.log('🎉 모든 데이터 삭제 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();





