import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: '어드민 로그아웃 완료'
    });

    // 어드민 전용 쿠키 삭제 (전체 도메인에서 접근 가능)
    response.cookies.delete('adminSession');
    response.cookies.delete('adminAuthToken');

    return response;
  } catch (error) {
    console.error('어드민 로그아웃 오류:', error);
    return NextResponse.json(
      { error: '어드민 로그아웃에 실패했습니다.' },
      { status: 500 }
    );
  }
}
