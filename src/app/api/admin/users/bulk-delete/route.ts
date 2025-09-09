import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(request: NextRequest) {
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

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids 배열이 필요합니다.' }, { status: 400 });
    }

    // 삭제할 사용자들 확인
    const usersToDelete = await prisma.user.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        referralCode: true
      }
    });

    // 최고관리자 체크 (referralCode가 'SUPER_ADMIN'인 경우)
    const superAdmins = usersToDelete.filter(user => user.referralCode === 'SUPER_ADMIN');
    if (superAdmins.length > 0) {
      return NextResponse.json({ 
        error: '최고관리자는 삭제할 수 없습니다.',
        superAdmins: superAdmins.map(u => u.name)
      }, { status: 403 });
    }

    // 일반회원과 파트너회원만 삭제 가능
    const allowedRoles = ['GENERAL', 'MEMBER'];
    const notAllowedUsers = usersToDelete.filter(user => !allowedRoles.includes(user.role || ''));
    if (notAllowedUsers.length > 0) {
      return NextResponse.json({ 
        error: '일반회원과 파트너회원만 삭제할 수 있습니다.',
        notAllowed: notAllowedUsers.map(u => `${u.name} (${u.role})`)
      }, { status: 403 });
    }

    // 사용자와 관련된 모든 데이터를 트랜잭션으로 삭제
    const result = await prisma.$transaction(async (tx) => {
      // 1. 관련 데이터들 먼저 삭제
      await tx.activityLog.deleteMany({ where: { userId: { in: ids } } });
      await tx.application.deleteMany({ where: { userId: { in: ids } } });
      await tx.consultation.deleteMany({ where: { userId: { in: ids } } });
      await tx.notification.deleteMany({ where: { userId: { in: ids } } });
      await tx.partnerApplication.deleteMany({ where: { userId: { in: ids } } });
      await tx.payment.deleteMany({ where: { userId: { in: ids } } });
      await tx.pointLedger.deleteMany({ where: { userId: { in: ids } } });
      await tx.question.deleteMany({ where: { userId: { in: ids } } });
      await tx.settlement.deleteMany({ where: { userId: { in: ids } } });
      await tx.userLog.deleteMany({ where: { userId: { in: ids } } });
      await tx.withdrawalRequest.deleteMany({ where: { userId: { in: ids } } });

      // 2. 마지막으로 사용자 삭제
      return await tx.user.deleteMany({ 
        where: { 
          id: { in: ids },
          role: { in: ['GENERAL', 'MEMBER'] }, // 일반회원과 파트너회원만
          referralCode: { not: 'SUPER_ADMIN' } // 최고관리자 제외
        } 
      });
    });

    console.log(`회원 일괄 삭제 완료: ${result.count}명`);

    return NextResponse.json({ 
      success: true, 
      deleted: result.count,
      message: `${result.count}명의 회원이 삭제되었습니다.`
    });
  } catch (e) {
    console.error('회원 일괄 삭제 오류:', e);
    return NextResponse.json({ 
      error: '삭제 중 오류가 발생했습니다.',
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}

