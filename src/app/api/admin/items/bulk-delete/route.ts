import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(request: NextRequest) {
  try {
    const { itemIds } = await request.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: '삭제할 아이템이 선택되지 않았습니다.' },
        { status: 400 }
      );
    }

    // 선택된 아이템들이 실제로 존재하는지 확인
    const existingItems = await prisma.itemSetting.findMany({
      where: {
        id: { in: itemIds }
      },
      select: { id: true, productName: true }
    });

    if (existingItems.length === 0) {
      return NextResponse.json(
        { error: '삭제할 아이템을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 선택된 아이템들 삭제
    const deleteResult = await prisma.itemSetting.deleteMany({
      where: {
        id: { in: itemIds }
      }
    });

    console.log(`✅ ${deleteResult.count}개 아이템 삭제 완료:`, existingItems.map(item => item.productName));

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count}개 아이템이 성공적으로 삭제되었습니다.`,
      deletedCount: deleteResult.count,
      deletedItems: existingItems.map(item => item.productName)
    });

  } catch (error) {
    console.error('아이템 일괄 삭제 오류:', error);
    return NextResponse.json(
      { error: '아이템 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}









