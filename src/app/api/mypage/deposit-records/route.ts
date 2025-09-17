import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    const userPhone = searchParams.get('userPhone');

    if (!userName || !userPhone) {
      return NextResponse.json(
        { error: '사용자 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 입금완료리스트 조회 API 시작');
    console.log('📋 조회 조건:', { userName, userPhone });

    // 입금완료리스트 조회 (최신순)
    const depositRecords = await prisma.depositRecord.findMany({
      where: {
        userName: userName,
        userPhone: userPhone
      },
      orderBy: {
        depositDate: 'desc'
      }
    });

    console.log('📊 조회된 입금완료리스트:', depositRecords.length, '건');

    // 응답 데이터 변환
    const formattedRecords = depositRecords.map(record => ({
      id: record.id,
      pointAmount: record.pointAmount,
      depositAmount: record.depositAmount,
      depositDate: record.depositDate,
      processedBy: record.processedBy,
      memo: record.memo
    }));

    console.log('✅ 입금완료리스트 조회 완료:', {
      totalRecords: formattedRecords.length,
      records: formattedRecords
    });

    return NextResponse.json({
      success: true,
      data: formattedRecords
    });

  } catch (error) {
    console.error('입금완료리스트 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: '입금완료리스트 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
