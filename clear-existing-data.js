const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearExistingData() {
  try {
    console.log('🔍 기존 데이터 삭제 시작...');
    
    // 실제 존재하는 모델들만 삭제
    try {
      await prisma.user.deleteMany({});
      console.log('✅ 사용자 삭제 완료');
    } catch (error) {
      console.log('❌ 사용자 삭제 실패:', error.message);
    }
    
    try {
      await prisma.settlementRecord.deleteMany({});
      console.log('✅ 정산 기록 삭제 완료');
    } catch (error) {
      console.log('❌ 정산 기록 삭제 실패:', error.message);
    }
    
    try {
      await prisma.contract.deleteMany({});
      console.log('✅ 계약 삭제 완료');
    } catch (error) {
      console.log('❌ 계약 삭제 실패:', error.message);
    }
    
    try {
      await prisma.item.deleteMany({});
      console.log('✅ 아이템 삭제 완료');
    } catch (error) {
      console.log('❌ 아이템 삭제 실패:', error.message);
    }
    
    try {
      await prisma.partnerApplication.deleteMany({});
      console.log('✅ 파트너 신청 삭제 완료');
    } catch (error) {
      console.log('❌ 파트너 신청 삭제 실패:', error.message);
    }
    
    try {
      await prisma.consultation.deleteMany({});
      console.log('✅ 상담 삭제 완료');
    } catch (error) {
      console.log('❌ 상담 삭제 실패:', error.message);
    }
    
    try {
      await prisma.payment.deleteMany({});
      console.log('✅ 수금 삭제 완료');
    } catch (error) {
      console.log('❌ 수금 삭제 실패:', error.message);
    }
    
    try {
      await prisma.settlement.deleteMany({});
      console.log('✅ 정산 삭제 완료');
    } catch (error) {
      console.log('❌ 정산 삭제 실패:', error.message);
    }
    
    try {
      await prisma.notification.deleteMany({});
      console.log('✅ 알림 삭제 완료');
    } catch (error) {
      console.log('❌ 알림 삭제 실패:', error.message);
    }
    
    try {
      await prisma.activityLog.deleteMany({});
      console.log('✅ 활동 로그 삭제 완료');
    } catch (error) {
      console.log('❌ 활동 로그 삭제 실패:', error.message);
    }
    
    try {
      await prisma.companyInfo.deleteMany({});
      console.log('✅ 회사 정보 삭제 완료');
    } catch (error) {
      console.log('❌ 회사 정보 삭제 실패:', error.message);
    }
    
    console.log('🎉 기존 데이터 삭제 완료!');
    
  } catch (error) {
    console.error('❌ 데이터 삭제 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearExistingData();





