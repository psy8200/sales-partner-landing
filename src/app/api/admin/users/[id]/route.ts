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
    // 어드민 세션 쿠키에서 토큰 가져오기
    const adminSessionToken = request.cookies.get('adminSession')?.value;
    
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
        partnerStatus: body.partnerStatus, // 파트너 상태 업데이트
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
