import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixSuperAdminEmail() {
  try {
    console.log('🔧 슈퍼 어드민 계정 이메일을 수정합니다...');
    
    // 기존 슈퍼 어드민 계정 찾기
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: '66678282@system.com'
      }
    });
    
    if (!existingSuperAdmin) {
      console.log('❌ 슈퍼 어드민 계정을 찾을 수 없습니다.');
      return;
    }
    
    // 이메일 수정
    const updatedSuperAdmin = await prisma.user.update({
      where: {
        id: existingSuperAdmin.id
      },
      data: {
        email: 'psy777@naver.com'
      }
    });
    
    console.log('✅ 슈퍼 어드민 계정 이메일 수정 완료!');
    console.log(`👤 이름: ${updatedSuperAdmin.name}`);
    console.log(`🆔 아이디: 66678282`);
    console.log(`🔑 비밀번호: 875872`);
    console.log(`📧 이메일: ${updatedSuperAdmin.email}`);
    console.log(`🛡️ 역할: ${updatedSuperAdmin.role}`);
    
    console.log('\n⚠️ 중요: 이 계정은 어떤 경우에도 삭제되지 않습니다!');
    console.log('🔐 비밀번호를 안전한 곳에 보관하세요.');
    
    // 전체 어드민 계정 확인
    const allAdmins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 전체 어드민 계정:');
    allAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} - ${admin.email} (${admin.role})`);
    });
    
  } catch (error) {
    console.error('❌ 슈퍼 어드민 이메일 수정 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSuperAdminEmail();








