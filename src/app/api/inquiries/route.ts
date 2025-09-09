import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { ActivityLogger } from '@/lib/activityLogger';
import { createSuccessResponse, createErrorResponse, createBadRequestResponse, createUnauthorizedResponse, createNotFoundResponse } from '@/lib/apiResponse';

const inquirySchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.'),
  content: z.string().min(1, '내용을 입력해주세요.'),
  type: z.enum(['QUESTION', 'SUGGESTION']).default('QUESTION'),
});

// 세션 토큰 디코딩 함수
function decodeSessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = inquirySchema.parse(body);

    // 현재 로그인된 사용자 정보 가져오기
    const sessionToken = request.cookies.get('session')?.value;
    
    if (!sessionToken) {
      return createUnauthorizedResponse('로그인이 필요합니다.');
    }

    // 토큰 디코딩
    const tokenData = decodeSessionToken(sessionToken);
    if (!tokenData || !tokenData.userId) {
      return createUnauthorizedResponse('유효하지 않은 세션입니다.');
    }

    const userId = tokenData.userId;
    
    // 사용자 정보 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return createNotFoundResponse('사용자 정보를 찾을 수 없습니다.');
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

    return createSuccessResponse({
      question: {
        id: question.id,
        title: question.title,
        status: question.status,
        createdAt: question.createdAt,
      },
    }, '문의가 성공적으로 접수되었습니다.');
  } catch (error) {
    console.error('문의 접수 오류:', error);
    
    if (error instanceof z.ZodError) {
      return createBadRequestResponse('입력 데이터가 올바르지 않습니다.');
    }
    
    return createErrorResponse('문의 접수 중 오류가 발생했습니다.');
  }
}

// 사용자의 문의글 목록 조회
export async function GET(request: NextRequest) {
  try {
    console.log('=== 문의 목록 조회 시작 ===');
    
    // 현재 로그인된 사용자 정보 가져오기
    const sessionToken = request.cookies.get('session')?.value;
    console.log('session 쿠키:', sessionToken ? '존재함' : '없음');
    
    if (!sessionToken) {
      console.log('session 쿠키가 없음');
      return createUnauthorizedResponse('로그인이 필요합니다.');
    }

    // 토큰 디코딩
    const tokenData = decodeSessionToken(sessionToken);
    console.log('토큰 디코딩 결과:', tokenData);
    
    if (!tokenData || !tokenData.userId) {
      console.log('유효하지 않은 토큰');
      return createUnauthorizedResponse('유효하지 않은 세션입니다.');
    }

    const userId = tokenData.userId;
    console.log('사용자 ID:', userId);
    
    console.log('문의 목록 조회 - userId:', userId);
    
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
    
    console.log('조회된 문의 개수:', inquiries.length);
    console.log('문의 목록:', inquiries.map(q => ({ id: q.id, title: q.title, createdAt: q.createdAt })));

    return createSuccessResponse({
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
    return createErrorResponse('문의글 목록을 불러오지 못했습니다.');
  }
}
