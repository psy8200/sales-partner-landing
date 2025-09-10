import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';


    // 검색 조건 구성 - status 파라미터에 따라 필터링
    const statusParam = searchParams.get('status') || 'CONFIRMED';
    let statusFilter: string | string[];
    
    if (statusParam.includes(',')) {
      // 여러 상태를 쉼표로 구분하여 받음 (예: COMPLETED_COLLECTION,LUMP_SUM)
      statusFilter = statusParam.split(',');
    } else {
      // 단일 상태
      statusFilter = statusParam;
    }

    const where: Record<string, unknown> = {
      status: statusFilter
    };

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { contractNumber: { contains: search } },
        { companyName: { contains: search } },
        { itemName: { contains: search } }
      ];
    }

    // 계약 목록 조회
    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // 전체 개수 조회
    const total = await prisma.contract.count({ where });

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('수금관리 전체계약 조회 오류:', error);
    return NextResponse.json(
      { error: '수금관리 전체계약 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
