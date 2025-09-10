const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initSidebarItems() {
  try {
    console.log('🔧 기본 사이드바 아이템 초기화 중...');
    
    // 기존 아이템들 삭제
    await prisma.sidebarItem.deleteMany({});
    console.log('✅ 기존 사이드바 아이템 삭제 완료');
    
    // 기본 아이템들 추가
    const defaultItems = [
      { name: '아이템관리홈', href: '/admin/items', icon: '🏠', isCustom: false, order: 0 },
      { name: '보험상담신청 설정', href: '/admin/items/insurance', icon: '🛡️', isCustom: false, order: 1 },
      { name: '렌탈상품 설정', href: '/admin/items/rental', icon: '🏠', isCustom: false, order: 2 },
      { name: '인터넷TV 설정', href: '/admin/items/internet-tv', icon: '📺', isCustom: false, order: 3 },
      { name: '장례상품 설정', href: '/admin/items/funeral', icon: '🕊️', isCustom: false, order: 4 },
      { name: '렌탈몰 설정', href: '/admin/items/rental-mall', icon: '🏪', isCustom: false, order: 5 },
      { name: '쇼핑몰 설정', href: '/admin/items/shopping-mall', icon: '🛒', isCustom: false, order: 6 },
      { name: '즉시파트너 설정', href: '/admin/items/instant-partner', icon: '⚡', isCustom: false, order: 7 }
    ];
    
    for (const item of defaultItems) {
      await prisma.sidebarItem.create({
        data: item
      });
      console.log(`✅ ${item.name} 추가 완료`);
    }
    
    console.log('🎉 기본 사이드바 아이템 초기화 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initSidebarItems();


