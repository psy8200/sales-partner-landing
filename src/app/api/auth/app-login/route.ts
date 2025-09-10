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
    
    // 전화번호 8자리 추출 (뒤 8자리)
    let phoneSuffix = '';
    if (phone.length === 8 && /^[0-9]{8}$/.test(phone)) {
      phoneSuffix = phone;
    } else {
      // 하이픈 제거 후 뒤 8자리 추출
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 8) {
        return NextResponse.json({ error: '전화번호는 최소 8자리 이상이어야 합니다.' }, { status: 400 });
      }
      phoneSuffix = cleanPhone.slice(-8);
    }
    
    console.log('📱 [앱 로그인] 입력된 전화번호:', phone);
    console.log('📱 [앱 로그인] 추출된 8자리:', phoneSuffix);
    
    // 비밀번호 길이 검증 (6자리 이상)
    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자리 이상 입력해주세요.' }, { status: 400 });
    }

    // 전화번호로 사용자 조회 (뒤 8자리로 매칭)
    console.log('📱 [앱 로그인] 데이터베이스에서 사용자 조회 중...');
    
    // 모든 사용자 조회 후 뒤 8자리로 매칭
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, phone: true, passwordHash: true, role: true, status: true, isActive: true }
    });
    
    // 뒤 8자리로 매칭되는 사용자 찾기
    const user = allUsers.find(u => {
      const cleanPhone = u.phone.replace(/[^0-9]/g, '');
      return cleanPhone.endsWith(phoneSuffix);
    }) as unknown as typeof user || null;
    
    console.log('📱 [앱 로그인] 사용자 조회 결과:', user ? '사용자 발견' : '사용자 없음');

    if (!user) {
      console.log('📱 [앱 로그인] 사용자를 찾을 수 없음:', { phone, phoneSuffix });
      return NextResponse.json({ error: '전화번호 8자리로 등록된 계정을 찾을 수 없습니다.' }, { status: 404 });
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

    // 로그인 성공 - 앱 전용 세션 토큰 생성
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      platform: 'app', // 앱 플랫폼 식별
      iat: Date.now()
    })).toString('base64url');

    const res = NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        phone: user.phone, 
        role: user.role,
        platform: 'app'
      } 
    });

    // 앱 전용 세션 쿠키 설정 (90일, /app 경로)
    const NINETY_DAYS = 60 * 60 * 24 * 90;
    res.cookies.set('appSession', sessionToken, {
      httpOnly: true,
      path: '/app', // 앱 전용 경로
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    // 앱 전용 사용자 ID 쿠키도 설정
    res.cookies.set('appAuthToken', user.id, {
      httpOnly: true,
      path: '/app', // 앱 전용 경로
      sameSite: 'lax',
      maxAge: NINETY_DAYS,
      expires: new Date(Date.now() + NINETY_DAYS * 1000),
    });

    console.log('📱 [앱 로그인] 로그인 성공:', { userId: user.id, platform: 'app' });

    return res;

  } catch (error) {
    console.error('📱 [앱 로그인] 오류:', error);
    return NextResponse.json({ error: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
  }
}



