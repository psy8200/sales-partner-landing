import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// 중복 SettlementRecord 정리 API
export async function POST(request: NextRequest) {
  try {
    console.log('🧹 중복 SettlementRecord 정리 시작...');
    
    const body = await request.json();
    const { userName, userPhone } = body;
    
    if (!userName || !userPhone) {
      return NextResponse.json({
        success: false,
        message: '회원명과 연락처가 필요합니다.'
      }, { status: 400 });
    }
    
    // 해당 회원의 모든 레코드 조회
    const records = await prisma.settlementRecord.findMany({
      where: {
        userName: userName,
        userPhone: userPhone
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`📊 ${userName} (${userPhone})의 총 레코드 수:`, records.length);
    
    if (records.length <= 1) {
      return NextResponse.json({
        success: true,
        message: '중복 레코드가 없습니다.',
        recordsCount: records.length
      });
    }
    
    // 가장 최근 레코드(첫 번째)는 유지
    const keepRecord = records[0];
    const deleteRecords = records.slice(1);
    
    console.log('✅ 유지할 레코드:', keepRecord.id);
    console.log('🗑️ 삭제할 레코드 수:', deleteRecords.length);
    
    // 중복 레코드들 삭제
    const deletedIds = [];
    for (const record of deleteRecords) {
      await prisma.settlementRecord.delete({
        where: { id: record.id }
      });
      deletedIds.push(record.id);
      console.log('🗑️ 삭제됨:', record.id);
    }
    
    // 최종 확인
    const finalRecords = await prisma.settlementRecord.findMany({
      where: {
        userName: userName,
        userPhone: userPhone
      }
    });
    
    console.log('✅ 중복 레코드 정리 완료!');
    
    return NextResponse.json({
      success: true,
      message: `${deletedIds.length}개의 중복 레코드가 삭제되었습니다.`,
      deletedCount: deletedIds.length,
      deletedIds: deletedIds,
      finalRecordsCount: finalRecords.length,
      keptRecord: {
        id: keepRecord.id,
        createdAt: keepRecord.createdAt,
        totalCommission: keepRecord.totalCommission
      }
    });
    
  } catch (error) {
    console.error('❌ 중복 레코드 정리 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '중복 레코드 정리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}





