import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { canModifySecurityFields, createUnauthorizedResponse } from '@/lib/adminAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        points: true,
        referralCode: true, // 사용자 추천인코드
        bankName: true,
        accountHolder: true,
        bankAccount: true,
        createdAt: true,
      },
    });

    // 파트너신청 데이터에서 referrer 값 가져오기
    const partnerApplication = await prisma.partnerApplication.findFirst({
      where: { userId: id },
      select: { referrer: true },
    });

    // 상담신청관리에서 보이는 추천인코드 (파트너신청의 referrer)
    const displayReferralCode = partnerApplication?.referrer || user?.referralCode || '';
    if (!user) {
      console.error(`사용자를 찾을 수 없음: ${id}`);
      return NextResponse.json({ 
        error: '사용자를 찾을 수 없습니다.',
        details: `ID: ${id}`
      }, { status: 404 });
    }
    
    console.log('사용자 데이터 조회 성공:', { id: user.id, name: user.name, email: user.email });
    
    // 상담신청관리에서 보이는 추천인코드를 포함하여 응답
    const responseData = {
      ...user,
      referralCode: displayReferralCode, // 상담신청관리에서 보이는 추천인코드로 덮어쓰기
    };
    
    return NextResponse.json(responseData);
  } catch (e) {
    console.error('사용자 조회 오류:', e);
    return NextResponse.json({ 
      error: '사용자 정보를 가져오는 중 오류가 발생했습니다.',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 어드민 세션 쿠키에서 토큰 가져오기 (모든 adminSession 쿠키 확인)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    let adminSessionToken = null;
    if (adminSessionCookies.length > 0) {
      // 가장 최근 쿠키 사용 (보통 마지막에 설정된 것)
      adminSessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;
    }
    
    if (!adminSessionToken) {
      return NextResponse.json(createUnauthorizedResponse('어드민 로그인이 필요합니다.'), { status: 401 });
    }

    // 토큰 디코딩 (기존 시스템과 동일한 방식)
    function decodeAdminSessionToken(token: string) {
      try {
        const decoded = Buffer.from(token, 'base64url').toString();
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }

    const tokenData = decodeAdminSessionToken(adminSessionToken);
    if (!tokenData || !tokenData.userId || !tokenData.isAdmin) {
      return NextResponse.json(createUnauthorizedResponse('유효하지 않은 어드민 세션입니다.'), { status: 401 });
    }

    const currentUserId = tokenData.userId;
    
    // 보안 필드 수정 권한 검증
    const hasPermission = await canModifySecurityFields(currentUserId);
    if (!hasPermission) {
      return NextResponse.json(createUnauthorizedResponse(), { status: 403 });
    }

    const body = await request.json();
    
    const { id } = await params;
    
    // 보안 필드 변경 감지 및 로깅
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { points: true, referralCode: true }
    });

    // 변경사항 로깅
    if (currentUser) {
      if (currentUser.points !== body.points) {
        console.log(`🔒 보안 필드 변경 감지 - 포인트: ${currentUser.points} → ${body.points} (수정자: ${currentUserId})`);
      }
      if (currentUser.referralCode !== body.referralCode) {
        console.log(`🔒 보안 필드 변경 감지 - 추천인코드: ${currentUser.referralCode} → ${body.referralCode} (수정자: ${currentUserId})`);
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        points: body.points,
        referralCode: body.referralCode, // 추천인코드 (보안 필드)
        bankName: body.bankName,
        accountHolder: body.accountHolder,
        bankAccount: body.bankAccount,
        role: body.role, // 역할 업데이트
        // 입사일/가입일 업데이트 (joinDate가 있으면 createdAt 업데이트)
        ...(body.joinDate && { createdAt: new Date(body.joinDate) }),
      },
      select: { id: true },
    });

    // 변경 완료 로깅
    const { id: userId } = await params;
    console.log(`✅ 보안 필드 수정 완료 - 사용자: ${userId} (수정자: ${currentUserId})`);

    return NextResponse.json({ 
      success: true, 
      id: updated.id,
      message: '보안 필드가 성공적으로 수정되었습니다.',
      modifiedBy: currentUserId,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error('사용자 정보 수정 실패:', e);
    return NextResponse.json({ 
      error: 'Failed to update',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 어드민 세션 쿠키에서 토큰 가져오기 (모든 adminSession 쿠키 확인)
    const allCookies = request.cookies.getAll();
    const adminSessionCookies = allCookies.filter(cookie => 
      cookie.name.startsWith('adminSession_')
    );
    
    let adminSessionToken = null;
    if (adminSessionCookies.length > 0) {
      // 가장 최근 쿠키 사용 (보통 마지막에 설정된 것)
      adminSessionToken = adminSessionCookies[adminSessionCookies.length - 1].value;
    }
    
    if (!adminSessionToken) {
      return NextResponse.json({ error: '어드민 로그인이 필요합니다.' }, { status: 401 });
    }

    // 토큰 디코딩
    function decodeAdminSessionToken(token: string) {
      try {
        const decoded = Buffer.from(token, 'base64url').toString();
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }

    const tokenData = decodeAdminSessionToken(adminSessionToken);
    if (!tokenData || !tokenData.userId || !tokenData.isAdmin) {
      return NextResponse.json({ error: '유효하지 않은 어드민 세션입니다.' }, { status: 401 });
    }

    const { id } = await params;

    // 삭제할 사용자 정보 확인
    const userToDelete = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true
      }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 최고관리자는 삭제할 수 없음
    if (userToDelete.referralCode === 'SUPER_ADMIN') {
      return NextResponse.json({ error: '최고관리자는 삭제할 수 없습니다.' }, { status: 403 });
    }

    // 관리자만 삭제 가능 (일반 사용자는 삭제 불가)
    if (userToDelete.role !== 'ADMIN') {
      return NextResponse.json({ error: '관리자만 삭제할 수 있습니다.' }, { status: 403 });
    }

    // 사용자와 관련된 모든 데이터를 트랜잭션으로 삭제
    await prisma.$transaction(async (tx) => {
      // 1. 관련 데이터들 먼저 삭제
      await tx.activityLog.deleteMany({ where: { userId: id } });
      await tx.application.deleteMany({ where: { userId: id } });
      await tx.consultation.deleteMany({ where: { userId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.partnerApplication.deleteMany({ where: { userId: id } });
      await tx.payment.deleteMany({ where: { userId: id } });
      await tx.pointLedger.deleteMany({ where: { userId: id } });
      await tx.question.deleteMany({ where: { userId: id } });
      await tx.settlement.deleteMany({ where: { userId: id } });
      await tx.userLog.deleteMany({ where: { userId: id } });
      await tx.withdrawalRequest.deleteMany({ where: { userId: id } });

      // 2. 마지막으로 사용자 삭제
      await tx.user.delete({ where: { id } });
    });

    console.log(`관리자 삭제 완료: ${userToDelete.name} (${userToDelete.email})`);

    return NextResponse.json({ 
      success: true, 
      message: '관리자가 성공적으로 삭제되었습니다.',
      deletedUser: {
        name: userToDelete.name,
        email: userToDelete.email
      }
    });

  } catch (e) {
    console.error('관리자 삭제 오류:', e);
    return NextResponse.json({ 
      error: '관리자 삭제 중 오류가 발생했습니다.',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}
