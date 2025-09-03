import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function restoreItems() {
  try {
    console.log('♻️ Restoring items from backup...');
    
    // 가장 최신 백업 파일 찾기
    const backupDir = path.join(process.cwd(), 'backups');
    const files = fs.readdirSync(backupDir)
      .filter(file => file.startsWith('items-') && file.endsWith('.json'))
      .sort()
      .reverse(); // 최신 파일이 먼저 오도록
    
    if (files.length === 0) {
      console.log('❌ No item backup files found');
      return;
    }
    
    const latestBackupFile = files[0];
    console.log(`📁 Using backup file: ${latestBackupFile}`);
    
    const backupPath = path.join(backupDir, latestBackupFile);
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log(`📊 Found ${backupData.totalItems} items in backup`);
    
    // 기존 아이템 삭제 (선택사항)
    const existingItems = await prisma.itemSetting.count();
    if (existingItems > 0) {
      console.log(`🗑️ Clearing ${existingItems} existing items...`);
      await prisma.itemSetting.deleteMany();
    }
    
    // 백업된 아이템들 복원
    let restoredCount = 0;
    for (const item of backupData.items) {
      try {
        await prisma.itemSetting.create({
          data: {
            id: item.id,
            category: item.category,
            provider: item.provider,
            productName: item.productName,
            paymentTerm: item.paymentTerm,
            baseAmount: item.baseAmount,
            expectedRate: item.expectedRate,
            pointRate: item.pointRate,
            pointAmount: item.pointAmount,
            createdAt: new Date(item.createdAt)
          }
        });
        restoredCount++;
        console.log(`✅ Restored: ${item.productName} (${item.category})`);
      } catch (error) {
        console.error(`❌ Failed to restore ${item.productName}:`, error);
      }
    }
    
    console.log(`\n✅ Items restoration completed!`);
    console.log(`📊 Total items restored: ${restoredCount}/${backupData.totalItems}`);
    
    // 카테고리별 통계
    const stats = await prisma.itemSetting.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    });
    
    console.log('\n📈 Items by category:');
    stats.forEach(stat => {
      console.log(`  • ${stat.category}: ${stat._count.category} items`);
    });
    
  } catch (error) {
    console.error('❌ Error restoring items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreItems();








