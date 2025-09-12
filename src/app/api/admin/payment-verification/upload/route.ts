import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import * as XLSX from 'xlsx';

// 엑셀 파일 업로드 및 검증 API
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '파일이 제공되지 않았습니다.' }, { status: 400 });
    }

    // 파일 확장자 검증
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json({ error: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' }, { status: 400 });
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 10MB 이하여야 합니다.' }, { status: 400 });
    }

    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // 첫 번째 시트 선택
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // 시트를 JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length < 2) {
      return NextResponse.json({ error: '엑셀 파일에 데이터가 없습니다.' }, { status: 400 });
    }

    // 헤더 행 검증
    const headers = jsonData[0] as string[];
    const requiredHeaders = ['이름', '증권번호', '추천인', '담당자', '납입금액', '수금월'];
    
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `필수 컬럼이 누락되었습니다: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    // 헤더 인덱스 매핑
    const headerIndexes = {
      name: headers.indexOf('이름'),
      policyNumber: headers.indexOf('증권번호'),
      referrer: headers.indexOf('추천인'),
      manager: headers.indexOf('담당자'),
      paymentAmount: headers.indexOf('납입금액'),
      paymentMonth: headers.indexOf('수금월'),
    };

    // 데이터 행 처리
    const uploadData = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // 빈 행 건너뛰기
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }

      const name = row[headerIndexes.name]?.toString().trim();
      const policyNumber = row[headerIndexes.policyNumber]?.toString().trim();
      const referrer = row[headerIndexes.referrer]?.toString().trim();
      const manager = row[headerIndexes.manager]?.toString().trim();
      const paymentAmount = row[headerIndexes.paymentAmount];
      const paymentMonth = row[headerIndexes.paymentMonth]?.toString().trim();

      // 필수 필드 검증
      if (!name || !policyNumber || !referrer || !manager || !paymentAmount || !paymentMonth) {
        continue; // 필수 필드가 없는 행은 건너뛰기
      }

      // 납입금액 숫자 변환
      let amount = 0;
      if (typeof paymentAmount === 'number') {
        amount = paymentAmount;
      } else if (typeof paymentAmount === 'string') {
        // 쉼표 제거 후 숫자 변환
        const cleanAmount = paymentAmount.replace(/[,\s]/g, '');
        amount = parseFloat(cleanAmount) || 0;
      }

      if (amount <= 0) {
        continue; // 유효하지 않은 금액은 건너뛰기
      }

      uploadData.push({
        name,
        policyNumber,
        referrer,
        manager,
        paymentAmount: amount,
        paymentMonth,
      });
    }

    if (uploadData.length === 0) {
      return NextResponse.json({ error: '유효한 데이터가 없습니다.' }, { status: 400 });
    }

    // 수금 데이터 검증 로직
    const verificationResult = await verifyPaymentData(uploadData);

    return NextResponse.json(verificationResult);

  } catch (error) {
    console.error('엑셀 파일 처리 오류:', error);
    return NextResponse.json({ 
      error: '파일 처리 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}

// 수금 데이터 검증 함수
async function verifyPaymentData(uploadData: any[]) {
  const success: any[] = [];
  const failure: any[] = [];

  for (const data of uploadData) {
    try {
      // 해당 월의 수금관리 데이터에서 매칭되는 계약 찾기
      const matchingContract = await findMatchingContract(data);
      
      if (matchingContract) {
        // 매칭되는 계약이 있으면 수금성공
        success.push({
          ...data,
          contractId: matchingContract.id,
          contractNumber: matchingContract.contractNumber,
        });
      } else {
        // 매칭되는 계약이 없으면 수금실패
        failure.push({
          ...data,
          reason: '매칭되는 계약을 찾을 수 없습니다.',
        });
      }
    } catch (error) {
      console.error('데이터 검증 오류:', error);
      failure.push({
        ...data,
        reason: '검증 중 오류가 발생했습니다.',
      });
    }
  }

  return {
    success,
    failure,
    totalCount: uploadData.length,
    successCount: success.length,
    failureCount: failure.length,
  };
}

// 매칭되는 계약 찾기 함수
async function findMatchingContract(data: any) {
  try {
    // 수금월을 기준으로 해당 월의 계약 데이터 조회
    const paymentMonth = data.paymentMonth;
    
    // 수금월 형식 검증 (YYYY-MM 형식)
    if (!paymentMonth.match(/^\d{4}-\d{2}$/)) {
      return null;
    }

    // 해당 월의 계약확정된 계약들 조회
    const contracts = await prisma.contract.findMany({
      where: {
        status: 'CONFIRMED', // 계약확정된 상태
        // 수금월에 해당하는 계약들 (계약일 기준으로 해당 월 포함)
        contractDate: {
          gte: new Date(`${paymentMonth}-01`),
          lt: new Date(`${paymentMonth}-01`).setMonth(new Date(`${paymentMonth}-01`).getMonth() + 1),
        },
      },
      include: {
        itemSetting: true,
      },
    });

    // 6개 데이터로 매칭 검증
    for (const contract of contracts) {
      const dynamicFields = contract.dynamicFields ? JSON.parse(contract.dynamicFields) : {};
      
      // 매칭 조건 검증
      const isNameMatch = contract.customerName === data.name;
      const isPolicyMatch = dynamicFields.policyNumber === data.policyNumber;
      const isReferrerMatch = contract.itemSetting?.provider === data.referrer;
      const isManagerMatch = contract.createdBy === data.manager;
      
      // 납입금액 매칭 (계약금액과 비교, 허용 오차 10%)
      const contractAmount = contract.contractAmount || 0;
      const paymentAmount = data.paymentAmount;
      const isAmountMatch = Math.abs(contractAmount - paymentAmount) <= contractAmount * 0.1;
      
      // 수금월 매칭 (계약일이 해당 월에 포함되는지)
      const contractDate = new Date(contract.contractDate);
      const contractMonth = `${contractDate.getFullYear()}-${String(contractDate.getMonth() + 1).padStart(2, '0')}`;
      const isMonthMatch = contractMonth === paymentMonth;

      // 모든 조건이 매칭되면 성공
      if (isNameMatch && isPolicyMatch && isReferrerMatch && isManagerMatch && isAmountMatch && isMonthMatch) {
        return contract;
      }
    }

    return null;
  } catch (error) {
    console.error('계약 매칭 오류:', error);
    return null;
  }
}





