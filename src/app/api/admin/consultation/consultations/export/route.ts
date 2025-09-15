import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// 상담 이력 엑셀 다운로드 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const selectedIds = searchParams.get('ids');

    // 검색 조건 구성
    const where: any = {};
    
    if (selectedIds) {
      const ids = selectedIds.split(',');
      where.id = { in: ids };
    }

    // 상담 이력 조회
    const consultations = await prisma.consultation.findMany({
      where,
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
      orderBy: { createdAt: 'desc' }
    });

    // 엑셀 데이터 준비
    const excelData = consultations.map((consultation, index) => ({
      '순번': index + 1,
      '상담ID': consultation.id,
      '고객명': consultation.contactName,
      '연락처': consultation.contactPhone,
      '이메일': consultation.contactEmail || '-',
      '상담제목': consultation.title,
      '상담내용': consultation.description,
      '카테고리': consultation.category,
      '상담유형': consultation.type,
      '상태': consultation.status,
      '우선순위': consultation.priority,
      '담당자': consultation.assignedTo || '-',
      '배정일': consultation.assignedAt ? new Date(consultation.assignedAt).toLocaleDateString('ko-KR') : '-',
      '요청일': consultation.requestedDate ? new Date(consultation.requestedDate).toLocaleDateString('ko-KR') : '-',
      '예정일': consultation.scheduledDate ? new Date(consultation.scheduledDate).toLocaleDateString('ko-KR') : '-',
      '완료일': consultation.completedDate ? new Date(consultation.completedDate).toLocaleDateString('ko-KR') : '-',
      '예상금액': consultation.expectedAmount ? consultation.expectedAmount.toLocaleString() + '원' : '-',
      '후속상담일': consultation.followUpDate ? new Date(consultation.followUpDate).toLocaleDateString('ko-KR') : '-',
      '계약생성여부': consultation.contractCreated ? 'Y' : 'N',
      '계약ID': consultation.contractId || '-',
      '메모': consultation.memo || '-',
      '결과': consultation.result || '-',
      '평점': consultation.rating || '-',
      '생성일': new Date(consultation.createdAt).toLocaleDateString('ko-KR'),
      '수정일': new Date(consultation.updatedAt).toLocaleDateString('ko-KR')
    }));

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const colWidths = [
      { wch: 5 },   // 순번
      { wch: 20 },  // 상담ID
      { wch: 10 },  // 고객명
      { wch: 15 },  // 연락처
      { wch: 20 },  // 이메일
      { wch: 25 },  // 상담제목
      { wch: 30 },  // 상담내용
      { wch: 15 },  // 카테고리
      { wch: 15 },  // 상담유형
      { wch: 10 },  // 상태
      { wch: 10 },  // 우선순위
      { wch: 10 },  // 담당자
      { wch: 12 },  // 배정일
      { wch: 12 },  // 요청일
      { wch: 12 },  // 예정일
      { wch: 12 },  // 완료일
      { wch: 15 },  // 예상금액
      { wch: 12 },  // 후속상담일
      { wch: 12 },  // 계약생성여부
      { wch: 20 },  // 계약ID
      { wch: 20 },  // 메모
      { wch: 20 },  // 결과
      { wch: 8 },   // 평점
      { wch: 12 },  // 생성일
      { wch: 12 }   // 수정일
    ];
    ws['!cols'] = colWidths;

    // 전화번호 컬럼을 텍스트 형식으로 설정
    const phoneColIndex = 4; // 연락처 컬럼 (0-based)
    for (let i = 1; i <= excelData.length; i++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c: phoneColIndex });
      if (ws[cellAddress]) {
        ws[cellAddress].z = '@'; // 텍스트 형식
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, '상담이력');

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // 파일명 생성
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = selectedIds ? 
      `consultation-history-selected-${timestamp}.xlsx` : 
      `consultation-history-${timestamp}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('상담 이력 다운로드 오류:', error);
    return NextResponse.json(
      { error: '상담 이력 다운로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}
