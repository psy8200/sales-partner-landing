const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 박수용 01066678282의 SettlementRecord 데이터 확인...');
    
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
    
    records.forEach((record, index) => {
      console.log(`\n--- 레코드 ${index + 1} ---`);
      console.log('ID:', record.id);
      console.log('생성일:', record.createdAt);
      console.log('업데이트일:', record.updatedAt);
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

checkData();