import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 기본 사이드바 아이템들
const defaultSidebarItems = [
  {
    name: '보험상담신청',
    href: '/admin/items/insurance',
    icon: '🛡️',
    isCustom: false,
    customId: null,
    order: 0,
    isActive: true
  },
  {
    name: '렌탈상품신청',
    href: '/admin/items/rental',
    icon: '📦',
    isCustom: false,
    customId: null,
    order: 1,
    isActive: true
  },
  {
    name: '인터넷+TV 결합상품신청',
    href: '/admin/items/internet-tv',
    icon: '📺',
    isCustom: false,
    customId: null,
    order: 2,
    isActive: true
  },
  {
    name: '상조결합상품신청',
    href: '/admin/items/funeral',
    icon: '⚰️',
    isCustom: false,
    customId: null,
    order: 3,
    isActive: true
  },
  {
    name: '렌탈몰분양신청',
    href: '/admin/items/rental-mall',
    icon: '🏪',
    isCustom: false,
    customId: null,
    order: 4,
    isActive: true
  }
];

async function initSidebarItems() {
  try {
    console.log('사이드바 아이템 초기화 시작...');

    // 기존 아이템들 확인
    const existingItems = await prisma.sidebarItem.findMany();
    
    if (existingItems.length === 0) {
      // 기본 아이템들 생성
      await prisma.sidebarItem.createMany({
        data: defaultSidebarItems
      });
      console.log('기본 사이드바 아이템들이 생성되었습니다.');
    } else {
      console.log('사이드바 아이템이 이미 존재합니다.');
    }

    // 현재 아이템들 출력
    const allItems = await prisma.sidebarItem.findMany({
      orderBy: [
        { isCustom: 'asc' },
        { order: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    console.log('현재 사이드바 아이템들:');
    allItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.icon} ${item.name} (${item.href}) - ${item.isCustom ? '커스텀' : '기본'}`);
    });

  } catch (error) {
    console.error('사이드바 아이템 초기화 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

initSidebarItems();


