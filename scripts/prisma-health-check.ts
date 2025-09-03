#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

/**
 * Prisma 클라이언트 상태 확인 및 자동 복구 스크립트
 */

async function checkPrismaHealth() {
  console.log('🔍 Prisma 클라이언트 상태 확인 중...');
  
  try {
    // Prisma 클라이언트 생성 시도
    const prisma = new PrismaClient({
      log: ['error'],
    });

    // 연결 테스트
    await prisma.$connect();
    console.log('✅ Prisma 클라이언트 연결 성공');

    // 스키마 검증 - referralCode 필드 확인
    try {
      const user = await prisma.user.findFirst({
        select: {
          id: true,
          referralCode: true,
        },
      });
      console.log('✅ referralCode 필드 확인 성공');
    } catch (schemaError) {
      console.error('❌ 스키마 검증 실패:', schemaError);
      throw new Error('스키마 동기화 문제');
    }

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('❌ Prisma 클라이언트 상태 확인 실패:', error);
    return false;
  }
}

async function regeneratePrismaClient() {
  console.log('🔄 Prisma 클라이언트 재생성 중...');
  
  try {
    // 기존 클라이언트 삭제
    const prismaPath = join(process.cwd(), 'node_modules', '.prisma');
    if (existsSync(prismaPath)) {
      rmSync(prismaPath, { recursive: true, force: true });
      console.log('🗑️ 기존 Prisma 클라이언트 삭제 완료');
    }

    // 새 클라이언트 생성
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma 클라이언트 재생성 완료');
    
    return true;
  } catch (error) {
    console.error('❌ Prisma 클라이언트 재생성 실패:', error);
    return false;
  }
}

async function syncDatabase() {
  console.log('🔄 데이터베이스 스키마 동기화 중...');
  
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ 데이터베이스 스키마 동기화 완료');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 스키마 동기화 실패:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Prisma 클라이언트 상태 확인 및 복구 시작\n');

  // 1단계: 현재 상태 확인
  const isHealthy = await checkPrismaHealth();
  
  if (isHealthy) {
    console.log('\n✅ Prisma 클라이언트가 정상 상태입니다.');
    return;
  }

  console.log('\n⚠️ Prisma 클라이언트에 문제가 발견되었습니다. 복구를 시작합니다...\n');

  // 2단계: Node.js 프로세스 종료
  try {
    console.log('🛑 Node.js 프로세스 종료 중...');
    execSync('taskkill /f /im node.exe', { stdio: 'ignore' });
    console.log('✅ Node.js 프로세스 종료 완료');
  } catch (error) {
    console.log('ℹ️ 실행 중인 Node.js 프로세스가 없습니다.');
  }

  // 3단계: Next.js 캐시 삭제
  try {
    const nextPath = join(process.cwd(), '.next');
    if (existsSync(nextPath)) {
      rmSync(nextPath, { recursive: true, force: true });
      console.log('🗑️ Next.js 캐시 삭제 완료');
    }
  } catch (error) {
    console.log('ℹ️ Next.js 캐시가 없습니다.');
  }

  // 4단계: 데이터베이스 동기화
  const syncSuccess = await syncDatabase();
  if (!syncSuccess) {
    console.error('❌ 데이터베이스 동기화 실패');
    process.exit(1);
  }

  // 5단계: Prisma 클라이언트 재생성
  const regenerateSuccess = await regeneratePrismaClient();
  if (!regenerateSuccess) {
    console.error('❌ Prisma 클라이언트 재생성 실패');
    process.exit(1);
  }

  // 6단계: 최종 상태 확인
  console.log('\n🔍 최종 상태 확인 중...');
  const finalCheck = await checkPrismaHealth();
  
  if (finalCheck) {
    console.log('\n✅ Prisma 클라이언트 복구 완료!');
    console.log('\n📝 다음 명령어로 개발 서버를 시작하세요:');
    console.log('   npm run dev');
  } else {
    console.error('\n❌ Prisma 클라이언트 복구 실패');
    console.log('\n📝 수동으로 다음 명령어를 실행해보세요:');
    console.log('   npm run prisma:reset');
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 스크립트 실행 실패:', error);
    process.exit(1);
  });
}
