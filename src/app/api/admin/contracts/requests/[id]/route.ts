import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, manager } = body;

    if (!id || !action) {
      return Response.json({ error: 'ID와 액션이 필요합니다.' }, { status: 400 });
    }

    let status: string;
    let processedBy: string;

    switch (action) {
      case 'assign':
        status = 'ASSIGNED';
        processedBy = manager || '관리자';
        break;
      case 'complete':
        status = 'COMPLETED';
        processedBy = '관리자';
        break;
      default:
        return Response.json({ error: '잘못된 액션입니다.' }, { status: 400 });
    }

    // 상담신청 상태 업데이트
    const currentTime = new Date();
    const updatedApplication = await prisma.partnerApplication.update({
      where: { id },
      data: {
        status: status as 'ASSIGNED' | 'COMPLETED',
        processedBy,
        processedAt: currentTime,
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
      backendStatus: updatedApplication.status,
      manager: updatedApplication.processedBy,
      assignedAt: updatedApplication.processedAt?.toISOString(),
      processedAt: updatedApplication.processedAt?.toISOString(),
    });
  } catch (error: unknown) {
    console.error('PATCH /api/admin/contracts/requests/[id] error', error);
    return Response.json({ error: '상태 변경 중 오류가 발생했습니다.' }, { status: 500 });
  }
}




