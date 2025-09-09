import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { PartnerApplicationStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const q = (searchParams.get('q') || '').trim();
    const status = (searchParams.get('status') || '').trim();

    const where: Record<string, unknown> = {};
    if (status) where.status = status as PartnerApplicationStatus;
    if (q) {
      where.OR = [
        { user: { name: { contains: q } } },
        { user: { phone: { contains: q } } },
        { user: { email: { contains: q } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.partnerApplication.count({ where }),
      prisma.partnerApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
              addressDetail: true,
              zipCode: true,
            },
          },
        },
      }),
    ]);

    return Response.json({
      total,
      items: items.map((it) => ({
        id: it.id,
        customerName: it.user?.name || '-',
        phone: it.user?.phone || '-',
        area: it.area || it.user?.address || '-',
        referrer: it.referrer || '-',
        availableDate: it.availableDate,
        availableTime: it.availableTime,
        additionalNote: it.additionalNote,
        backendStatus: it.status, // PENDING/APPROVED/REJECTED/CANCELLED
        manager: it.processedBy || undefined,
        assignedAt: it.processedAt?.toISOString(),
        createdAt: it.createdAt.toISOString(),
      })),
      page,
      limit,
    });
  } catch (error: unknown) {
    console.error('GET /api/admin/contracts/requests error', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, processedBy } = body;

    if (!id || !status) {
      return Response.json({ error: 'ID와 상태가 필요합니다.' }, { status: 400 });
    }

    // 상담신청 상태 업데이트
    const updatedApplication = await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: status as PartnerApplicationStatus,
        processedBy: processedBy, // 하드코딩된 '관리자' 제거
        processedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            addressDetail: true,
            zipCode: true,
          },
        },
      },
    });

    return Response.json({
      success: true,
      item: {
        id: updatedApplication.id,
        customerName: updatedApplication.user?.name || '-',
        phone: updatedApplication.user?.phone || '-',
        area: updatedApplication.user?.address || '-',
        availableTime: updatedApplication.availableTime,
        additionalNote: updatedApplication.additionalNote,
        backendStatus: updatedApplication.status,
        manager: updatedApplication.processedBy || undefined,
        assignedAt: updatedApplication.processedAt?.toISOString(),
        createdAt: updatedApplication.createdAt.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error('PUT /api/admin/contracts/requests error', error);
    return Response.json({ error: '상태 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}


