import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const search = searchParams.get('q') || '';

    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: Record<string, unknown> = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phone: { contains: search } } },
        { additionalNote: { contains: search } },
      ];
    }

    // 파트너신청 목록 조회
    const [applications, total] = await Promise.all([
      prisma.partnerApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              partnerStatus: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.partnerApplication.count({ where }),
    ]);

    return NextResponse.json({
      items: applications.map(app => ({
        id: app.id,
        userId: app.userId,
        userName: app.user.name,
        userEmail: app.user.email,
        userPhone: app.user.phone,
        userRole: app.user.role,
        userPartnerStatus: app.user.partnerStatus,
        availableDate: app.availableDate,
        availableTime: app.availableTime,
        preferredTime: app.preferredTime,
        additionalNote: app.additionalNote,
        status: app.status,
        adminMemo: app.adminMemo,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        processedAt: app.processedAt,
        approvedAt: app.approvedAt,
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('파트너신청 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '파트너신청 목록을 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}





