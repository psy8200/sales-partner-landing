import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

export const runtime = 'nodejs';

/**
 * 출금신청 목록 엑셀 다운로드 API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 출금신청 엑셀 다운로드 시작');

    // 출금신청 목록 조회
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 조회된 출금신청: ${withdrawalRequests.length}건`);

    // 엑셀 데이터 변환
    const excelData = withdrawalRequests.map((request, index) => ({
      '번호': index + 1,
      '회원명': request.userName,
      '연락처': request.userPhone,
      '이메일': request.user?.email || '',
      '출금가능포인트': request.withdrawablePoints,
      '출금요청금액': request.totalAmount,
      '요청정보': request.requestInfo,
      '정산월': request.settlementMonth,
      '은행명': request.bankName,
      '계좌번호': request.accountNumber,
      '상태': getStatusText(request.status),
      '신분증파일': request.idCardFile ? '첨부됨' : '미첨부',
      '처리자': request.processedBy || '',
      '처리일시': request.processedAt ? new Date(request.processedAt).toLocaleString('ko-KR') : '',
      '거절사유': request.rejectionReason || '',
      '신청일시': new Date(request.createdAt).toLocaleString('ko-KR'),
      '완료일시': request.paidAt ? new Date(request.paidAt).toLocaleString('ko-KR') : '',
      '메모': request.memo || ''
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 5 },   // 번호
      { wch: 10 },  // 회원명
      { wch: 15 },  // 연락처
      { wch: 20 },  // 이메일
      { wch: 15 },  // 출금가능포인트
      { wch: 15 },  // 출금요청금액
      { wch: 10 },  // 요청정보
      { wch: 10 },  // 정산월
      { wch: 10 },  // 은행명
      { wch: 20 },  // 계좌번호
      { wch: 10 },  // 상태
      { wch: 10 },  // 신분증파일
      { wch: 10 },  // 처리자
      { wch: 20 },  // 처리일시
      { wch: 20 },  // 거절사유
      { wch: 20 },  // 신청일시
      { wch: 20 },  // 완료일시
      { wch: 20 }   // 메모
    ];
    
    worksheet['!cols'] = columnWidths;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '출금신청목록');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    console.log('✅ 엑셀 파일 생성 완료');

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="출금신청목록_${new Date().toISOString().split('T')[0]}.xlsx"`);

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ 엑셀 다운로드 오류:', error);
    return NextResponse.json(
      { error: '엑셀 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 상태 텍스트 변환 함수
function getStatusText(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return '신청됨';
    case 'PENDING':
      return '대기중';
    case 'PROCESSING':
      return '처리중';
    case 'PAID':
      return '완료';
    case 'REJECTED':
      return '거절됨';
    case 'CANCELLED':
      return '취소됨';
    default:
      return status;
  }
}


