import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixSuperAdminPassword() {
  try {
    console.log('🔧 슈퍼 어드민 계정 비밀번호를 8자리로 변경합니다...');
    
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
    
    // 8자리 비밀번호로 변경 (87587200)
    const newPassword = '87587200';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // 비밀번호 수정
    const updatedSuperAdmin = await prisma.user.update({
      where: {
        id: existingSuperAdmin.id
      },
      data: {
        passwordHash: hashedPassword
      }
    });
    
    console.log('✅ 슈퍼 어드민 계정 비밀번호 변경 완료!');
    console.log(`👤 이름: ${updatedSuperAdmin.name}`);
    console.log(`🆔 아이디: 66678282`);
    console.log(`🔑 비밀번호: ${newPassword} (8자리)`);
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
    console.error('❌ 슈퍼 어드민 비밀번호 변경 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSuperAdminPassword();

