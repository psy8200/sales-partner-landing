import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 특정 백업 관리 API
 * GET: 백업 상세 정보 조회
 * DELETE: 백업 삭제
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('📋 백업 상세 정보 조회:', { id });

    const backup = await prisma.withdrawalBackup.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            withdrawalBackupItems: true
          }
        }
      }
    });

    if (!backup) {
      return NextResponse.json(
        { error: '백업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    console.log('✅ 백업 상세 정보 조회 완료:', {
      id: backup.id,
      totalRecords: backup.totalRecords,
      itemCount: backup._count.withdrawalBackupItems
    });

    return NextResponse.json({
      success: true,
      data: {
        id: backup.id,
        backupDate: backup.backupDate.toISOString(),
        backupType: backup.backupType,
        totalRecords: backup.totalRecords,
        backupSize: backup.backupSize,
        backupPath: backup.backupPath,
        backupStatus: backup.backupStatus,
        backupDescription: backup.backupDescription,
        createdBy: backup.createdBy,
        createdAt: backup.createdAt.toISOString(),
        updatedAt: backup.updatedAt.toISOString(),
        itemCount: backup._count.withdrawalBackupItems
      }
    });

  } catch (error) {
    console.error('❌ 백업 상세 정보 조회 오류:', error);
    return NextResponse.json(
      { error: '백업 상세 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 백업 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('🗑️ 백업 삭제 요청:', { id });

    // 백업 존재 확인
    const backup = await prisma.withdrawalBackup.findUnique({
      where: { id },
      select: {
        id: true,
        backupType: true,
        totalRecords: true,
        backupStatus: true
      }
    });

    if (!backup) {
      return NextResponse.json(
        { error: '백업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 트랜잭션으로 백업 삭제 (CASCADE로 관련 아이템들도 자동 삭제)
    await prisma.$transaction(async (tx) => {
      // 1. 백업 아이템들 삭제 (CASCADE로 자동 삭제되지만 명시적으로)
      await tx.withdrawalBackupItem.deleteMany({
        where: { backupId: id }
      });

      // 2. 백업 메타데이터 삭제
      await tx.withdrawalBackup.delete({
        where: { id }
      });
    });

    console.log('✅ 백업 삭제 완료:', {
      id,
      backupType: backup.backupType,
      totalRecords: backup.totalRecords
    });

    return NextResponse.json({
      success: true,
      message: '백업이 성공적으로 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 백업 삭제 오류:', error);
    return NextResponse.json(
      { error: '백업 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


