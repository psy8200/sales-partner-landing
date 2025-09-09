import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const paymentTerm = searchParams.get('paymentTerm') || '';

    // 검색 조건 구성 - 수금관리전체계약은 CONFIRMED 상태만
    const where: Record<string, unknown> = {
      status: 'CONFIRMED'
    };

    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { contractNumber: { contains: search } },
        { companyName: { contains: search } },
        { itemName: { contains: search } }
      ];
    }

    // 납입기간 필터 추가
    if (paymentTerm) {
      where.dynamicFields = {
        contains: `"paymentTerm":"${paymentTerm}"`
      };
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
