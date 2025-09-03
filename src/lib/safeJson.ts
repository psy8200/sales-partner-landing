/**
 * 안전한 JSON 파싱 유틸리티
 * API 응답이 JSON이 아닐 때 발생하는 파싱 오류를 방지합니다.
 */

export interface SafeJsonResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  isJson: boolean;
}

/**
 * Response 객체를 안전하게 JSON으로 파싱합니다.
 */
export async function safeJsonParse<T = unknown>(response: Response): Promise<SafeJsonResult<T>> {
  try {
    // Content-Type 확인
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json') ?? false;
    
    if (!isJson) {
      // JSON이 아닌 경우 텍스트로 읽어서 오류 정보 제공
      const text = await response.text();
      return {
        success: false,
        error: `응답이 JSON 형식이 아닙니다. Content-Type: ${contentType}, Body: ${text.substring(0, 200)}...`,
        isJson: false
      };
    }
    
    const data = await response.json() as T;
    return {
      success: true,
      data,
      isJson: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 JSON 파싱 오류';
    
    // 응답 텍스트를 다시 읽으려고 시도 (이미 소비된 경우 실패할 수 있음)
    let responseText = '';
    try {
      if (!response.bodyUsed) {
        responseText = await response.text();
      }
    } catch {
      responseText = '[응답 본문을 읽을 수 없음]';
    }
    
    return {
      success: false,
      error: `JSON 파싱 실패: ${errorMessage}. 응답: ${responseText.substring(0, 200)}...`,
      isJson: false
    };
  }
}

/**
 * 문자열을 안전하게 JSON으로 파싱합니다.
 */
export function safeJsonParseString<T = unknown>(jsonString: string): SafeJsonResult<T> {
  try {
    const data = JSON.parse(jsonString) as T;
    return {
      success: true,
      data,
      isJson: true
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 JSON 파싱 오류';
    return {
      success: false,
      error: `JSON 파싱 실패: ${errorMessage}. 입력: ${jsonString.substring(0, 200)}...`,
      isJson: false
    };
  }
}

/**
 * API 응답을 안전하게 처리하는 래퍼 함수
 */
export async function safeFetch<T = unknown>(
  input: RequestInfo | URL, 
  init?: RequestInit
): Promise<SafeJsonResult<T> & { response: Response }> {
  try {
    const response = await fetch(input, init);
    const result = await safeJsonParse<T>(response);
    
    return {
      ...result,
      response
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 네트워크 오류';
    
    // 더미 Response 객체 생성
    const dummyResponse = new Response(null, { status: 0, statusText: 'Network Error' });
    
    return {
      success: false,
      error: `네트워크 오류: ${errorMessage}`,
      isJson: false,
      response: dummyResponse
    };
  }
}






