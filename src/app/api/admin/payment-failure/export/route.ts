import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// 수금실패 데이터 엑셀 다운로드 API
export async function POST(request: NextRequest) {
  try {
    const { selectedIds, filters } = await request.json();

    // 수금실패된 Payment 데이터 조회
    const whereClause: any = {
      status: 'PENDING', // 수금실패 상태
    };

    // 선택된 항목이 있으면 해당 항목만 조회
    if (selectedIds && selectedIds.length > 0) {
      whereClause.id = {
        in: selectedIds,
      };
    }

    // 필터 조건 추가
    if (filters?.search) {
      whereClause.memo = {
        contains: filters.search,
      };
    }

    if (filters?.month) {
      whereClause.createdAt = {
        gte: new Date(`${filters.month}-01`),
        lt: new Date(`${filters.month}-01`).setMonth(new Date(`${filters.month}-01`).getMonth() + 1),
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 엑셀 데이터 준비
    const excelData = payments.map((payment, index) => {
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
        '순번': index + 1,
        '고객명': nameMatch ? nameMatch[1].trim() : '',
        '증권번호': policyMatch ? policyMatch[1].trim() : '',
        '추천인': referrerMatch ? referrerMatch[1].trim() : '',
        '담당자': managerMatch ? managerMatch[1].trim() : '',
        '납입금액': amountMatch ? parseFloat(amountMatch[1].trim()) || payment.amount : payment.amount,
        '수금월': monthMatch ? monthMatch[1].trim() : '',
        '실패사유': reasonMatch ? reasonMatch[1].trim() : '매칭되는 계약을 찾을 수 없습니다.',
        '상태': '수금실패',
        '생성일': new Date(payment.createdAt).toLocaleDateString('ko-KR'),
        '수정일': new Date(payment.updatedAt).toLocaleDateString('ko-KR'),
      };
    });

    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 8 },   // 순번
      { wch: 12 },  // 고객명
      { wch: 20 },  // 증권번호
      { wch: 12 },  // 추천인
      { wch: 12 },  // 담당자
      { wch: 15 },  // 납입금액
      { wch: 12 },  // 수금월
      { wch: 30 },  // 실패사유
      { wch: 12 },  // 상태
      { wch: 12 },  // 생성일
      { wch: 12 },  // 수정일
    ];
    worksheet['!cols'] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '수금실패데이터');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 응답 헤더 설정
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="수금실패_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return response;

  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    return NextResponse.json({ 
      error: '엑셀 다운로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}


