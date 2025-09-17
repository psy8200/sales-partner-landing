const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixData() {
  try {
    console.log('🔧 박수용 01066678282의 SettlementRecord 데이터 정리 시작...');
    
    // 모든 레코드 조회
    const records = await prisma.settlementRecord.findMany({
      where: {
        userName: '박수용',
        userPhone: '01066678282'
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📊 총 레코드 수:', records.length);
    
    if (records.length > 1) {
      console.log('⚠️ 중복 레코드 발견! 가장 최근 레코드만 남기고 나머지 삭제...');
      
      // 가장 최근 레코드 (첫 번째)는 유지
      const keepRecord = records[0];
      const deleteRecords = records.slice(1);
      
      console.log('✅ 유지할 레코드:', keepRecord.id);
      console.log('🗑️ 삭제할 레코드 수:', deleteRecords.length);
      
      // 중복 레코드들 삭제
      for (const record of deleteRecords) {
        await prisma.settlementRecord.delete({
          where: { id: record.id }
        });
        console.log('🗑️ 삭제됨:', record.id);
      }
      
      console.log('✅ 중복 레코드 정리 완료!');
    } else {
      console.log('✅ 중복 레코드 없음');
    }
    
    // 최종 데이터 확인
    const finalRecords = await prisma.settlementRecord.findMany({
      where: {
        userName: '박수용',
        userPhone: '01066678282'
      }
    });
    
    console.log('\n📊 최종 레코드:');
    finalRecords.forEach((record, index) => {
      console.log(`\n--- 레코드 ${index + 1} ---`);
      console.log('ID:', record.id);
      console.log('정산년월:', record.settlementYearMonth);
      console.log('기본수당:', record.basicCommission);
      console.log('모집수당:', record.recruitmentCommission);
      console.log('간접수당:', record.indirectCommission);
      console.log('기본배당:', record.dividendBasicCommission);
      console.log('배당등급별:', record.dividendLevelCommission);
      console.log('총지급액:', record.totalCommission);
      console.log('지급상태:', record.paymentStatus);
      console.log('요청상태:', record.requestStatus);
    });
    
  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixData();





