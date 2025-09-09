import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createSuccessResponse, createErrorResponse, createBadRequestResponse } from '@/lib/apiResponse';

export const runtime = 'nodejs';

// 계약번호 생성 함수
function generateContractNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CT${year}${month}${day}${random}`;
}

// 안전한 날짜 변환 함수
function safeDateParse(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  // 빈 문자열이나 'Invalid Date' 문자열 체크
  if (dateString === '' || dateString === 'Invalid Date') return null;
  
  const date = new Date(dateString);
  
  // 날짜 유효성 검증
  if (isNaN(date.getTime())) {
    console.warn(`유효하지 않은 날짜 문자열: ${dateString}`);
    return null;
  }
  
  return date;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      customerAddress,
      manager,
      insuredName,
      insuredPhone,
      itemCategory,
      companyName,
      itemName,
      contractAmount,
      expectedRate,
      pointRate,
      decisionPoints,
      contractDate,
      paymentTerm,
      endDate,
      payoutRate,
      finalPoints,
      installationDate,
      dynamicFields
    } = body;

    // 필수 필드 검증
    if (!customerName || !customerPhone || !itemCategory || !itemName || !contractAmount || !contractDate || !paymentTerm) {
      return createBadRequestResponse('필수 입력 항목이 누락되었습니다.');
    }

    // 증권번호 필수 검증
    if (!dynamicFields || !dynamicFields.policyNumber || dynamicFields.policyNumber.trim() === '') {
      return createBadRequestResponse('증권번호는 수금관리에 필수 입력 항목입니다.');
    }

    // 날짜 유효성 검증
    const parsedContractDate = safeDateParse(contractDate);
    const parsedEndDate = safeDateParse(endDate);
    const parsedInstallationDate = safeDateParse(installationDate);

    if (!parsedContractDate) {
      return createBadRequestResponse('계약일자가 유효하지 않습니다.');
    }

    // 계약번호 생성
    const contractNumber = generateContractNumber();

    // 계약 데이터 생성
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        customerName,
        customerPhone,
        customerAddress: customerAddress || '',
        itemCategory,
        companyName: companyName || '',
        itemName,
        contractAmount: parseInt(contractAmount.toString().replace(/,/g, '')),
        commissionRate: 0, // 기본값
        commissionAmount: 0, // 기본값
        expectedRate: expectedRate ? parseFloat(expectedRate) : null,
        pointRate: pointRate ? parseFloat(pointRate) : null,
        payoutRate: payoutRate ? parseFloat(payoutRate) : null,
        finalPoints: finalPoints ? parseFloat(finalPoints) : null,
        decisionPoints: decisionPoints ? parseFloat(decisionPoints) : null,
        contractDate: parsedContractDate,
        startDate: null,
        endDate: parsedEndDate,
        installationDate: parsedInstallationDate,
        insuredName: insuredName || '',
        insuredPhone: insuredPhone || '',
        dynamicFields: JSON.stringify({
          ...(dynamicFields || {}),
          manager: manager || '',
          paymentTerm: paymentTerm || ''
        }),
        status: 'ACTIVE',
        createdBy: '관리자',
      },
    });

    return createSuccessResponse(
      { contract },
      '계약이 성공적으로 입력되었습니다.'
    );

  } catch (error) {
    console.error('계약 입력 오류:', error);
    return createErrorResponse('계약 입력 중 오류가 발생했습니다.');
  }
}

export async function GET(request: NextRequest) {
  try {
    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');


    // 필터 조건 구성
    const where: Record<string, unknown> = {
      status: 'ACTIVE' // 계약목록은 ACTIVE 상태만 표시
    };
    if (category) where.itemCategory = category;

    // 계약 목록 조회
    const contracts = await prisma.contract.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 전체 개수 조회
    const total = await prisma.contract.count({ where });

    return createSuccessResponse({
      contracts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('계약 목록 조회 오류:', error);
    return createErrorResponse('계약 목록 조회 중 오류가 발생했습니다.');
  }
}
