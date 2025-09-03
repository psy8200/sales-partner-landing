import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 아이템 존재 확인
    const existingItem = await prisma.itemSetting.findUnique({
      where: { id }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: '해당 아이템을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 아이템 삭제
    await prisma.itemSetting.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('아이템 삭제 오류:', error);
    return NextResponse.json(
      { error: '아이템 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



