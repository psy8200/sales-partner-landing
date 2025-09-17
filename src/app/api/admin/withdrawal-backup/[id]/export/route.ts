import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 백업 데이터 외부 저장장치로 내보내기 API
 * JSON 형태로 완전한 백업 데이터 다운로드
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log('💾 백업 데이터 외부 내보내기 시작:', { id });

    // 백업 메타데이터 조회
    const backup = await prisma.withdrawalBackup.findUnique({
      where: { id },
      select: {
        id: true,
        backupDate: true,
        backupType: true,
        totalRecords: true,
        backupSize: true,
        backupStatus: true,
        backupDescription: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!backup) {
      return NextResponse.json(
        { error: '백업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 백업 아이템들 조회 (모든 데이터)
    const backupItems = await prisma.withdrawalBackupItem.findMany({
      where: { backupId: id },
      orderBy: {
        originalCreatedAt: 'desc'
      }
    });

    console.log(`📋 내보낼 백업 아이템: ${backupItems.length}건`);

    // 외부 백업용 데이터 구성
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        backupId: backup.id,
        backupDate: backup.backupDate.toISOString(),
        backupType: backup.backupType,
        totalRecords: backup.totalRecords,
        backupSize: backup.backupSize,
        backupStatus: backup.backupStatus,
        backupDescription: backup.backupDescription,
        createdBy: backup.createdBy,
        originalCreatedAt: backup.createdAt.toISOString(),
        originalUpdatedAt: backup.updatedAt.toISOString(),
        version: '1.0',
        exportType: 'EXTERNAL_BACKUP'
      },
      withdrawalRequests: backupItems.map(item => ({
        id: item.id,
        backupId: item.backupId,
        originalId: item.originalId,
        userId: item.userId,
        userName: item.userName,
        userPhone: item.userPhone,
        userEmail: item.userEmail,
        finalPoints: item.finalPoints,
        withdrawablePoints: item.withdrawablePoints,
        totalAmount: item.totalAmount,
        requestInfo: item.requestInfo,
        settlementMonth: item.settlementMonth,
        bankName: item.bankName,
        accountNumber: item.accountNumber,
        idCardFile: item.idCardFile,
        status: item.status,
        processedBy: item.processedBy,
        processedAt: item.processedAt?.toISOString(),
        rejectionReason: item.rejectionReason,
        requestedAt: item.requestedAt?.toISOString(),
        paidAt: item.paidAt?.toISOString(),
        memo: item.memo,
        originalCreatedAt: item.originalCreatedAt.toISOString(),
        originalUpdatedAt: item.originalUpdatedAt.toISOString(),
        backupCreatedAt: item.backupCreatedAt.toISOString()
      }))
    };

    // JSON 문자열로 변환
    const jsonString = JSON.stringify(exportData, null, 2);
    const jsonBuffer = Buffer.from(jsonString, 'utf-8');

    console.log('✅ 외부 백업 데이터 생성 완료:', {
      backupId: id,
      totalRecords: backupItems.length,
      fileSize: jsonBuffer.length
    });

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="출금요청백업_${backup.backupDate.toISOString().split('T')[0]}_${id}.json"`);
    headers.set('Content-Length', jsonBuffer.length.toString());

    return new NextResponse(jsonBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ 외부 백업 내보내기 오류:', error);
    return NextResponse.json(
      { error: '외부 백업 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


