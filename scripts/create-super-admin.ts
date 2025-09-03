import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    console.log('🛡️ 슈퍼 어드민 계정을 생성합니다...');
    
    // 기존 슈퍼 어드민 확인
    const existingSuperAdmin = await prisma.user.findFirst({
      where: {
        email: 'superadmin@system.com'
      }
    });
    
    if (existingSuperAdmin) {
      console.log('⚠️ 슈퍼 어드민 계정이 이미 존재합니다.');
      console.log(`계정: ${existingSuperAdmin.name} (${existingSuperAdmin.email})`);
      return;
    }
    
    // 슈퍼 어드민 비밀번호 생성
    const superAdminPassword = await bcrypt.hash('superadmin1234', 12);
    
    // 슈퍼 어드민 계정 생성
    const superAdmin = await prisma.user.create({
      data: {
        email: 'superadmin@system.com',
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
    
    console.log('✅ 슈퍼 어드민 계정 생성 완료!');
    console.log(`👤 이름: ${superAdmin.name}`);
    console.log(`📧 이메일: ${superAdmin.email}`);
    console.log(`🔑 비밀번호: superadmin1234`);
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
      console.log(`${index + 1}. ${admin.name} (${admin.email}) - ${admin.role}`);
    });
    
  } catch (error) {
    console.error('❌ 슈퍼 어드민 생성 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();
