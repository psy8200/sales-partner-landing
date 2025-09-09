import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금완료 데이터 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const month = searchParams.get('month') || '';

    // 수금완료된 Payment 데이터 조회
    const whereClause: any = {
      status: 'PAID', // 수금완료 상태
    };

    // 검색 조건 추가
    if (search) {
      whereClause.OR = [
        {
          contract: {
            customerName: {
              contains: search,
            },
          },
        },
        {
          contract: {
            contractNumber: {
              contains: search,
            },
          },
        },
        {
          contract: {
            dynamicFields: {
              contains: search, // 증권번호 검색
            },
          },
        },
      ];
    }

    // 수금월 필터 (Payment 테이블에 수금월 필드가 있다면)
    if (month) {
      whereClause.paidDate = {
        gte: new Date(`${month}-01`),
        lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      include: {
        contract: {
          include: {
            itemSetting: true,
          },
        },
      },
      orderBy: {
        paidDate: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 총 개수 조회
    const totalCount = await prisma.payment.count({
      where: whereClause,
    });

    // 응답 데이터 변환
    const paymentData = payments.map(payment => {
      const contract = payment.contract;
      const dynamicFields = contract?.dynamicFields ? JSON.parse(contract.dynamicFields) : {};
      
      return {
        id: payment.id,
        contractId: payment.contractId,
        contractNumber: contract?.contractNumber || '',
        customerName: contract?.customerName || '',
        customerPhone: contract?.customerPhone || '',
        policyNumber: dynamicFields.policyNumber || '',
        referrer: contract?.itemSetting?.provider || '',
        manager: contract?.createdBy || '',
        paymentAmount: payment.amount,
        paymentMonth: payment.paidDate ? 
          `${new Date(payment.paidDate).getFullYear()}-${String(new Date(payment.paidDate).getMonth() + 1).padStart(2, '0')}` : '',
        contractAmount: contract?.contractAmount || 0,
        finalPoints: contract?.finalPoints || 0,
        status: 'COMPLETED',
        createdAt: payment.createdAt,
        paidDate: payment.paidDate,
      };
    });

    return NextResponse.json({
      payments: paymentData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('수금완료 데이터 조회 오류:', error);
    return NextResponse.json({ 
      error: '데이터 조회 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
