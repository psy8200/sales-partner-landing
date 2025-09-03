import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

export interface ActivityLogData {
  type: ActivityType;
  title: string;
  description: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export class ActivityLogger {
  // 활동 로그 생성
  static async log(data: ActivityLogData) {
    try {
      await prisma.activityLog.create({
        data: {
          type: data.type,
          title: data.title,
          description: data.description,
          userId: data.userId,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Activity log creation failed:', error);
    }
  }

  // 회원가입 로그
  static async logUserRegistration(userId: string, userName: string) {
    await this.log({
      type: 'USER_REGISTRATION',
      title: '새로운 회원이 가입했습니다',
      description: `${userName}님이 회원으로 가입했습니다.`,
      userId,
      metadata: { userName }
    });
  }

  // 파트너 신청 로그
  static async logPartnerApplication(userId: string, userName: string) {
    await this.log({
      type: 'PARTNER_APPLICATION',
      title: '파트너 신청이 접수되었습니다',
      description: `${userName}님이 파트너 신청을 제출했습니다.`,
      userId,
      metadata: { userName }
    });
  }

  // 파트너 승인 로그
  static async logPartnerApproval(userId: string, userName: string) {
    await this.log({
      type: 'PARTNER_APPROVAL',
      title: '파트너 승인이 완료되었습니다',
      description: `${userName}님이 파트너로 승인되었습니다.`,
      userId,
      metadata: { userName }
    });
  }

  // 문의하기 로그
  static async logQuestion(userId: string, userName: string, questionTitle: string) {
    await this.log({
      type: 'QUESTION_SUBMITTED',
      title: '새로운 문의가 접수되었습니다',
      description: `${userName}님이 문의를 제출했습니다: ${questionTitle}`,
      userId,
      metadata: { userName, questionTitle }
    });
  }

  // 건의하기 로그
  static async logSuggestion(userId: string, userName: string, suggestionTitle: string) {
    await this.log({
      type: 'SUGGESTION_SUBMITTED',
      title: '새로운 건의가 접수되었습니다',
      description: `${userName}님이 건의를 제출했습니다: ${suggestionTitle}`,
      userId,
      metadata: { userName, suggestionTitle }
    });
  }

  // 최근 활동 조회 (30일)
  static async getRecentActivities(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return await prisma.activityLog.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
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
        createdAt: 'desc'
      },
      take: limit
    });
  }

  // 30일 이상 된 로그 삭제 및 백업
  static async cleanupAndBackup() {
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

        console.log(`Activity cleanup completed: ${oldLogs.length} records backed up and deleted`);
      }
    } catch (error) {
      console.error('Activity cleanup failed:', error);
    }
  }
}






