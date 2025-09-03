import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserLevelInfo } from '@/lib/levelCalculator';

export const runtime = 'nodejs';

// 세션 토큰 디코딩 함수
function decodeSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // session 쿠키에서 토큰 가져오기
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 토큰 디코딩
    const tokenData = decodeSessionToken(sessionToken);
    if (!tokenData || !tokenData.userId) {
      return NextResponse.json(
        { error: '유효하지 않은 세션입니다.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: tokenData.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        partnerStatus: true,
        points: true,
        level: true,
        bankName: true,
        bankAccount: true,
        accountHolder: true,
        settlementCycle: true,
        createdAt: true,
        status: true,
        isActive: true,
      },
    });

    // 사용자의 결정포인트 계산 (Contract 테이블의 finalPoints 합계)
    const contracts = await prisma.contract.findMany({
      where: {
        customerName: user?.name
      },
      select: {
        finalPoints: true
      }
    });

    const totalFinalPoints = contracts.reduce((sum, contract) => sum + (contract.finalPoints || 0), 0);

    // 사용자의 추천인 수 계산 (실제 데이터 기반)
    const totalReferrals = await prisma.user.count({
      where: {
        referralCode: user?.name // 추천인 코드로 연결된 사용자 수
      }
    });

    // 이번 달 추천인 수 계산
    const monthlyReferrals = await prisma.user.count({
      where: {
        referralCode: user?.name,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) // 이번 달 1일부터
        }
      }
    });

    // 등급 정보 계산
    const levelInfo = getUserLevelInfo(totalReferrals);



    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 계정 상태 확인
    if (user.status !== 'ACTIVE' || !user.isActive) {
      return NextResponse.json(
        { error: '활성화되지 않은 계정입니다.' },
        { status: 403 }
      );
    }

    // 세션 자동 연장 (개발 중 편의를 위해)
    const NINETY_DAYS = 60 * 60 * 24 * 90;
    const newToken = Buffer.from(JSON.stringify({
      userId: user.id,
      role: user.role,
      iat: Date.now()
    })).toString('base64url');

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        partnerStatus: user.partnerStatus,
        points: user.points,
        level: user.level,
        bankName: user.bankName,
        bankAccount: user.bankAccount,
        accountHolder: user.accountHolder,
        settlementCycle: user.settlementCycle,
        createdAt: user.createdAt,
        status: user.status,
        isActive: user.isActive,
        finalPoints: totalFinalPoints, // 결정포인트값 추가
        
        // 등급 관련 정보 (실제 데이터 기반)
        totalReferrals: totalReferrals,
        monthlyReferrals: monthlyReferrals,
        currentLevel: levelInfo.currentLevel,
        levelName: levelInfo.levelName,
        levelIcon: levelInfo.levelIcon,
        nextLevelRequirement: levelInfo.nextLevelRequirement,
        remainingReferrals: levelInfo.remainingReferrals,
        isMaxLevel: levelInfo.isMaxLevel
      },
    });

    // 세션 쿠키 자동 연장
    response.cookies.set('session', newToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    // authToken 쿠키도 동일하게 연장
    response.cookies.set('authToken', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    return response;
  } catch {
    console.error('사용자 정보를 불러오지 못했습니다.');
    return NextResponse.json(
      { error: '사용자 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
