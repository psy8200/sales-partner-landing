/**
 * 안전한 React key 생성을 위한 유틸리티 함수
 * 빈 문자열이나 중복 키를 방지하여 React 렌더링 오류를 해결합니다.
 */

// 키 후보를 가질 수 있는 객체 타입
interface KeyCandidate {
  id?: string | number;
  uuid?: string;
  value?: string | number;
  code?: string;
  name?: string;
  key?: string;
  [key: string]: unknown;
}

export function safeKey(
  obj: KeyCandidate,
  idx: number,
  prefix = 'k'
): string {
  // 우선순위: id > uuid > value > code > name > key > 인덱스
  const candidates = [
    obj?.id,
    obj?.uuid,
    obj?.value,
    obj?.code,
    obj?.name,
    obj?.key
  ];
  
  const candidate = candidates.find(c => c !== undefined && c !== null && c !== '');
  const s = String(candidate ?? '').trim();
  
  // 유효한 값이 있으면 prefix와 함께 반환, 없으면 인덱스 사용
  return s ? `${prefix}-${s}` : `${prefix}-${idx}`;
}

/**
 * 중복 키 탐지 함수 (개발 중 디버깅용)
 */
export function assertUniqueKeys<T>(
  items: T[], 
  keyGenerator: (item: T, index: number) => string, 
  location: string
): void {
  const seen = new Set<string>();
  const duplicates: Array<{key: string, item: T, index: number}> = [];
  
  items.forEach((item, index) => {
    const key = keyGenerator(item, index);
    if (seen.has(key)) {
      duplicates.push({ key, item, index });
    }
    seen.add(key);
  });
  
  if (duplicates.length > 0) {
    console.warn(`[DUPLICATE KEYS DETECTED] in ${location}:`, duplicates);
  }
}

/**
 * 배열 렌더링을 위한 안전한 키 생성 헬퍼
 */
export function createSafeKeyGenerator(prefix: string) {
  return (obj: KeyCandidate, idx: number) => safeKey(obj, idx, prefix);
}
