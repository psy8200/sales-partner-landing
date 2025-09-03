import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { itemIds } = await request.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: '선택된 아이템이 없습니다.' },
        { status: 400 }
      );
    }

    // 선택된 아이템 조회
    const items = await prisma.itemSetting.findMany({
      where: {
        id: { in: itemIds }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (items.length === 0) {
      return NextResponse.json(
        { error: '선택된 아이템을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 카테고리 한글명 변환 함수
    const getCategoryName = (category: string) => {
      const categoryMap: Record<string, string> = {
        'INSURANCE': '보험',
        'RENTAL': '렌탈',
        'INTERNET_TV': '인터넷/방송',
        'FUNERAL': '상조',
        'RENTAL_MALL': '렌탈몰'
      };
      return categoryMap[category] || category;
    };

    // 엑셀 데이터 준비
    const excelData = items.map(item => ({
      '카테고리': getCategoryName(item.category),
      '제공사': item.provider,
      '상품명': item.productName,
      '납입기간': item.paymentTerm,
      '기본금액': item.baseAmount,
      '예상수익률(%)': item.expectedRate,
      '포인트율(%)': item.pointRate,
      '포인트금액': item.pointAmount,
      '등록일': new Date(item.createdAt).toLocaleDateString('ko-KR')
    }));

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 12 }, // 카테고리
      { wch: 15 }, // 제공사
      { wch: 25 }, // 상품명
      { wch: 12 }, // 납입기간
      { wch: 12 }, // 기본금액
      { wch: 12 }, // 예상수익률
      { wch: 12 }, // 포인트율
      { wch: 12 }, // 포인트금액
      { wch: 12 }  // 등록일
    ];
    worksheet['!cols'] = columnWidths;

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '아이템목록');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 파일명 생성 (현재 날짜 포함)
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `아이템목록_${dateStr}.xlsx`;

    // 응답 헤더 설정
    const response = new NextResponse(excelBuffer);
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    return response;

  } catch (error) {
    console.error('아이템 내보내기 오류:', error);
    return NextResponse.json(
      { error: '아이템 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
