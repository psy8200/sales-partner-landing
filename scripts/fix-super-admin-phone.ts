import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSuperAdminPhone() {
  try {
    console.log('🔧 슈퍼 어드민 계정 전화번호를 설정합니다...');
    
    // 기존 슈퍼 어드민 계정 찾기
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: 'psy777@naver.com'
      }
    });
    
    if (!existingSuperAdmin) {
      console.log('❌ 슈퍼 어드민 계정을 찾을 수 없습니다.');
      return;
    }
    
    // 전화번호를 66678282로 설정 (8자리 아이디로 로그인 가능하도록)
    const updatedSuperAdmin = await prisma.user.update({
      where: {
        id: existingSuperAdmin.id
      },
      data: {
        phone: '66678282'
      }
    });
    
    console.log('✅ 슈퍼 어드민 계정 전화번호 설정 완료!');
    console.log(`👤 이름: ${updatedSuperAdmin.name}`);
    console.log(`🆔 아이디: 66678282`);
    console.log(`🔑 비밀번호: 87587200`);
    console.log(`📧 이메일: ${updatedSuperAdmin.email}`);
    console.log(`📱 전화번호: ${updatedSuperAdmin.phone}`);
    console.log(`🛡️ 역할: ${updatedSuperAdmin.role}`);
    
    console.log('\n🔑 로그인 방법:');
    console.log('1. 아이디: 66678282 (전화번호 8자리)');
    console.log('2. 비밀번호: 87587200');
    console.log('3. 또는 이메일: psy777@naver.com');
    
    console.log('\n⚠️ 중요: 이 계정은 어떤 경우에도 삭제되지 않습니다!');
    
  } catch (error) {
    console.error('❌ 슈퍼 어드민 전화번호 설정 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSuperAdminPhone();








