import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 수금검증 엑셀 업로드 API 호출');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 });
    }

    // 파일 확장자 검증 (엑셀 파일과 CSV 파일 모두 허용)
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      return NextResponse.json({ error: '엑셀 파일(.xlsx, .xls) 또는 CSV 파일(.csv)만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일 확장자에 따라 처리 방식 결정
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    let jsonData: any[][];

    if (isCSV) {
      // CSV 파일 처리
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      jsonData = lines.map(line => {
        // CSV 파싱 (간단한 쉼표 구분)
        return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      });
    } else {
      // 엑셀 파일 처리
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // 첫 번째 시트 선택
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // 시트를 JSON으로 변환
      jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    }
    
    if (jsonData.length < 2) {
      return NextResponse.json({ error: '엑셀 파일에 데이터가 없습니다.' }, { status: 400 });
    }

    // 데이터 파싱 (첫 번째 행은 헤더로 간주)
    const [headers, ...rows] = jsonData as any[][];
    
    const parsedData = rows
      .filter(row => row && row.length > 0) // 빈 행 제거
      .map((row, index) => {
        try {
          // 컬럼 순서: 이름, 전화번호, 증권번호, 금액
          const customerName = String(row[0] || '').trim();
          const customerPhone = String(row[1] || '').trim();
          const contractNumber = String(row[2] || '').trim();
          const amount = parseFloat(String(row[3] || '0').replace(/[^0-9.-]/g, '')) || 0;

          return {
            customerName,
            customerPhone,
            contractNumber,
            amount
          };
        } catch (error) {
          console.error(`데이터 파싱 오류 (행 ${index + 2}):`, error);
          return null;
        }
      })
      .filter(item => item && item.customerName && item.customerPhone && item.contractNumber);

    if (parsedData.length === 0) {
      return NextResponse.json({ error: '유효한 데이터가 없습니다. 이름, 전화번호, 증권번호가 모두 포함된 데이터를 확인해주세요.' }, { status: 400 });
    }

    console.log(`✅ 엑셀 데이터 파싱 완료: ${parsedData.length}건`);

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: `${parsedData.length}건의 데이터를 성공적으로 업로드했습니다.`
    });

  } catch (error) {
    console.error('엑셀 업로드 오류:', error);
    return NextResponse.json({ error: '엑셀 파일 처리 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
