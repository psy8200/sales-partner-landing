import { PrismaClient } from '@prisma/client'

// 글로벌 타입 정의
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Prisma 클라이언트 생성 함수
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    errorFormat: 'pretty',
  })

  // 연결 테스트
  client.$connect()
    .then(() => {
      console.log('✅ Prisma Client 연결 성공')
    })
    .catch((error) => {
      console.error('❌ Prisma Client 연결 실패:', error)
    })

  return client
}

// 싱글톤 패턴으로 Prisma 클라이언트 관리
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// 개발 환경에서만 글로벌에 저장
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// 연결 해제 함수
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// 스키마 동기화 확인 함수
export async function validatePrismaSchema() {
  try {
    // User 모델의 referralCode 필드 존재 확인
    await prisma.user.findFirst({
      select: {
        id: true,
        referralCode: true,
      },
    })
    console.log('✅ Prisma 스키마 검증 성공 - referralCode 필드 확인됨')
    return true
  } catch (error) {
    console.error('❌ Prisma 스키마 검증 실패:', error)
    return false
  }
}

// 안전한 Prisma 쿼리 래퍼
export async function safePrismaQuery<T>(
  queryFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await queryFn()
  } catch (error) {
    console.error('Prisma 쿼리 오류:', error)
    
    // 스키마 동기화 문제인 경우 재생성 시도
    if (error instanceof Error && error.message.includes('Unknown field')) {
      console.log('🔄 스키마 동기화 문제 감지, Prisma 클라이언트 재생성 시도...')
      try {
        await prisma.$disconnect()
        // 여기서는 수동으로 재생성할 수 없으므로 에러를 던짐
        throw new Error('스키마 동기화 문제가 발생했습니다. 서버를 재시작해주세요.')
      } catch (regenError) {
        console.error('Prisma 클라이언트 재생성 실패:', regenError)
      }
    }
    
    if (fallback !== undefined) {
      return fallback
    }
    throw error
  }
}






