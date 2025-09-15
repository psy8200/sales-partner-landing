const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function restoreItems() {
  try {
    console.log('🔍 아이템 데이터 복구 시작...');

    // 백업 파일 경로
    const backupDir = path.join(__dirname, '..', 'backup-latest', 'sales-partner-landing', 'auto-backups', '2025-09-10T09-26-17-777Z');
    const itemsPath = path.join(backupDir, 'items.json');
    
    if (!fs.existsSync(itemsPath)) {
      console.log('❌ 아이템 백업 파일을 찾을 수 없습니다:', itemsPath);
      return;
    }

    const backupData = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
    const itemsData = backupData.items || backupData;

    if (!Array.isArray(itemsData)) {
      console.log('❌ 아이템 데이터가 배열이 아닙니다:', typeof itemsData);
      return;
    }

    console.log(`📊 복구할 아이템 데이터: ${itemsData.length}건`);

    for (const itemData of itemsData) {
      try {
        const processedItemData = {
          ...itemData,
          createdAt: itemData.createdAt ? new Date(itemData.createdAt) : new Date(),
          updatedAt: itemData.updatedAt ? new Date(itemData.updatedAt) : new Date(),
        };

        await prisma.profitItem.upsert({
          where: { id: processedItemData.id },
          update: processedItemData,
          create: processedItemData,
        });
        console.log(`✅ 아이템 복구: ${itemData.productName} (${itemData.provider})`);
      } catch (itemError) {
        console.error(`❌ 아이템 복구 실패 (${itemData.productName}):`, itemError.message);
      }
    }

    console.log(`🎉 아이템 ${itemsData.length}건 복구 완료!`);
    
  } catch (error) {
    console.error('❌ 아이템 데이터 복구 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreItems();
