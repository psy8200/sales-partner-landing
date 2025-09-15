const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSettlementData() {
  try {
    console.log('🔍 정산 완료 데이터 확인 중...');
    const settlementRecords = await prisma.settlementRecord.findMany({
      orderBy: { createdAt: 'asc' },
    });

    console.log(`📊 총 ${settlementRecords.length}건의 정산 데이터가 저장되어 있습니다.\n`);

    if (settlementRecords.length > 0) {
      console.log('📋 저장된 정산 데이터:\n');
      settlementRecords.forEach((record, index) => {
        console.log(`${index + 1}. ${record.userName} (${record.userPhone})`);
        console.log(`   - 기본수당: ${record.basicCommission.toLocaleString()}P`);
        console.log(`   - 모집수당: ${record.recruitmentCommission.toLocaleString()}P`);
        console.log(`   - 간접수당: ${record.indirectCommission.toLocaleString()}P`);
        console.log(`   - 기본배당: ${record.dividendBasicCommission.toLocaleString()}P`);
        console.log(`   - 배당등급별: ${record.dividendLevelCommission.toLocaleString()}P`);
        console.log(`   - 총 수당: ${record.totalCommission.toLocaleString()}P`);
        console.log(`   - 요청상태: ${record.requestStatus}`);
        console.log(`   - 정산년월: ${record.settlementYearMonth}`);
        console.log(`   - 저장일시: ${record.createdAt.toDateString()} ${record.createdAt.toTimeString().split(' ')[0]}`);
        console.log('');
      });

      const parkSuyongRecord = settlementRecords.find(r => r.userName === '박수용' && r.userPhone === '01022221234');
      if (parkSuyongRecord) {
        console.log('🎯 박수용님 데이터 확인:');
        console.log(`   - 기본수당: ${parkSuyongRecord.basicCommission.toLocaleString()}P`);
        console.log(`   - 모집수당: ${parkSuyongRecord.recruitmentCommission.toLocaleString()}P`);
        console.log(`   - 간접수당: ${parkSuyongRecord.indirectCommission.toLocaleString()}P`);
        console.log(`   - 기본배당: ${parkSuyongRecord.dividendBasicCommission.toLocaleString()}P`);
        console.log(`   - 배당등급별: ${parkSuyongRecord.dividendLevelCommission.toLocaleString()}P`);
        console.log(`   - 총 수당: ${parkSuyongRecord.totalCommission.toLocaleString()}P`);
        console.log(`   - 요청상태: ${parkSuyongRecord.requestStatus}`);
      } else {
        console.log('❌ 박수용 (01022221234)님 데이터를 찾을 수 없습니다.');
      }
    } else {
      console.log('저장된 정산 데이터가 없습니다.');
    }
  } catch (error) {
    console.error('데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettlementData();
