import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkQuestions() {
  try {
    console.log('=== 문의 데이터 확인 ===');
    
    // 전체 문의 조회
    const questions = await prisma.question.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`총 문의 수: ${questions.length}`);
    
    if (questions.length === 0) {
      console.log('❌ 문의 데이터가 없습니다.');
      return;
    }

    console.log('\n=== 문의 목록 ===');
    questions.forEach((question, index) => {
      console.log(`${index + 1}. 제목: ${question.title}`);
      console.log(`   작성자: ${question.user.name} (${question.user.email})`);
      console.log(`   상태: ${question.status}`);
      console.log(`   작성일: ${question.createdAt}`);
      console.log(`   내용: ${question.content.substring(0, 50)}...`);
      console.log('---');
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkQuestions();





