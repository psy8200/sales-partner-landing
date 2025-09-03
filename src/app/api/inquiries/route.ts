import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ActivityLogger } from '@/lib/activityLogger';

const inquirySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  type: z.enum(['QUESTION', 'SUGGESTION']).default('QUESTION'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    // 현재 로그인된 사용자 정보 가져오기
    const authToken = request.cookies.get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    const userId = authToken;
    
    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 문의/건의 생성
    const question = await prisma.question.create({
      data: {
        userId: userId,
        title: validatedData.title,
        content: validatedData.content,
        status: 'PENDING',
      },
    });

    // 활동 로그 생성
    if (validatedData.type === 'QUESTION') {
      await ActivityLogger.logQuestion(user.id, user.name, validatedData.title);
    } else {
      await ActivityLogger.logSuggestion(user.id, user.name, validatedData.title);
    }

    return NextResponse.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다.',
      question: {
        id: question.id,
        title: question.title,
        status: question.status,
        createdAt: question.createdAt,
      },
    });
  } catch (error) {
    console.error('문의 접수 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '입력 데이터가 올바르지 않습니다.', details: (error as any).errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '문의 접수 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자의 문의글 목록 조회
export async function GET(request: NextRequest) {
  try {
    // 현재 로그인된 사용자 정보 가져오기
    const authToken = request.cookies.get('authToken')?.value;
    
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          error: "로그인이 필요합니다." 
        },
        { status: 401 }
      );
    }

    const userId = authToken;
    
    const inquiries = await prisma.question.findMany({
      where: {
        userId: userId,
      },
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
    });

    return NextResponse.json({
      success: true,
      inquiries: inquiries.map(inquiry => ({
        id: inquiry.id,
        title: inquiry.title,
        content: inquiry.content,
        answer: inquiry.answer,
        status: inquiry.status,
        createdAt: inquiry.createdAt,
        answeredAt: inquiry.answeredAt,
        userName: inquiry.user.name,
      })),
    });
  } catch (error) {
    console.error('문의글 조회 API 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "문의글 목록을 불러오지 못했습니다." 
      },
      { status: 500 }
    );
  }
}
