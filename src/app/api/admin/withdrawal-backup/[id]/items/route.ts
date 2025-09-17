import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 백업된 출금요청 아이템 조회 API
 * 대용량 데이터 처리를 위한 페이지네이션 및 검색 기능
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    // 쿼리 파라미터 파싱
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const date = searchParams.get('date') || '';
    
    const offset = (page - 1) * limit;

    console.log('📋 백업 아이템 조회 시작:', {
      backupId: id,
      page,
      limit,
      search,
      status,
      date
    });

    // 백업 존재 확인
    const backup = await prisma.withdrawalBackup.findUnique({
      where: { id },
      select: { id: true, backupType: true, totalRecords: true }
    });

    if (!backup) {
      return NextResponse.json(
        { error: '백업을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 검색 조건 구성
    const whereConditions: any = {
      backupId: id
    };

    // 검색어 조건
    if (search) {
      whereConditions.OR = [
        { userName: { contains: search } },
        { userPhone: { contains: search } },
        { settlementMonth: { contains: search } },
        { bankName: { contains: search } },
        { accountNumber: { contains: search } }
      ];
    }

    // 상태 필터
    if (status !== 'ALL') {
      whereConditions.status = status;
    }

    // 날짜 필터
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      whereConditions.originalCreatedAt = {
        gte: startDate,
        lt: endDate
      };
    }

    // 백업 아이템 조회 (페이지네이션)
    const [items, totalItems] = await Promise.all([
      prisma.withdrawalBackupItem.findMany({
        where: whereConditions,
        orderBy: {
          originalCreatedAt: 'desc'
        },
        skip: offset,
        take: limit
      }),
      prisma.withdrawalBackupItem.count({
        where: whereConditions
      })
    ]);

    console.log(`📊 조회된 백업 아이템: ${items.length}건 (총 ${totalItems}건)`);

    // 응답 데이터 변환
    const transformedItems = items.map(item => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: transformedItems,
        pagination: {
          page,
          limit,
          total: totalItems,
          totalPages: Math.ceil(totalItems / limit)
        },
        backup: {
          id: backup.id,
          backupType: backup.backupType,
          totalRecords: backup.totalRecords
        }
      }
    });

  } catch (error) {
    console.error('❌ 백업 아이템 조회 오류:', error);
    return NextResponse.json(
      { error: '백업 아이템 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


