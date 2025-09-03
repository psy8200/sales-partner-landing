import { NextRequest } from 'next/server';

/**
 * 요청에서 인증 토큰을 가져오는 함수
 */
export async function getAuthToken(request: NextRequest): Promise<string | null> {
  try {
    // 쿠키에서 authToken 가져오기
    const authToken = request.cookies.get('authToken')?.value;
    
    if (!authToken) {
      return null;
    }

    // 토큰 유효성 검증 (필요시 추가)
    return authToken;
  } catch (error) {
    console.error('인증 토큰 가져오기 실패:', error);
    return null;
  }
}
