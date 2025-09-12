import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// 수금완료 데이터 엑셀 다운로드 API
export async function POST(request: NextRequest) {
  try {
    const { selectedIds, filters } = await request.json();

    // 수금완료된 Payment 데이터 조회
    const whereClause: any = {
      status: 'PAID', // 수금완료 상태
    };

    // 선택된 항목이 있으면 해당 항목만 조회
    if (selectedIds && selectedIds.length > 0) {
      whereClause.id = {
        in: selectedIds,
      };
    }

    // 필터 조건 추가
    if (filters?.search) {
      whereClause.OR = [
        {
          contract: {
            customerName: {
              contains: filters.search,
            },
          },
        },
        {
          contract: {
            contractNumber: {
              contains: filters.search,
            },
          },
        },
        {
          contract: {
            dynamicFields: {
              contains: filters.search,
            },
          },
        },
      ];
    }

    if (filters?.month) {
      whereClause.paidDate = {
        gte: new Date(`${filters.month}-01`),
        lt: new Date(`${filters.month}-01`).setMonth(new Date(`${filters.month}-01`).getMonth() + 1),
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
    });

    // 엑셀 데이터 준비
    const excelData = payments.map((payment, index) => {
      const contract = payment.contract;
      const dynamicFields = contract?.dynamicFields ? JSON.parse(contract.dynamicFields) : {};
      
      return {
        '순번': index + 1,
        '계약번호': contract?.contractNumber || '',
        '고객명': contract?.customerName || '',
        '연락처': contract?.customerPhone || '',
        '증권번호': dynamicFields.policyNumber || '',
        '추천인': contract?.itemSetting?.provider || '',
        '담당자': contract?.createdBy || '',
        '계약금액': contract?.contractAmount || 0,
        '수금액': payment.amount,
        '최종포인트': contract?.finalPoints || 0,
        '수금월': payment.paidDate ? 
          `${new Date(payment.paidDate).getFullYear()}-${String(new Date(payment.paidDate).getMonth() + 1).padStart(2, '0')}` : '',
        '수금일': payment.paidDate ? new Date(payment.paidDate).toLocaleDateString('ko-KR') : '',
        '상태': '수금완료',
        '생성일': new Date(payment.createdAt).toLocaleDateString('ko-KR'),
      };
    });

    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 8 },   // 순번
      { wch: 15 },  // 계약번호
      { wch: 12 },  // 고객명
      { wch: 15 },  // 연락처
      { wch: 20 },  // 증권번호
      { wch: 12 },  // 추천인
      { wch: 12 },  // 담당자
      { wch: 15 },  // 계약금액
      { wch: 15 },  // 수금액
      { wch: 15 },  // 최종포인트
      { wch: 12 },  // 수금월
      { wch: 12 },  // 수금일
      { wch: 12 },  // 상태
      { wch: 12 },  // 생성일
    ];
    worksheet['!cols'] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '수금완료데이터');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 응답 헤더 설정
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="수금완료_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return response;

  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    return NextResponse.json({ 
      error: '엑셀 다운로드 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}





