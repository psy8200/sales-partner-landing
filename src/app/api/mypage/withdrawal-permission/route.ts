import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 출금 권한 및 가능한 포인트 계산 API
export async function GET(request: NextRequest) {
  try {
    // 현재 로그인된 사용자 정보 가져오기
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    // 토큰 디코딩
    const tokenData = JSON.parse(Buffer.from(sessionToken, 'base64url').toString());
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json({ error: '유효하지 않은 세션입니다.' }, { status: 401 });
    }

    const userId = tokenData.userId;

    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        points: true, 
        role: true,
        partnerStatus: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 수금완료된 계약들의 포인트 계산
    const completedPayments = await prisma.payment.findMany({
      where: {
        status: 'PAID', // 수금완료 상태
        contract: {
          // 해당 사용자와 관련된 계약들 (여기서는 간단히 모든 수금완료된 계약으로 처리)
          // 실제로는 사용자와 계약의 관계를 설정해야 함
        },
      },
      include: {
        contract: {
          select: {
            finalPoints: true,
            customerName: true,
            contractNumber: true,
          },
        },
      },
    });

    // 출금 가능한 포인트 계산
    const withdrawablePoints = completedPayments.reduce((sum, payment) => {
      return sum + (payment.contract?.finalPoints || 0);
    }, 0);

    // 수금 대기 중인 포인트 계산
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: 'PENDING', // 수금 대기 상태
      },
      include: {
        contract: {
          select: {
            finalPoints: true,
            customerName: true,
            contractNumber: true,
          },
        },
      },
    });

    const pendingPoints = pendingPayments.reduce((sum, payment) => {
      return sum + (payment.contract?.finalPoints || 0);
    }, 0);

    // 출금 권한 확인
    const canWithdraw = user.role === 'MEMBER' && user.partnerStatus === 'APPROVED' && withdrawablePoints > 0;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        partnerStatus: user.partnerStatus,
      },
      points: {
        total: user.points,
        withdrawable: withdrawablePoints,
        pending: pendingPoints,
        scheduled: 0, // 예정된 포인트 (필요시 추가)
      },
      withdrawal: {
        canWithdraw,
        reason: !canWithdraw ? 
          (user.role !== 'MEMBER' ? '일반회원은 출금할 수 없습니다.' :
           user.partnerStatus !== 'APPROVED' ? '파트너회원이 아니면 출금할 수 없습니다.' :
           withdrawablePoints <= 0 ? '출금 가능한 포인트가 없습니다.' : '') : '',
      },
      completedPayments: completedPayments.map(payment => ({
        contractNumber: payment.contract?.contractNumber,
        customerName: payment.contract?.customerName,
        points: payment.contract?.finalPoints || 0,
        paidDate: payment.paidDate,
      })),
    });

  } catch (error) {
    console.error('출금 권한 조회 오류:', error);
    return NextResponse.json({ 
      error: '출금 권한 조회 중 오류가 발생했습니다.' 
    }, { status: 500 });
  }
}
