import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { createSuccessResponse, createErrorResponse, createNotFoundResponse } from '@/lib/apiResponse';

// 회사정보 조회
export async function GET() {
  try {
    const companyInfo = await prisma.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!companyInfo) {
      return createNotFoundResponse('회사정보가 설정되지 않았습니다.');
    }

    return createSuccessResponse(companyInfo);
  } catch (error) {
    console.error('회사정보 조회 오류:', error);
    return createErrorResponse('회사정보를 가져오는 중 오류가 발생했습니다.');
  }
}

// 회사정보 저장/수정
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      companyName,
      businessNumber,
      representative,
      address,
      phone,
      email,
      website,
      description,
      referralCodeDefault
    } = body;

    // 필수 필드 검증
    if (!companyName || !businessNumber || !representative || !address || !phone || !email) {
      return NextResponse.json({
        success: false,
        error: '필수 필드를 모두 입력해주세요.'
      }, { status: 400 });
    }

    // 기존 회사정보 확인
    const existingCompany = await prisma.companyInfo.findFirst({
      where: { isActive: true }
    });

    let companyInfo;
    
    if (existingCompany) {
      // 기존 회사정보 수정
      companyInfo = await prisma.companyInfo.update({
        where: { id: existingCompany.id },
        data: {
          companyName,
          businessNumber,
          representative,
          address,
          phone,
          email,
          website: website || '',
          description: description || '',
          referralCodeDefault: referralCodeDefault || '',
          updatedAt: new Date()
        }
      });
    } else {
      // 새 회사정보 생성
      companyInfo = await prisma.companyInfo.create({
        data: {
          companyName,
          businessNumber,
          representative,
          address,
          phone,
          email,
          website: website || '',
          description: description || '',
          referralCodeDefault: referralCodeDefault || '',
          isActive: true
        }
      });
    }

    return createSuccessResponse(
      companyInfo,
      '회사정보가 성공적으로 저장되었습니다.'
    );
  } catch (error) {
    console.error('회사정보 저장 오류:', error);
    
    let errorMessage = '회사정보 저장 중 오류가 발생했습니다.';
    if (error instanceof Error) {
      errorMessage += ` (${error.message})`;
    }
    
    return createErrorResponse(errorMessage);
  }
}
