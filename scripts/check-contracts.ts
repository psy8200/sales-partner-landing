import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkContracts() {
  try {
    console.log('🔍 현재 계약 데이터를 확인합니다...');
    
    // 전체 계약 수 확인
    const totalContracts = await prisma.contract.count();
    console.log(`📊 총 계약 수: ${totalContracts}개`);
    
    if (totalContracts === 0) {
      console.log('✅ 계약 데이터가 없습니다.');
      return;
    }
    
    // 최근 계약 10개 조회
    const recentContracts = await prisma.contract.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        customerName: true,
        itemName: true,
        contractAmount: true,
        status: true,
        createdAt: true,
        itemCategory: true
      }
    });
    
    console.log('\n📋 최근 계약 목록:');
    recentContracts.forEach((contract, index) => {
      console.log(`${index + 1}. ${contract.customerName} - ${contract.itemName} (${contract.contractAmount.toLocaleString()}원) - ${contract.status} - ${contract.createdAt.toLocaleDateString()}`);
    });
    
    // 카테고리별 계약 수
    const categoryStats = await prisma.contract.groupBy({
      by: ['itemCategory'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📈 카테고리별 계약 수:');
    categoryStats.forEach(stat => {
      console.log(`- ${stat.itemCategory}: ${stat._count.id}개`);
    });
    
    // 상태별 계약 수
    const statusStats = await prisma.contract.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });
    
    console.log('\n📊 상태별 계약 수:');
    statusStats.forEach(stat => {
      console.log(`- ${stat.status}: ${stat._count.id}개`);
    });
    
  } catch (error) {
    console.error('❌ 계약 데이터 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkContracts();
