const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllData() {
  try {
    console.log('🔍 모든 데이터 확인 시작...\n');
    
    // 1. 사용자 데이터
    const users = await prisma.user.findMany();
    console.log(`📊 사용자: ${users.length}명`);
    
    // 2. 계약 데이터
    const contracts = await prisma.contract.findMany();
    console.log(`📊 계약: ${contracts.length}건`);
    
    // 3. 아이템 데이터
    const items = await prisma.item.findMany();
    console.log(`📊 아이템: ${items.length}건`);
    
    // 4. 파트너 신청 데이터
    const partnerApps = await prisma.partnerApplication.findMany();
    console.log(`📊 파트너 신청: ${partnerApps.length}건`);
    
    // 5. 상담 데이터
    const consultations = await prisma.consultation.findMany();
    console.log(`📊 상담: ${consultations.length}건`);
    
    // 6. 수금 데이터
    const payments = await prisma.payment.findMany();
    console.log(`📊 수금: ${payments.length}건`);
    
    // 7. 정산 데이터
    const settlements = await prisma.settlement.findMany();
    console.log(`📊 정산: ${settlements.length}건`);
    
    // 8. 정산 기록 데이터
    const settlementRecords = await prisma.settlementRecord.findMany();
    console.log(`📊 정산 기록: ${settlementRecords.length}건`);
    
    // 9. 알림 데이터
    const notifications = await prisma.notification.findMany();
    console.log(`📊 알림: ${notifications.length}건`);
    
    // 10. 활동 로그 데이터
    const activityLogs = await prisma.activityLog.findMany();
    console.log(`📊 활동 로그: ${activityLogs.length}건`);
    
    // 11. 회사 정보 데이터
    const companyInfo = await prisma.companyInfo.findMany();
    console.log(`📊 회사 정보: ${companyInfo.length}건`);
    
    console.log('\n🎯 박수용님 (01022221234) 데이터 확인:');
    const parkSuyong = await prisma.user.findFirst({
      where: { phone: '01022221234' }
    });
    
    if (parkSuyong) {
      console.log(`✅ 박수용님 계정 발견: ${parkSuyong.name} (${parkSuyong.phone})`);
      console.log(`   - 역할: ${parkSuyong.role}`);
      console.log(`   - 파트너 상태: ${parkSuyong.partnerStatus}`);
    } else {
      console.log('❌ 박수용님 (01022221234) 계정을 찾을 수 없습니다.');
    }
    
    console.log('\n🎯 박수용님 정산 데이터 확인:');
    const parkSettlement = await prisma.settlementRecord.findFirst({
      where: { 
        userName: '박수용',
        userPhone: '01022221234'
      }
    });
    
    if (parkSettlement) {
      console.log(`✅ 박수용님 정산 데이터 발견:`);
      console.log(`   - 기본수당: ${parkSettlement.basicCommission.toLocaleString()}P`);
      console.log(`   - 모집수당: ${parkSettlement.recruitmentCommission.toLocaleString()}P`);
      console.log(`   - 간접수당: ${parkSettlement.indirectCommission.toLocaleString()}P`);
      console.log(`   - 기본배당: ${parkSettlement.dividendBasicCommission.toLocaleString()}P`);
      console.log(`   - 배당등급별: ${parkSettlement.dividendLevelCommission.toLocaleString()}P`);
      console.log(`   - 총 수당: ${parkSettlement.totalCommission.toLocaleString()}P`);
      console.log(`   - 요청상태: ${parkSettlement.requestStatus}`);
    } else {
      console.log('❌ 박수용님 정산 데이터를 찾을 수 없습니다.');
    }
    
  } catch (error) {
    console.error('❌ 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllData();





