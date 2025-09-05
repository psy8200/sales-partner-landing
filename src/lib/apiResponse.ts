import { NextResponse } from 'next/server';

/**
 * 한글 인코딩 문제를 해결하기 위한 API 응답 유틸리티
 * 모든 API 응답에 자동으로 Content-Type: application/json; charset=utf-8 헤더를 추가
 */

interface ApiResponseData {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

/**
 * 성공 응답을 생성합니다
 * @param data 응답 데이터
 * @param message 성공 메시지
 * @param status HTTP 상태 코드 (기본값: 200)
 */
export function createSuccessResponse(
  data?: any,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponseData = {
    success: true,
    ...(data && { data }),
    ...(message && { message })
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

/**
 * 에러 응답을 생성합니다
 * @param error 에러 메시지
 * @param status HTTP 상태 코드 (기본값: 500)
 */
export function createErrorResponse(
  error: string,
  status: number = 500
): NextResponse {
  const response: ApiResponseData = {
    success: false,
    error
  };

  return NextResponse.json(response, {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}

/**
 * 404 Not Found 응답을 생성합니다
 * @param message 에러 메시지 (기본값: '리소스를 찾을 수 없습니다.')
 */
export function createNotFoundResponse(
  message: string = '리소스를 찾을 수 없습니다.'
): NextResponse {
  return createErrorResponse(message, 404);
}

/**
 * 400 Bad Request 응답을 생성합니다
 * @param message 에러 메시지 (기본값: '잘못된 요청입니다.')
 */
export function createBadRequestResponse(
  message: string = '잘못된 요청입니다.'
): NextResponse {
  return createErrorResponse(message, 400);
}

/**
 * 401 Unauthorized 응답을 생성합니다
 * @param message 에러 메시지 (기본값: '인증이 필요합니다.')
 */
export function createUnauthorizedResponse(
  message: string = '인증이 필요합니다.'
): NextResponse {
  return createErrorResponse(message, 401);
}

/**
 * 403 Forbidden 응답을 생성합니다
 * @param message 에러 메시지 (기본값: '접근 권한이 없습니다.')
 */
export function createForbiddenResponse(
  message: string = '접근 권한이 없습니다.'
): NextResponse {
  return createErrorResponse(message, 403);
}

/**
 * 기존 NextResponse.json을 래핑하여 Content-Type 헤더를 추가합니다
 * @param data 응답 데이터
 * @param init 응답 옵션
 */
export function createJsonResponse(
  data: any,
  init?: ResponseInit
): NextResponse {
  return NextResponse.json(data, {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...init?.headers
    }
  });
}
