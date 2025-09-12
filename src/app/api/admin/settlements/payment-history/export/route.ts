import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

/**
 * 선택된 지급완료 내역 엑셀 다운로드 API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: '다운로드할 ID 목록이 필요합니다.' }, { status: 400 });
    }

    // 선택된 항목들 조회
    const paymentHistory = await prisma.paymentHistory.findMany({
      where: {
        id: {
          in: ids
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });

    if (paymentHistory.length === 0) {
      return NextResponse.json({ success: false, error: '다운로드할 데이터가 없습니다.' }, { status: 404 });
    }

    // 엑셀 데이터 변환
    const excelData = paymentHistory.map((item, index) => ({
      '순번': index + 1,
      '이름': item.userName,
      '연락처': item.userPhone,
      '내코드': item.myCode,
      '현재등급': `${item.currentLevel}등급`,
      '이전등급': `${item.previousLevel}등급`,
      '총추천인원': `${item.totalReferrals}명`,
      '직접추천인원': `${item.directReferrals}명`,
      '간접추천인원': `${item.indirectReferrals}명`,
      '승급일시': new Date(item.promotionDate).toLocaleDateString('ko-KR'),
      '지급한선물내용': item.giftContent,
      '지급한선물금액': item.giftAmount ? `${item.giftAmount.toLocaleString('ko-KR')}원` : '',
      '선물타입': getGiftTypeName(item.giftType),
      '지급일시': new Date(item.paymentDate).toLocaleDateString('ko-KR'),
      '처리자': item.processedBy,
      '메모': item.memo || ''
    }));

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 워크시트 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '승급회원지급완료리스트');

    // 엑셀 파일 생성 (더 안정적인 방식)
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    });

    console.log('✅ 엑셀 다운로드 완료:', paymentHistory.length, '개 항목');

    // 파일명 생성
    const fileName = `승급회원지급완료리스트_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // 응답 반환
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ 엑셀 다운로드 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '엑셀 다운로드 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 선물 타입 한글명 변환 함수
function getGiftTypeName(giftType: string): string {
  switch (giftType) {
    case 'GIFT_CARD': return '상품권';
    case 'TRAVEL': return '여행권';
    case 'CAR': return '차량';
    case 'LEGEND': return 'LEGEND';
    default: return giftType;
  }
}
