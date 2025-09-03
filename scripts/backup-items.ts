import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function backupItems() {
  console.log('📦 Backing up items...');
  try {
    const items = await prisma.itemSetting.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const backupDir = join(process.cwd(), 'backups');
    mkdirSync(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `items-${timestamp}.json`;
    const filePath = join(backupDir, filename);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      totalItems: items.length,
      items: items,
      categories: {
        INSURANCE: items.filter(item => item.category === 'INSURANCE').length,
        RENTAL: items.filter(item => item.category === 'RENTAL').length,
        INTERNET_TV: items.filter(item => item.category === 'INTERNET_TV').length,
        FUNERAL: items.filter(item => item.category === 'FUNERAL').length,
        CUSTOM: items.filter(item => item.category === 'CUSTOM').length
      }
    };
    
    writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    console.log(`✅ Items backup saved: ${filePath}`);
    console.log(`📊 Total items backed up: ${items.length}`);
    console.log(`📋 Categories:`, backupData.categories);
    
  } catch (error) {
    console.error('❌ Failed to backup items:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backupItems();









