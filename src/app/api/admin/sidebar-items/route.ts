import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 사이드바 아이템 목록 조회
export async function GET() {
  try {
    const sidebarItems = await prisma.sidebarItem.findMany({
      orderBy: [
        { isCustom: 'asc' }, // 기본 아이템 먼저
        { order: 'asc' },    // 그 다음 정렬 순서
        { createdAt: 'asc' } // 마지막으로 생성일
      ]
    });

    return NextResponse.json({
      success: true,
      data: sidebarItems
    });
  } catch (error) {
    console.error('사이드바 아이템 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '사이드바 아이템을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 새 사이드바 아이템 추가
export async function POST(request: NextRequest) {
  try {
    const { name, href, icon, isCustom, order } = await request.json();

    if (!name || !href) {
      return NextResponse.json(
        { success: false, error: '이름과 경로는 필수입니다.' },
        { status: 400 }
      );
    }

    // 중복 href 체크
    const existingItem = await prisma.sidebarItem.findUnique({
      where: { href }
    });

    if (existingItem) {
      return NextResponse.json(
        { success: false, error: '이미 존재하는 경로입니다.' },
        { status: 400 }
      );
    }

    const newItem = await prisma.sidebarItem.create({
      data: {
        name,
        href,
        icon: icon || '📦',
        isCustom: isCustom || false,
        customId: isCustom ? href.split('/').pop() : null,
        order: order || 0,
        isActive: true
      }
    });

    return NextResponse.json({
      success: true,
      message: '새 아이템이 성공적으로 추가되었습니다.',
      data: newItem
    });
  } catch (error) {
    console.error('사이드바 아이템 추가 오류:', error);
    return NextResponse.json(
      { success: false, error: '사이드바 아이템 추가에 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 사이드바 아이템 일괄 업데이트
export async function PUT(request: NextRequest) {
  try {
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: '잘못된 데이터 형식입니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 모든 아이템 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 기존 아이템들 삭제
      await tx.sidebarItem.deleteMany({});

      // 새로운 아이템들 생성
      const newItems = items.map((item, index) => ({
        name: item.name,
        href: item.href,
        icon: item.icon,
        isCustom: item.isCustom || item.href.includes('/custom/'),
        customId: item.isCustom ? item.href.split('/').pop() : null,
        order: index,
        isActive: true
      }));

      return await tx.sidebarItem.createMany({
        data: newItems
      });
    });

    return NextResponse.json({
      success: true,
      message: '사이드바 아이템이 성공적으로 업데이트되었습니다.',
      data: result
    });
  } catch (error) {
    console.error('사이드바 아이템 업데이트 오류:', error);
    return NextResponse.json(
      { success: false, error: '사이드바 아이템 업데이트에 실패했습니다.' },
      { status: 500 }
    );
  }
}
