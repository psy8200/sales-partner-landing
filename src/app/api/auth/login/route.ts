import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// 매우 단순한 세션 토큰 생성 (개발용): base64(JSON)
function createSessionToken(payload: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

export async function POST(request: NextRequest) {
  try {
    const { id, email, password } = await request.json();

    // 1) 마스터 계정 강제 로그인 (id 기반)
    if ((id === 'psy' || id === 'psy777') && password === '0130') {
      const isAdmin = id === 'psy';
      const masterEmail = isAdmin ? 'psy@local' : 'psy777@local';
      const masterName = isAdmin ? 'Master Admin psy' : 'Master Member psy777';

      // 계정이 없으면 생성/있으면 유지
      const user = await prisma.user.upsert({
        where: { email: masterEmail },
        update: {
          role: isAdmin ? 'ADMIN' : 'MEMBER',
          status: 'ACTIVE',
          isActive: true,
          name: masterName,
        },
        create: {
          email: masterEmail,
          phone: isAdmin ? '010-0000-0130' : '010-7777-0130',
          name: masterName,
          passwordHash: await bcrypt.hash('0130', 12),
          role: isAdmin ? 'ADMIN' : 'MEMBER',
          status: 'ACTIVE',
          isActive: true,
          marketingAgreed: false,
        },
        select: { id: true, name: true, email: true, role: true },
      });

      const token = createSessionToken({
        userId: user.id,
        role: user.role,
        isMaster: true,
        iat: Date.now(),
      });

      const res = NextResponse.json({ success: true, user, masterBypass: true });
      // 개발 중 세션 장기 유지 (90일)
      const NINETY_DAYS = 60 * 60 * 24 * 90;
      res.cookies.set('session', token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: NINETY_DAYS,
        expires: new Date(Date.now() + NINETY_DAYS * 1000),
      });
      // 마스터 계정도 authToken 설정
      res.cookies.set('authToken', user.id, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: NINETY_DAYS,
        expires: new Date(Date.now() + NINETY_DAYS * 1000),
      });
      return res;
    }

    // 2) 일반 로그인 (email + password or phone 8-digit id)
    let loginEmail = email || id;

    // 아이디가 8자리 숫자면 전화번호 8자리로 간주하여 사용자 조회
    if (!email && id && /^[0-9]{8}$/.test(id)) {
      console.log('전화번호 로그인 시도:', { id });
      
      // DB에는 전화번호가 하이픈 포함 형식(예: 010-1234-5678)으로 저장되어 있음
      // 따라서 "12345678" 입력 시 "1234-5678" 형태의 suffix로 매칭
      const hyphenSuffix = `${id.slice(0, 4)}-${id.slice(4)}`;
      
      // 먼저 전체 전화번호로 검색 (하이픈 없이 저장된 경우)
      let userByPhone = await prisma.user.findFirst({
        where: {
          phone: id
        },
      });
      
      // 전체 전화번호로 찾지 못한 경우 suffix로 검색
      if (!userByPhone) {
        userByPhone = await prisma.user.findFirst({
          where: {
            phone: { endsWith: hyphenSuffix }
          },
        });
      }
      
      // 여전히 찾지 못한 경우, 전화번호에서 하이픈을 제거한 후 비교
      if (!userByPhone) {
        const allUsers = await prisma.user.findMany({
          select: { id: true, email: true, phone: true }
        });
        
        userByPhone = allUsers.find(user => {
          const cleanPhone = user.phone.replace(/[^0-9]/g, '');
          return cleanPhone.endsWith(id);
        }) as any || null;
      }
      
      console.log('전화번호 검색 결과:', { 
        searchedId: id, 
        hyphenSuffix, 
        foundUser: userByPhone ? { id: userByPhone.id, email: userByPhone.email, phone: userByPhone.phone } : null 
      });
      
      if (!userByPhone) {
        return NextResponse.json({ error: '전화번호 8자리로 등록된 계정을 찾을 수 없습니다.' }, { status: 404 });
      }
      loginEmail = userByPhone.email;
    }

    if (!loginEmail || !password) {
      return NextResponse.json({ error: '아이디(전화번호 8자리 또는 이메일)와 비밀번호가 필요합니다.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: loginEmail } });
    if (!user) {
      return NextResponse.json({ error: '존재하지 않는 계정입니다.' }, { status: 404 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 상태 체크 (마스터 외에는 적용)
    if (user.status !== 'ACTIVE' || !user.isActive) {
      return NextResponse.json({ error: '활성화되지 않은 계정입니다.' }, { status: 403 });
    }

    const token = createSessionToken({ userId: user.id, role: user.role, iat: Date.now() });
    const res = NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    // 개발 중 세션 장기 유지 (90일)
    const NINETY_DAYS = 60 * 60 * 24 * 90;
    res.cookies.set('session', token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });
    // 테스트/요약 API에서 사용하는 사용자 ID 쿠키도 동일 기간 유지
    res.cookies.set('authToken', user.id, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ error: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
