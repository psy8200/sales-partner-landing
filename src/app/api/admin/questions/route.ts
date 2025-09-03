import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log('API /admin/questions - Fetching questions...');

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Number.isNaN(limitParam) ? 20 : Math.min(Math.max(limitParam, 1), 100);

    const where = q
      ? {
          OR: [
            { title: { contains: q } },
            { content: { contains: q } },
            { user: { name: { contains: q } } },
          ],
        }
      : {};

    const questions = await prisma.question.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    console.log('API /admin/questions - Found questions:', questions.length);

    return NextResponse.json({
      questions: questions.map(q => ({
        id: q.id,
        userId: q.userId,
        userName: q.user.name,
        title: q.title,
        content: q.content,
        answer: q.answer,
        status: q.status,
        createdAt: q.createdAt,
        answeredAt: q.answeredAt,
      })),
    });
  } catch (error) {
    console.error('Questions API error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: '질문 목록을 불러오지 못했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
