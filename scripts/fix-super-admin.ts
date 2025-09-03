import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixSuperAdmin() {
  try {
    console.log('🔧 슈퍼 어드민 계정을 수정합니다...');
    
    // 기존 슈퍼 어드민 계정 삭제
    const deleteResult = await prisma.user.deleteMany({
      where: {
        email: 'superadmin@system.com'
      }
    });
    console.log(`🗑️ 기존 슈퍼 어드민 계정 삭제 완료: ${deleteResult.count}개`);
    
    // 새로운 슈퍼 어드민 비밀번호 생성
    const superAdminPassword = await bcrypt.hash('875872', 12);
    
    // 새로운 슈퍼 어드민 계정 생성
    const superAdmin = await prisma.user.create({
      data: {
        email: '66678282@system.com', // 아이디를 이메일로 사용
        phone: '000-0000-0000',
        name: '시스템관리자',
        passwordHash: superAdminPassword,
        status: 'ACTIVE',
        role: 'ADMIN',
        partnerStatus: 'NOT_APPLIED',
        points: 0,
        level: 0,
        marketingAgreed: false,
        isActive: true
      }
    });
    
    console.log('✅ 슈퍼 어드민 계정 수정 완료!');
    console.log(`👤 이름: ${superAdmin.name}`);
    console.log(`🆔 아이디: 66678282`);
    console.log(`🔑 비밀번호: 875872`);
    console.log(`📧 이메일: ${superAdmin.email}`);
    console.log(`🛡️ 역할: ${superAdmin.role}`);
    console.log(`📅 생성일: ${superAdmin.createdAt.toLocaleString()}`);
    
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
      const id = admin.email.split('@')[0];
      console.log(`${index + 1}. ${admin.name} - 아이디: ${id} (${admin.role})`);
    });
    
  } catch (error) {
    console.error('❌ 슈퍼 어드민 수정 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSuperAdmin();








