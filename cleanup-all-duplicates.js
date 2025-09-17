const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAllDuplicates() {
  try {
    console.log('🧹 모든 회원의 중복 SettlementRecord 정리 시작...');
    
    // 모든 SettlementRecord 조회
    const allRecords = await prisma.settlementRecord.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📊 전체 레코드 수:', allRecords.length);
    
    // 회원별로 그룹화
    const recordsByUser = {};
    allRecords.forEach(record => {
      const key = `${record.userName}_${record.userPhone}`;
      if (!recordsByUser[key]) {
        recordsByUser[key] = [];
      }
      recordsByUser[key].push(record);
    });
    
    console.log('👥 고유 회원 수:', Object.keys(recordsByUser).length);
    
    let totalDeleted = 0;
    let processedUsers = 0;
    
    // 각 회원별로 중복 레코드 정리
    for (const [userKey, records] of Object.entries(recordsByUser)) {
      if (records.length > 1) {
        console.log(`\n⚠️ ${userKey} - 중복 레코드 ${records.length}개 발견`);
        
        // 가장 최근 레코드(첫 번째)는 유지
        const keepRecord = records[0];
        const deleteRecords = records.slice(1);
        
        console.log(`✅ 유지할 레코드: ${keepRecord.id} (생성일: ${keepRecord.createdAt})`);
        console.log(`🗑️ 삭제할 레코드: ${deleteRecords.length}개`);
        
        // 중복 레코드들 삭제
        for (const record of deleteRecords) {
          await prisma.settlementRecord.delete({
            where: { id: record.id }
          });
          console.log(`  - 삭제됨: ${record.id} (생성일: ${record.createdAt})`);
          totalDeleted++;
        }
        
        processedUsers++;
      } else {
        console.log(`✅ ${userKey} - 중복 없음 (${records.length}개)`);
      }
    }
    
    console.log('\n🎉 중복 레코드 정리 완료!');
    console.log(`📊 처리된 회원 수: ${processedUsers}명`);
    console.log(`🗑️ 삭제된 레코드 수: ${totalDeleted}개`);
    
    // 최종 확인
    const finalRecords = await prisma.settlementRecord.findMany();
    console.log(`📊 최종 레코드 수: ${finalRecords.length}개`);
    
    // 회원별 최종 레코드 수 확인
    const finalRecordsByUser = {};
    finalRecords.forEach(record => {
      const key = `${record.userName}_${record.userPhone}`;
      finalRecordsByUser[key] = (finalRecordsByUser[key] || 0) + 1;
    });
    
    console.log('\n📋 회원별 최종 레코드 수:');
    Object.entries(finalRecordsByUser).forEach(([userKey, count]) => {
      console.log(`  ${userKey}: ${count}개`);
    });
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllDuplicates();





