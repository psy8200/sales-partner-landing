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

    // 기존 상담신청 정보 조회 (담당자 정보 유지용)
    const existingApplication = await prisma.partnerApplication.findUnique({
      where: { id },
      select: { processedBy: true }
    });

    switch (action) {
      case 'assign':
        status = 'ASSIGNED';
        // 담당자가 선택되지 않았으면 에러 반환
        if (!manager || manager.trim() === '') {
          return Response.json({ error: '담당자를 선택해주세요.' }, { status: 400 });
        }
        processedBy = manager;
        break;
      case 'complete':
        status = 'COMPLETED';
        // 상담완료는 상태값만 변경, 다른 필드는 건드리지 않음
        processedBy = undefined; // processedBy 필드 업데이트 안함
        break;
      default:
        return Response.json({ error: '잘못된 액션입니다.' }, { status: 400 });
    }

    // 상담신청 상태 업데이트
    const currentTime = new Date();
    const updateData: any = {
      status: status as 'ASSIGNED' | 'COMPLETED',
      processedAt: currentTime,
    };
    
    // processedBy가 있을 때만 업데이트 (상담완료 시에는 기존 값 유지)
    if (processedBy !== undefined) {
      updateData.processedBy = processedBy;
    }
    
    const updatedApplication = await prisma.partnerApplication.update({
      where: { id },
      data: updateData,
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




