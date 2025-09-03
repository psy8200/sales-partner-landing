import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
export const runtime = 'nodejs';

const approveSchema = z.object({
  adminMemo: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // 스키마 검증
    const validatedData = approveSchema.parse(body);
    
    // 파트너신청 정보 조회
    const application = await prisma.partnerApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            partnerStatus: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: "파트너신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, error: "이미 처리된 신청입니다." },
        { status: 400 }
      );
    }

    // 트랜잭션으로 파트너신청 승인 및 사용자 정보 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 파트너신청 상태 업데이트
      const updatedApplication = await tx.partnerApplication.update({
        where: { id },
        data: {
          status: 'APPROVED',
          adminMemo: validatedData.adminMemo,
          approvedAt: new Date(),
        },
      });

      // 사용자 정보 업데이트 (role을 MEMBER로, partnerStatus를 APPROVED로)
      const updatedUser = await tx.user.update({
        where: { id: application.userId },
        data: {
          role: 'MEMBER',
          partnerStatus: 'APPROVED',
          updatedAt: new Date(),
        },
      });

      return { updatedApplication, updatedUser };
    });

    return NextResponse.json({
      success: true,
      message: "파트너신청이 승인되었습니다.",
      data: {
        applicationId: result.updatedApplication.id,
        userId: result.updatedUser.id,
        userName: result.updatedUser.name,
      },
    });
  } catch (error) {
    console.error('파트너신청 승인 오류:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: "입력 데이터가 올바르지 않습니다.",
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: "파트너신청 승인에 실패했습니다." },
      { status: 500 }
    );
  }
}





