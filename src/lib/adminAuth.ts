import { prisma } from './db';

/**
 * 최고등급 어드민 권한 검증
 * @param userId 검증할 사용자 ID
 * @returns 최고등급 어드민 여부
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
        level: true,
        status: true
      }
    });

    if (!user) return false;

    // 최고등급 어드민 조건:
    // 1. 역할이 ADMIN
    // 2. 레벨이 10 (최고레벨)
    // 3. 상태가 ACTIVE
    return (
      user.role === 'ADMIN' && 
      user.level === 10 && 
      user.status === 'ACTIVE'
    );
  } catch (error) {
    console.error('최고등급 어드민 권한 검증 실패:', error);
    return false;
  }
}

/**
 * 보안 필드 수정 권한 검증
 * @param userId 검증할 사용자 ID
 * @returns 보안 필드 수정 권한 여부
 */
export async function canModifySecurityFields(userId?: string): Promise<boolean> {
  // 개발 중 임시로 모든 요청 허용
  console.log('🔓 개발 모드: 권한 검증 우회 - 모든 요청 허용');
  return true;
}

/**
 * 권한 검증 실패 시 에러 응답 생성
 */
export function createUnauthorizedResponse(message: string = '권한이 없습니다. 최고등급 어드민만 수정할 수 있습니다.') {
  return {
    error: 'UNAUTHORIZED',
    message,
    requiredRole: 'SUPER_ADMIN',
    requiredLevel: 10
  };
}
