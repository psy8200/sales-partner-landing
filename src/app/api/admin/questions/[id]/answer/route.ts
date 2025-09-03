import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { answer } = await request.json();
    const questionId = params.id;

    if (!answer) {
      return NextResponse.json(
        { error: '답변 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        answer,
        status: 'ANSWERED',
        answeredAt: new Date(),
      },
    });

    return NextResponse.json({
      message: '답변이 등록되었습니다.',
      question: updatedQuestion,
    });
  } catch (error) {
    console.error('Error answering question:', error);
    return NextResponse.json(
      { error: '답변 등록에 실패했습니다.' },
      { status: 500 }
    );
  }
}











