const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedActivities() {
  try {
    console.log('🌱 활동 로그 시드 데이터 생성 중...');

    // 기존 사용자들에 대한 활동 로그 생성
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
        partnerStatus: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📊 ${users.length}명의 사용자 데이터 발견`);

    for (const user of users) {
      // 회원가입 로그
      await prisma.activityLog.create({
        data: {
          type: 'USER_REGISTRATION',
          title: '새로운 회원이 가입했습니다',
          description: `${user.name}님이 회원으로 가입했습니다.`,
          userId: user.id,
          metadata: JSON.stringify({ userName: user.name }),
          createdAt: user.createdAt
        }
      });

      // 파트너 승인된 사용자들의 승인 로그
      if (user.role === 'MEMBER' && user.partnerStatus === 'APPROVED') {
        const approvalDate = new Date(user.createdAt);
        approvalDate.setHours(approvalDate.getHours() + 1); // 가입 후 1시간 후 승인으로 설정

        await prisma.activityLog.create({
          data: {
            type: 'PARTNER_APPROVAL',
            title: '파트너 승인이 완료되었습니다',
            description: `${user.name}님이 파트너로 승인되었습니다.`,
            userId: user.id,
            metadata: JSON.stringify({ userName: user.name }),
            createdAt: approvalDate
          }
        });
      }
    }

    // 기존 파트너 신청들에 대한 로그 생성
    const partnerApplications = await prisma.partnerApplication.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`📝 ${partnerApplications.length}개의 파트너 신청 데이터 발견`);

    for (const application of partnerApplications) {
      await prisma.activityLog.create({
        data: {
          type: 'PARTNER_APPLICATION',
          title: '파트너 신청이 접수되었습니다',
          description: `${application.user.name}님이 파트너 신청을 제출했습니다.`,
          userId: application.userId,
          metadata: JSON.stringify({ userName: application.user.name }),
          createdAt: application.createdAt
        }
      });
    }

    // 기존 문의사항들에 대한 로그 생성
    const questions = await prisma.question.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`❓ ${questions.length}개의 문의사항 데이터 발견`);

    for (const question of questions) {
      await prisma.activityLog.create({
        data: {
          type: 'QUESTION_SUBMITTED',
          title: '새로운 문의가 접수되었습니다',
          description: `${question.user.name}님이 문의를 제출했습니다: ${question.title}`,
          userId: question.userId,
          metadata: JSON.stringify({ 
            userName: question.user.name, 
            questionTitle: question.title 
          }),
          createdAt: question.createdAt
        }
      });
    }

    console.log('✅ 활동 로그 시드 데이터 생성 완료!');

    // 백업 및 정리 작업 실행
    console.log('🧹 30일 이상 된 로그 정리 및 백업 중...');
    await cleanupAndBackup();

  } catch (error) {
    console.error('❌ 활동 로그 시드 데이터 생성 실패:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function cleanupAndBackup() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 30일 이상 된 로그 조회
    const oldLogs = await prisma.activityLog.findMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (oldLogs.length > 0) {
      // 백업 생성
      await prisma.activityBackup.create({
        data: {
          data: JSON.stringify(oldLogs),
          recordCount: oldLogs.length
        }
      });

      // 30일 이상 된 로그 삭제
      await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: thirtyDaysAgo
          }
        }
      });

      console.log(`✅ ${oldLogs.length}개의 오래된 로그가 백업되고 삭제되었습니다.`);
    } else {
      console.log('ℹ️ 정리할 오래된 로그가 없습니다.');
    }
  } catch (error) {
    console.error('❌ 로그 정리 및 백업 실패:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  seedActivities();
}

module.exports = { seedActivities, cleanupAndBackup };










