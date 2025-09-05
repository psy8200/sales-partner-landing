import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json().catch(() => ({}));
    
    // 입력값 검증
    if (!phone || !password) {
      return NextResponse.json({ error: '전화번호와 비밀번호를 입력해주세요.' }, { status: 400 });
    }
    
    // 전화번호 형식 검증 (8자리 숫자)
    if (!/^[0-9]{8}$/.test(phone)) {
      return NextResponse.json({ error: '전화번호는 8자리 숫자로 입력해주세요.' }, { status: 400 });
    }
    
    // 비밀번호 길이 검증 (6자리 이상)
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자리 이상 입력해주세요.' }, { status: 400 });
    }

    // 전화번호로 사용자 조회
    let user = await prisma.user.findFirst({
      where: {
        phone: phone
      }
    });

    // 전체 전화번호로 찾지 못한 경우 suffix로 검색
    if (!user) {
      const hyphenSuffix = `${phone.slice(0, 4)}-${phone.slice(4)}`;
      user = await prisma.user.findFirst({
        where: {
          phone: { endsWith: hyphenSuffix }
        }
      });
    }

    // 여전히 찾지 못한 경우, 전화번호에서 하이픈을 제거한 후 비교
    if (!user) {
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, phone: true, passwordHash: true, role: true, status: true, isActive: true }
      });
      
      user = allUsers.find(u => {
        const cleanPhone = u.phone.replace(/[^0-9]/g, '');
        return cleanPhone.endsWith(phone);
      }) as unknown as typeof user || null;
    }

    if (!user) {
      return NextResponse.json({ error: '등록되지 않은 전화번호입니다.' }, { status: 404 });
    }

    // 비밀번호 검증
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 계정 상태 확인
    if (user.status !== 'ACTIVE' || !user.isActive) {
      return NextResponse.json({ error: '활성화되지 않은 계정입니다.' }, { status: 403 });
    }

    // 로그인 성공 - 세션 토큰 생성
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      iat: Date.now()
    })).toString('base64url');

    const res = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        phone: user.phone, 
        role: user.role 
      } 
    });

    // 세션 쿠키 설정 (90일)
    const NINETY_DAYS = 60 * 60 * 24 * 90;
    res.cookies.set('session', sessionToken, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    // 사용자 ID 쿠키도 설정
    res.cookies.set('authToken', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    return res;

  } catch (error) {
    console.error('Member login error:', error);
    return NextResponse.json({ error: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

