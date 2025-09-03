import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestInquiry() {
  try {
    // 먼저 사용자 확인
    const user = await prisma.user.findFirst({
      where: {
        role: 'MEMBER'
      }
    });

    if (!user) {
      console.log('사용자를 찾을 수 없습니다. 먼저 사용자를 생성해주세요.');
      return;
    }

    console.log('사용자 찾음:', user.name);

    // 테스트 문의 생성
    const inquiry = await prisma.question.create({
      data: {
        userId: user.id,
        title: '테스트 문의입니다',
        content: '이것은 테스트 문의 내용입니다. 어드민에서 확인할 수 있는지 테스트해보겠습니다.',
        status: 'PENDING'
      }
    });

    console.log('테스트 문의 생성 완료:', inquiry);

    // 생성된 문의 확인
    const allQuestions = await prisma.question.findMany({
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('전체 문의 목록:', allQuestions);

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestInquiry();





