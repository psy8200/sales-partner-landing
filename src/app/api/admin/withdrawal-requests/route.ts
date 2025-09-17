import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export const runtime = 'nodejs';

/**
 * 출금신청 API
 * POST: 새로운 출금신청 생성
 * GET: 출금신청 목록 조회
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // 기본 정보 추출
    const userId = formData.get('userId') as string;
    const userName = formData.get('userName') as string;
    const userPhone = formData.get('userPhone') as string;
    const finalPoints = parseFloat(formData.get('finalPoints') as string);
    const withdrawablePoints = parseFloat(formData.get('finalPoints') as string); // 출금가능포인트 (신청 시점의 정확한 값)
    const totalAmount = parseFloat(formData.get('totalAmount') as string);
    const idCardFile = formData.get('idCardFile') as File;

    console.log('출금신청 데이터:', {
      userId,
      userName,
      userPhone,
      finalPoints,
      withdrawablePoints,
      totalAmount,
      hasFile: !!idCardFile
    });

    // 필수 필드 검증
    if (!userId || !userName || !userPhone || !finalPoints || !totalAmount) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 금액 검증 (정확성 보장)
    if (totalAmount <= 0 || totalAmount > finalPoints) {
      return NextResponse.json(
        { error: '출금 요청 금액이 유효하지 않습니다.' },
        { status: 400 }
      );
    }

    // 10,000원 단위 검증
    if (totalAmount % 10000 !== 0) {
      return NextResponse.json(
        { error: '출금 요청 금액은 10,000원 단위로만 가능합니다.' },
        { status: 400 }
      );
    }

    // 사용자 존재 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 정보 일치 확인
    if (user.name !== userName || user.phone !== userPhone) {
      return NextResponse.json(
        { error: '사용자 정보가 일치하지 않습니다.' },
        { status: 400 }
      );
    }

    // 사용자 계좌정보 조회 (/profile 페이지의 데이터 사용)
    const accountInfo = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        bankName: true,
        bankAccount: true,
        accountHolder: true
      }
    });

    if (!accountInfo || !accountInfo.bankName || !accountInfo.bankAccount) {
      return NextResponse.json(
        { error: '계좌 정보가 등록되지 않았습니다. 프로필 페이지에서 계좌 정보를 등록해주세요.' },
        { status: 400 }
      );
    }

    // 신분증 파일 저장
    let idCardFilePath = null;
    if (idCardFile && idCardFile.size > 0) {
      try {
        // 파일 크기 검증 (5MB 제한)
        if (idCardFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: '파일 크기는 5MB 이하로 업로드해주세요.' },
            { status: 400 }
          );
        }

        // 파일 타입 검증
        if (!idCardFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: '이미지 파일만 업로드 가능합니다.' },
            { status: 400 }
          );
        }

        // 파일 저장
        const bytes = await idCardFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // 파일명 생성 (타임스탬프 + 원본파일명)
        const timestamp = Date.now();
        const fileName = `${timestamp}_${idCardFile.name}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'id-cards');
        
        // 디렉토리 생성 (존재하지 않는 경우)
        await mkdir(uploadDir, { recursive: true });
        
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        
        idCardFilePath = `/uploads/id-cards/${fileName}`;
        
        console.log('신분증 파일 저장 완료:', idCardFilePath);
      } catch (fileError) {
        console.error('파일 저장 오류:', fileError);
        return NextResponse.json(
          { error: '파일 저장 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    // 현재 년월 생성 (YYYY-MM 형식)
    const currentDate = new Date();
    const settlementMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // 출금신청 데이터 저장 및 User.remainingPoints 차감 (트랜잭션 사용)
    const result = await prisma.$transaction(async (tx) => {
      // 1. 출금신청 데이터 저장
      const withdrawalRequest = await tx.withdrawalRequest.create({
        data: {
          userId,
          userName,
          userPhone,
          finalPoints,
          withdrawablePoints,
          totalAmount,
          requestInfo: '출금신청',
          settlementMonth,
          bankName: accountInfo.bankName,
          accountNumber: accountInfo.bankAccount,
          idCardFile: idCardFilePath,
          status: 'REQUESTED'
        }
      });

      // 2. User.remainingPoints 계산 (출금가능금액 - 출금신청금액)
      const newRemainingPoints = finalPoints - totalAmount;
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          remainingPoints: newRemainingPoints
        }
      });

      console.log('✅ 출금신청 및 잔여포인트 차감 완료:', {
        withdrawalRequestId: withdrawalRequest.id,
        userId,
        userName,
        requestedAmount: totalAmount,
        newRemainingPoints: updatedUser.remainingPoints,
        calculation: `기존 잔여포인트 - ${totalAmount} = ${updatedUser.remainingPoints}`
      });

      return { withdrawalRequest, updatedUser };
    });

    console.log('✅ 출금신청 데이터 저장 완료:', {
      id: result.withdrawalRequest.id,
      status: 'REQUESTED'
    });

    console.log('🎉 출금신청 완료:', {
      id: result.withdrawalRequest.id,
      userName,
      userPhone,
      totalAmount,
      settlementMonth,
      remainingPoints: result.updatedUser.remainingPoints
    });

    return NextResponse.json({
      success: true,
      message: '출금신청이 완료되었습니다. 관리자 승인 후 처리됩니다.',
      data: {
        id: result.withdrawalRequest.id,
        totalAmount,
        settlementMonth,
        status: result.withdrawalRequest.status,
        remainingPoints: result.updatedUser.remainingPoints,
        withdrawableAmount: finalPoints
      }
    });

  } catch (error) {
    console.error('출금신청 오류:', error);
    return NextResponse.json(
      { error: '출금신청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // 검색 조건 구성
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { userPhone: { contains: search } },
        { settlementMonth: { contains: search } }
      ];
    }

    // 출금신청 목록 조회
    const [withdrawalRequests, total] = await Promise.all([
      prisma.withdrawalRequest.findMany({
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
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.withdrawalRequest.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data: {
        requests: withdrawalRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('출금신청 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '출금신청 목록을 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

