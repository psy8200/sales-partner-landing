/**
 * 숫자를 한국어 형식으로 포맷팅합니다.
 * @param value - 포맷팅할 숫자
 * @returns 포맷팅된 문자열
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 * @param date - 포맷팅할 날짜
 * @returns 포맷팅된 문자열
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ko-KR');
}

/**
 * 통화를 한국어 형식으로 포맷팅합니다.
 * @param value - 포맷팅할 금액
 * @param currency - 통화 코드 (기본값: 'KRW')
 * @returns 포맷팅된 문자열
 */
export function formatCurrency(value: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: currency,
  }).format(value);
}




