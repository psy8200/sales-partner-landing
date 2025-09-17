const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteDuplicates() {
  try {
    console.log('🔍 중복 SettlementRecord 레코드 확인 및 삭제...');
    
    // 박수용 01066678282의 모든 레코드 조회
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
      console.log('⚠️ 중복 레코드 발견!');
      
      // 각 레코드 정보 출력
      records.forEach((record, index) => {
        console.log(`\n--- 레코드 ${index + 1} ---`);
        console.log('ID:', record.id);
        console.log('생성일:', record.createdAt);
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
      
      // 가장 최근 레코드(첫 번째)만 유지하고 나머지 삭제
      const keepRecord = records[0];
      const deleteRecords = records.slice(1);
      
      console.log('\n✅ 유지할 레코드:', keepRecord.id);
      console.log('🗑️ 삭제할 레코드들:');
      
      for (const record of deleteRecords) {
        console.log('  -', record.id, '(생성일:', record.createdAt, ')');
        await prisma.settlementRecord.delete({
          where: { id: record.id }
        });
      }
      
      console.log('\n✅ 중복 레코드 삭제 완료!');
    } else {
      console.log('✅ 중복 레코드 없음');
    }
    
    // 최종 확인
    const finalRecords = await prisma.settlementRecord.findMany({
      where: {
        userName: '박수용',
        userPhone: '01066678282'
      }
    });
    
    console.log('\n📊 최종 레코드 수:', finalRecords.length);
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteDuplicates();





