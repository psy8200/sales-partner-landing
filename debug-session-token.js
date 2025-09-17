const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 세션 토큰 디코딩 함수 (API와 동일)
function decodeAdminSessionToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

async function debugSessionToken() {
  try {
    console.log('🔍 세션 토큰 디버깅...');

    // 현재 Admin 테이블의 관리자 정보
    const admin = await prisma.admin.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!admin) {
      console.log('❌ SUPER_ADMIN 권한을 가진 관리자가 없습니다.');
      return;
    }

    console.log('📋 현재 SUPER_ADMIN 정보:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   이름: ${admin.name}`);
    console.log(`   이메일: ${admin.email}`);
    console.log(`   권한: ${admin.role}`);

    // 세션 토큰 생성 (API와 동일한 방식)
    const sessionData = {
      userId: admin.id,
      role: admin.role,
      isAdmin: true,
      sessionId: `admin_session_${admin.id}_${Date.now()}`,
      iat: Date.now()
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
    
    console.log('\n🔑 생성된 세션 토큰:');
    console.log(`   토큰: ${sessionToken}`);
    
    // 토큰 디코딩 테스트
    const decodedToken = decodeAdminSessionToken(sessionToken);
    console.log('\n🔍 디코딩된 토큰:');
    console.log(`   userId: ${decodedToken?.userId}`);
    console.log(`   role: ${decodedToken?.role}`);
    console.log(`   isAdmin: ${decodedToken?.isAdmin}`);
    console.log(`   sessionId: ${decodedToken?.sessionId}`);

    // Admin 테이블에서 권한 확인 테스트
    if (decodedToken?.userId) {
      const currentAdmin = await prisma.admin.findUnique({
        where: { id: decodedToken.userId },
        select: { role: true }
      });

      console.log('\n🔍 Admin 테이블 권한 확인:');
      console.log(`   찾은 관리자: ${currentAdmin ? '있음' : '없음'}`);
      console.log(`   권한: ${currentAdmin?.role}`);
      console.log(`   SUPER_ADMIN 권한 여부: ${currentAdmin?.role === 'SUPER_ADMIN' ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ 세션 토큰 디버깅 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugSessionToken();





