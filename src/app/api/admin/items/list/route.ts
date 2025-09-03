import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ItemCategory } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 필터 조건 구성
    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category as ItemCategory;
    }

    // 아이템 목록 조회
    const items = await prisma.itemSetting.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    // 전체 개수 조회
    const total = await prisma.itemSetting.count({ where });

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('아이템 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '아이템 목록을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}



