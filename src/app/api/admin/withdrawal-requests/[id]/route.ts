import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 출금신청 개별 처리 API
 * PUT: 출금신청 상태 변경 (승인/거절/완료)
 * GET: 특정 출금신청 상세 조회
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, processedBy, rejectionReason } = body;

    console.log('출금신청 상태 변경:', { id, status, processedBy, rejectionReason });

    // 필수 필드 검증
    if (!status) {
      return NextResponse.json(
        { error: '상태는 필수입니다.' },
        { status: 400 }
      );
    }

    // 유효한 상태값 검증
    const validStatuses = ['REQUESTED', 'PROCESSING', 'PAID', 'REJECTED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: '유효하지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    // 출금신청 조회
    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            points: true,
            finalPoints: true
          }
        }
      }
    });

    if (!withdrawalRequest) {
      return NextResponse.json(
        { error: '출금신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 출금승인 시 포인트 차감 로직 (PROCESSING 상태)
    if (status === 'PROCESSING') {
      console.log('출금승인 처리 시작:', {
        userId: withdrawalRequest.userId,
        userName: withdrawalRequest.userName,
        totalAmount: withdrawalRequest.totalAmount,
        finalPoints: withdrawalRequest.finalPoints
      });

      // 1. 사용자의 현재 포인트 상태 확인
      const user = await prisma.user.findUnique({
        where: { id: withdrawalRequest.userId },
        select: {
          id: true,
          name: true,
          phone: true,
          points: true,
          finalPoints: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: '사용자를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 2. 출금가능포인트 검증
      if (user.finalPoints < withdrawalRequest.totalAmount) {
        return NextResponse.json(
          { error: '출금가능포인트가 부족합니다.' },
          { status: 400 }
        );
      }

      // 3. 출금승인 처리 (트랜잭션 사용)
      const result = await prisma.$transaction(async (tx) => {
        // 3-1. 출금신청 상태 업데이트
        const updatedRequest = await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: 'PROCESSING',
            processedBy,
            processedAt: new Date()
          }
        });

        // 3-2. 사용자 포인트 차감
        const updatedUser = await tx.user.update({
          where: { id: withdrawalRequest.userId },
          data: {
            finalPoints: {
              decrement: withdrawalRequest.totalAmount
            }
          }
        });

        // 3-3. 포인트 변동 기록 생성
        await tx.pointLedger.create({
          data: {
            userId: withdrawalRequest.userId,
            amount: -withdrawalRequest.totalAmount, // 차감이므로 음수
            kind: 'WITHDRAWAL',
            description: `출금승인: ${withdrawalRequest.totalAmount.toLocaleString()}원`,
            referenceId: id,
            referenceType: 'WITHDRAWAL'
          }
        });

        console.log('출금승인 처리 완료:', {
          requestId: id,
          userId: withdrawalRequest.userId,
          deductedAmount: withdrawalRequest.totalAmount,
          remainingPoints: updatedUser.finalPoints
        });

        return { updatedRequest, updatedUser };
      });

      return NextResponse.json({
        success: true,
        message: '출금신청이 승인되었습니다.',
        data: {
          id: result.updatedRequest.id,
          status: result.updatedRequest.status,
          processedAt: result.updatedRequest.processedAt,
          remainingPoints: result.updatedUser.finalPoints
        }
      });

    } else if (status === 'PAID') {
      // 출금완료 처리 (User.totalPaidPoints 업데이트)
      console.log('출금완료 처리 시작:', {
        withdrawalRequestId: id,
        userId: withdrawalRequest.userId,
        userName: withdrawalRequest.userName,
        totalAmount: withdrawalRequest.totalAmount
      });

      const result = await prisma.$transaction(async (tx) => {
        // 1. 출금신청 상태를 PAID로 변경
        const updatedRequest = await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: 'PAID',
            processedBy,
            processedAt: new Date(),
            paidAt: new Date()
          }
        });

        // 2. User.totalPaidPoints 증가 (총지급포인트 누적)
        const updatedUser = await tx.user.update({
          where: { id: withdrawalRequest.userId },
          data: {
            totalPaidPoints: {
              increment: withdrawalRequest.totalAmount
            }
          }
        });

        console.log('✅ 총지급포인트 누적 업데이트 완료:', {
          userId: withdrawalRequest.userId,
          userName: withdrawalRequest.userName,
          paidAmount: withdrawalRequest.totalAmount,
          newTotalPaidPoints: updatedUser.totalPaidPoints,
          calculation: `기존 누적 + ${withdrawalRequest.totalAmount} = ${updatedUser.totalPaidPoints}`
        });

        // 3. 입금완료리스트에 기록 생성
        const depositRecord = await tx.depositRecord.create({
          data: {
            userId: withdrawalRequest.userId,
            userName: withdrawalRequest.userName,
            userPhone: withdrawalRequest.userPhone,
            withdrawalRequestId: id,
            pointAmount: withdrawalRequest.totalAmount,
            depositAmount: withdrawalRequest.totalAmount, // 실제 입금액 (포인트와 동일)
            depositDate: new Date(),
            processedBy: processedBy || '관리자',
            memo: `출금승인 완료: ${withdrawalRequest.totalAmount.toLocaleString()}P`
          }
        });

        console.log('✅ 입금완료리스트 기록 생성 완료:', {
          depositRecordId: depositRecord.id,
          userId: withdrawalRequest.userId,
          userName: withdrawalRequest.userName,
          pointAmount: depositRecord.pointAmount,
          depositAmount: depositRecord.depositAmount,
          depositDate: depositRecord.depositDate
        });

        return { updatedRequest, updatedUser, depositRecord };
      });

      return NextResponse.json({
        success: true,
        message: '출금이 완료되었습니다.',
        data: {
          id: result.updatedRequest.id,
          status: result.updatedRequest.status,
          processedAt: result.updatedRequest.processedAt,
          paidAt: result.updatedRequest.paidAt,
          totalPaidPoints: result.updatedUser.totalPaidPoints
        }
      });

    } else if (status === 'REJECTED') {
      // 🔥 4단계: 출금신청 거절 시 포인트 복구 로직
      console.log('출금신청 거절 처리 시작:', {
        withdrawalRequestId: id,
        userId: withdrawalRequest.userId,
        userName: withdrawalRequest.userName,
        totalAmount: withdrawalRequest.totalAmount,
        rejectionReason
      });

      const result = await prisma.$transaction(async (tx) => {
        // 1. 현재 User.remainingPoints 조회
        const currentUser = await tx.user.findUnique({
          where: { id: withdrawalRequest.userId },
          select: { remainingPoints: true }
        });

        // 2. User.remainingPoints 복구 (거절된 출금요청금액만큼 증가)
        const updatedUser = await tx.user.update({
          where: { id: withdrawalRequest.userId },
          data: {
            remainingPoints: {
              increment: withdrawalRequest.totalAmount
            }
          }
        });

        console.log('✅ 잔여포인트 복구 완료:', {
          before: currentUser?.remainingPoints || 0,
          rejectedAmount: withdrawalRequest.totalAmount,
          newRemainingPoints: updatedUser.remainingPoints,
          calculation: `${currentUser?.remainingPoints || 0} + ${withdrawalRequest.totalAmount} = ${updatedUser.remainingPoints}`
        });

        // 3. 포인트 원장에 복구 기록 추가
        await tx.pointLedger.create({
          data: {
            userId: withdrawalRequest.userId,
            kind: 'WITHDRAWAL_REJECT',
            amount: withdrawalRequest.totalAmount, // 양수로 복구 기록
            availableAt: new Date(),
            memo: `출금신청 거절로 인한 포인트 복구: ${withdrawalRequest.totalAmount.toLocaleString()}P`,
            description: '출금신청 거절로 인한 포인트 복구',
            referenceId: id,
            referenceType: 'WITHDRAWAL_REJECT'
          }
        });

        console.log('✅ 포인트 원장 복구 기록 완료:', {
          amount: withdrawalRequest.totalAmount,
          memo: `출금신청 거절로 인한 포인트 복구: ${withdrawalRequest.totalAmount.toLocaleString()}P`
        });

        // 4. 출금신청 상태를 REJECTED로 변경
        const updatedRequest = await tx.withdrawalRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            processedBy,
            processedAt: new Date(),
            rejectionReason
          }
        });

        console.log('✅ 출금신청 상태 변경 완료:', {
          id: updatedRequest.id,
          status: updatedRequest.status,
          rejectionReason
        });

        return { updatedUser, updatedRequest };
      });

      console.log('🎉 출금신청 거절 처리 완료:', {
        withdrawalRequestId: id,
        userId: withdrawalRequest.userId,
        totalAmount: withdrawalRequest.totalAmount,
        restoredRemainingPoints: result.updatedUser.remainingPoints
      });

      return NextResponse.json({
        success: true,
        message: '출금신청이 거절되었습니다. 포인트가 복구되었습니다.',
        data: {
          id: result.updatedRequest.id,
          status: result.updatedRequest.status,
          processedAt: result.updatedRequest.processedAt,
          rejectionReason: result.updatedRequest.rejectionReason,
          restoredRemainingPoints: result.updatedUser.remainingPoints
        }
      });

    } else {
      // 다른 상태 변경 (취소 등)
      const updatedRequest = await prisma.withdrawalRequest.update({
        where: { id },
        data: {
          status,
          processedBy,
          processedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        message: '출금신청 상태가 변경되었습니다.',
        data: {
          id: updatedRequest.id,
          status: updatedRequest.status,
          processedAt: updatedRequest.processedAt
        }
      });
    }

  } catch (error) {
    console.error('출금신청 상태 변경 오류:', error);
    return NextResponse.json(
      { error: '출금신청 상태 변경 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE: 출금신청 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log('출금신청 삭제 요청:', { id });

    // 출금신청 존재 확인
    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        userName: true,
        totalAmount: true,
        status: true
      }
    });

    if (!withdrawalRequest) {
      return NextResponse.json(
        { error: '출금신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 처리된 출금신청은 삭제 불가
    if (withdrawalRequest.status === 'PAID') {
      return NextResponse.json(
        { error: '이미 완료된 출금신청은 삭제할 수 없습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 삭제 처리
    await prisma.$transaction(async (tx) => {
      // 1. 포인트 원장에서 관련 기록 삭제
      await tx.pointLedger.deleteMany({
        where: {
          referenceId: id,
          referenceType: 'WITHDRAWAL'
        }
      });

      // 2. 출금신청 삭제
      await tx.withdrawalRequest.delete({
        where: { id }
      });
    });

    console.log('출금신청 삭제 완료:', {
      id,
      userName: withdrawalRequest.userName,
      totalAmount: withdrawalRequest.totalAmount
    });

    return NextResponse.json({
      success: true,
      message: '출금신청이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('출금신청 삭제 오류:', error);
    return NextResponse.json(
      { error: '출금신청 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const withdrawalRequest = await prisma.withdrawalRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            points: true,
            finalPoints: true,
            bankName: true,
            bankAccount: true,
            accountHolder: true
          }
        }
      }
    });

    if (!withdrawalRequest) {
      return NextResponse.json(
        { error: '출금신청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: withdrawalRequest
    });

  } catch (error) {
    console.error('출금신청 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '출금신청 상세 정보를 가져오는 데 실패했습니다.' },
      { status: 500 }
    );
  }
}

