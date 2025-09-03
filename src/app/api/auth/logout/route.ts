import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // 세션/테스트 쿠키 삭제
    const response = NextResponse.json({ success: true, message: '로그아웃되었습니다.' });

    response.cookies.set('session', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0), // 즉시 만료
      sameSite: 'lax',
    });

    response.cookies.set('authToken', '', {
      httpOnly: true,
      path: '/',
      expires: new Date(0),
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
