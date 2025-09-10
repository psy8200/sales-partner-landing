import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 수금완료계약 API 호출 시작');
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'COMPLETED_COLLECTION';

    console.log('📋 요청 파라미터:', { page, limit, search, status });

    // 검색 조건 구성 - 수금완료계약은 COMPLETED_COLLECTION 상태만
    const where: Record<string, unknown> = {
      status: status
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { customerName: { contains: search } },
            { contractNumber: { contains: search } },
            { companyName: { contains: search } },
            { itemName: { contains: search } }
          ]
        }
      ];
    }

    console.log('🔍 데이터베이스 쿼리 시작:', where);

    // 계약 목록 조회
    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    console.log('📊 조회된 계약 수:', contracts.length);
    
    // 계약 데이터 상세 로깅
    contracts.forEach((contract, index) => {
      console.log(`📋 계약 ${index + 1}:`, {
        id: contract.id,
        contractNumber: contract.contractNumber,
        customerName: contract.customerName,
        customerPhone: contract.customerPhone,
        contractAmount: contract.contractAmount
      });
    });

    // 전체 개수 조회
    const total = await prisma.contract.count({ where });

    console.log('📈 전체 계약 수:', total);

    const result = {
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    console.log('✅ API 응답 준비 완료');
    return NextResponse.json(result);

  } catch (error) {
    console.error('수금완료계약 조회 오류:', error);
    return NextResponse.json(
      { error: '수금완료계약 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
