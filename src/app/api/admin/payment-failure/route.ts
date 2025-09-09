import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 수금실패 데이터 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const month = searchParams.get('month') || '';

    // 수금실패된 Payment 데이터 조회
    const whereClause: any = {
      status: 'PENDING', // 수금실패 상태 (기본적으로 PENDING)
    };

    // 검색 조건 추가
    if (search) {
      whereClause.OR = [
        {
          memo: {
            contains: search,
          },
        },
      ];
    }

    // 수금월 필터
    if (month) {
      whereClause.createdAt = {
        gte: new Date(`${month}-01`),
        lt: new Date(`${month}-01`).setMonth(new Date(`${month}-01`).getMonth() + 1),
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 총 개수 조회
    const totalCount = await prisma.payment.count({
      where: whereClause,
    });

    // 응답 데이터 변환 (수금실패 데이터는 Payment 테이블의 memo 필드에서 파싱)
    const failureData = payments.map(payment => {
      // memo에서 수금실패 정보 파싱
      const memo = payment.memo || '';
      const nameMatch = memo.match(/고객명[:\s]*([^,]+)/);
      const policyMatch = memo.match(/증권번호[:\s]*([^,]+)/);
      const referrerMatch = memo.match(/추천인[:\s]*([^,]+)/);
      const managerMatch = memo.match(/담당자[:\s]*([^,]+)/);
      const amountMatch = memo.match(/납입금액[:\s]*([^,]+)/);
      const monthMatch = memo.match(/수금월[:\s]*([^,]+)/);
      const reasonMatch = memo.match(/실패사유[:\s]*([^,]+)/);

      return {
        id: payment.id,
        name: nameMatch ? nameMatch[1].trim() : '',
        policyNumber: policyMatch ? policyMatch[1].trim() : '',
        referrer: referrerMatch ? referrerMatch[1].trim() : '',
        manager: managerMatch ? managerMatch[1].trim() : '',
        paymentAmount: amountMatch ? parseFloat(amountMatch[1].trim()) || payment.amount : payment.amount,
        paymentMonth: monthMatch ? monthMatch[1].trim() : '',
        reason: reasonMatch ? reasonMatch[1].trim() : '매칭되는 계약을 찾을 수 없습니다.',
        status: 'PENDING' as const,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };
    });

    return NextResponse.json({
      failures: failureData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });

  } catch (error) {
    console.error('수금실패 데이터 조회 오류:', error);
    return NextResponse.json({ 
      error: '데이터 조회 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
