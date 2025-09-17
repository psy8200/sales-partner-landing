const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createNewSession() {
  try {
    console.log('🔍 새로운 관리자 세션 생성...');

    // 현재 SUPER_ADMIN 관리자 정보
    const admin = await prisma.admin.findFirst({
      where: { role: 'SUPER_ADMIN' },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!admin) {
      console.log('❌ SUPER_ADMIN 권한을 가진 관리자가 없습니다.');
      return;
    }

    console.log('📋 관리자 정보:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   이름: ${admin.name}`);
    console.log(`   이메일: ${admin.email}`);
    console.log(`   권한: ${admin.role}`);

    // 새로운 세션 토큰 생성
    const sessionData = {
      userId: admin.id,
      role: admin.role,
      isAdmin: true,
      sessionId: `admin_session_${admin.id}_${Date.now()}`,
      iat: Date.now()
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64url');
    
    console.log('\n🔑 새로운 세션 토큰:');
    console.log(`   토큰: ${sessionToken}`);
    
    // 쿠키 이름 생성
    const cookieName = `adminSession_${admin.id}`;
    const authTokenName = `adminAuthToken_${admin.id}`;
    
    console.log('\n🍪 쿠키 정보:');
    console.log(`   세션 쿠키 이름: ${cookieName}`);
    console.log(`   인증 토큰 쿠키 이름: ${authTokenName}`);
    console.log(`   세션 토큰 값: ${sessionToken}`);
    console.log(`   인증 토큰 값: ${admin.id}`);

    console.log('\n📋 브라우저에서 설정할 쿠키:');
    console.log(`   ${cookieName}=${sessionToken}`);
    console.log(`   ${authTokenName}=${admin.id}`);

  } catch (error) {
    console.error('❌ 세션 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createNewSession();





