import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: '삭제할 항목 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('삭제 요청된 상담신청 ID들:', ids);

    // 상담신청 삭제
    const deleteResult = await prisma.partnerApplication.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    console.log('삭제 결과:', deleteResult);

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `${deleteResult.count}건의 상담신청이 삭제되었습니다.`
    });

  } catch (error) {
    console.error('상담신청 일괄 삭제 오류:', error);
    return NextResponse.json(
      { error: '상담신청 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
