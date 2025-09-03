import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkSuperAdmin() {
  try {
    console.log('🔍 슈퍼 어드민 계정 상태를 확인합니다...');
    
    // 슈퍼 어드민 계정 찾기
    const superAdmin = await prisma.user.findFirst({
      where: {
        email: 'psy777@naver.com'
      }
    });
    
    if (!superAdmin) {
      console.log('❌ 슈퍼 어드민 계정을 찾을 수 없습니다.');
      return;
    }
    
    console.log('✅ 슈퍼 어드민 계정 발견!');
    console.log(`👤 이름: ${superAdmin.name}`);
    console.log(`📧 이메일: ${superAdmin.email}`);
    console.log(`📱 전화번호: ${superAdmin.phone}`);
    console.log(`🛡️ 역할: ${superAdmin.role}`);
    console.log(`📊 상태: ${superAdmin.status}`);
    console.log(`✅ 활성화: ${superAdmin.isActive}`);
    console.log(`📅 생성일: ${superAdmin.createdAt}`);
    console.log(`🔄 수정일: ${superAdmin.updatedAt}`);
    
    // 비밀번호 테스트
    const testPassword = '87587200';
    const isPasswordValid = await bcrypt.compare(testPassword, superAdmin.passwordHash);
    
    console.log('\n🔐 비밀번호 테스트:');
    console.log(`- 테스트 비밀번호: ${testPassword}`);
    console.log(`- 비밀번호 유효성: ${isPasswordValid ? '✅ 유효' : '❌ 무효'}`);
    
    // 로그인 가능한 다른 계정들 확인
    console.log('\n📋 전체 사용자 계정:');
    const allUsers = await prisma.user.findMany({
      select: {
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    allUsers.forEach((user, index) => {
      const statusIcon = user.isActive ? '✅' : '❌';
      console.log(`${index + 1}. ${statusIcon} ${user.name} - ${user.email} (${user.role}) - ${user.status}`);
    });
    
    // 로그인 테스트를 위한 정보
    console.log('\n🔑 로그인 테스트 정보:');
    console.log('아이디: 66678282');
    console.log('비밀번호: 87587200');
    console.log('이메일: psy777@naver.com');
    
  } catch (error) {
    console.error('❌ 슈퍼 어드민 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSuperAdmin();








