import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 출금요청 백업 관리 API
 * GET: 백업 목록 조회
 * POST: 새 백업 생성
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 출금요청 백업 목록 조회 시작');

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 백업 목록 조회
    const backups = await prisma.withdrawalBackup.findMany({
      orderBy: {
        backupDate: 'desc'
      },
      skip: offset,
      take: limit,
      include: {
        _count: {
          select: {
            withdrawalBackupItems: true
          }
        }
      }
    });

    // 총 백업 수 조회
    const totalBackups = await prisma.withdrawalBackup.count();

    console.log(`📊 조회된 백업: ${backups.length}건 (총 ${totalBackups}건)`);

    return NextResponse.json({
      success: true,
      data: {
        backups: backups.map(backup => ({
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
        })),
        pagination: {
          page,
          limit,
          total: totalBackups,
          totalPages: Math.ceil(totalBackups / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ 백업 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '백업 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 새 백업 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupType, backupDescription, createdBy } = body;

    console.log('💾 출금요청 백업 생성 시작:', {
      backupType, backupDescription, createdBy
    });

    // 현재 출금요청 데이터 조회
    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📋 백업할 출금요청 데이터: ${withdrawalRequests.length}건`);

    if (withdrawalRequests.length === 0) {
      return NextResponse.json(
        { error: '백업할 출금요청 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // 트랜잭션으로 백업 생성
    const result = await prisma.$transaction(async (tx) => {
      // 1. 백업 메타데이터 생성
      const backup = await tx.withdrawalBackup.create({
        data: {
          backupType: backupType || 'MANUAL',
          totalRecords: withdrawalRequests.length,
          backupSize: JSON.stringify(withdrawalRequests).length, // 대략적인 크기
          backupStatus: 'PROCESSING',
          backupDescription: backupDescription || '수동 백업 생성',
          createdBy: createdBy || 'admin'
        }
      });

      console.log('✅ 백업 메타데이터 생성 완료:', { id: backup.id });

      // 2. 백업 아이템들 생성
      const backupItems = withdrawalRequests.map(request => ({
        backupId: backup.id,
        originalId: request.id,
        userId: request.userId,
        userName: request.userName,
        userPhone: request.userPhone,
        userEmail: request.user?.email || null,
        finalPoints: request.finalPoints,
        withdrawablePoints: request.withdrawablePoints,
        totalAmount: request.totalAmount,
        requestInfo: request.requestInfo,
        settlementMonth: request.settlementMonth,
        bankName: request.bankName,
        accountNumber: request.accountNumber,
        idCardFile: request.idCardFile,
        status: request.status,
        processedBy: request.processedBy,
        processedAt: request.processedAt,
        rejectionReason: request.rejectionReason,
        requestedAt: request.requestedAt,
        paidAt: request.paidAt,
        memo: request.memo,
        originalCreatedAt: request.createdAt,
        originalUpdatedAt: request.updatedAt
      }));

      await tx.withdrawalBackupItem.createMany({
        data: backupItems
      });

      console.log('✅ 백업 아이템 생성 완료:', { count: backupItems.length });

      // 3. 백업 상태를 완료로 업데이트
      const completedBackup = await tx.withdrawalBackup.update({
        where: { id: backup.id },
        data: {
          backupStatus: 'COMPLETED',
          backupSize: JSON.stringify(backupItems).length
        }
      });

      console.log('✅ 백업 완료 상태 업데이트:', { id: completedBackup.id });

      return completedBackup;
    });

    console.log('🎉 출금요청 백업 생성 완료:', {
      id: result.id,
      totalRecords: result.totalRecords,
      backupSize: result.backupSize
    });

    return NextResponse.json({
      success: true,
      message: '백업이 성공적으로 생성되었습니다.',
      data: {
        id: result.id,
        backupDate: result.backupDate.toISOString(),
        backupType: result.backupType,
        totalRecords: result.totalRecords,
        backupSize: result.backupSize,
        backupStatus: result.backupStatus
      }
    });

  } catch (error) {
    console.error('❌ 백업 생성 오류:', error);
    return NextResponse.json(
      { error: '백업 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


