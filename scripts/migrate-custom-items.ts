import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCustomItems() {
  try {
    console.log('🔄 커스텀 아이템을 새로운 구조로 마이그레이션 시작...');

    // 1. 기존 커스텀 아이템들 조회
    const customItems = await prisma.itemSetting.findMany({
      where: {
        category: 'CUSTOM',
        customId: { not: null }
      }
    });

    console.log(`📦 발견된 커스텀 아이템: ${customItems.length}개`);

    // 2. 각 커스텀 아이템을 새로운 구조로 변환
    for (const item of customItems) {
      if (!item.customId) continue;

      // customId에서 실제 상품명 추출 (예: custom-1757316974465-51njd1lth)
      // 실제로는 SidebarItem에서 이름을 가져와야 함
      const sidebarItem = await prisma.sidebarItem.findFirst({
        where: {
          href: `/admin/items/custom/${item.customId}`
        }
      });

      if (sidebarItem) {
        // 상품명을 URL 안전한 형태로 변환
        const safeItemName = sidebarItem.name.replace(/[^가-힣a-zA-Z0-9]/g, '');
        
        // ItemSetting 업데이트
        await prisma.itemSetting.update({
          where: { id: item.id },
          data: {
            itemName: safeItemName,
            category: null, // category 제거
            customId: null  // customId 제거
          }
        });

        // SidebarItem href 업데이트
        await prisma.sidebarItem.update({
          where: { id: sidebarItem.id },
          data: {
            href: `/admin/items/${safeItemName}`,
            isCustom: false // 더 이상 커스텀 아님
          }
        });

        console.log(`✅ ${sidebarItem.name} → ${safeItemName} 변환 완료`);
      }
    }

    console.log('🎉 마이그레이션 완료!');
  } catch (error) {
    console.error('❌ 마이그레이션 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCustomItems();


