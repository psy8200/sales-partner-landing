import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

/**
 * 정산리스트 Excel 다운로드 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 정산리스트 Excel 다운로드 API 호출 시작');
    
    const body = await request.json();
    const { data, fields, filename } = body;

    console.log('📋 요청 데이터:', { 
      dataCount: data?.length || 0, 
      fields: fields?.length || 0, 
      filename 
    });

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: '데이터가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { success: false, error: '필드 정보가 올바르지 않습니다.' },
        { status: 400 }
      );
    }

    // 데이터 변환 (필요한 필드만 추출)
    const excelData = data.map((item: any) => {
      const row: any = {};
      fields.forEach((field: string) => {
        if (field === 'contractNumbers' && Array.isArray(item[field])) {
          // 계약번호 배열을 문자열로 변환
          row[field] = item[field].join(', ');
        } else if (field === 'contractAmount' || field === 'finalPoints') {
          // 숫자 필드는 포맷팅
          row[field] = item[field] || 0;
        } else if (field === 'confirmedAt') {
          // 날짜 필드는 포맷팅
          row[field] = item[field] ? new Date(item[field]).toLocaleDateString('ko-KR') : '';
        } else {
          row[field] = item[field] || '';
        }
      });
      return row;
    });

    console.log('📊 Excel 데이터 변환 완료:', excelData.length, '행');

    // 필드명을 한국어로 매핑
    const fieldMapping: { [key: string]: string } = {
      customerName: '고객명',
      customerPhone: '연락처',
      myCode: '내코드',
      contractCount: '계약건수',
      contractAmount: '계약금액',
      finalPoints: '최종포인트',
      confirmedAt: '확정일시',
      contractNumbers: '계약번호'
    };

    // 헤더 생성
    const headers = fields.map((field: string) => fieldMapping[field] || field);

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    
    // 데이터 시트 생성 (헤더 포함)
    const wsData = [headers, ...excelData.map(row => fields.map(field => row[field]))];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 컬럼 너비 설정
    const colWidths = fields.map((field: string) => {
      switch (field) {
        case 'customerName': return { wch: 15 };
        case 'customerPhone': return { wch: 15 };
        case 'myCode': return { wch: 12 };
        case 'contractCount': return { wch: 10 };
        case 'contractAmount': return { wch: 15 };
        case 'finalPoints': return { wch: 12 };
        case 'confirmedAt': return { wch: 12 };
        case 'contractNumbers': return { wch: 20 };
        default: return { wch: 12 };
      }
    });
    ws['!cols'] = colWidths;

    // 워크북에 시트 추가
    XLSX.utils.book_append_sheet(wb, ws, '정산리스트');

    // Excel 파일 생성
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    console.log('✅ Excel 파일 생성 완료');

    // 응답 반환
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename || '정산리스트.xlsx')}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Excel 다운로드 오류:', error);
    return NextResponse.json(
      { success: false, error: 'Excel 다운로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

