import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 정산완료 데이터 조회 API
 * /admin/settlements/completed 페이지에서 사용
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 정산완료 데이터 조회 API 시작');
    
    // 모든 정산 기록 조회 (확인저장된 데이터)
    const settlementRecords = await prisma.settlementRecord.findMany({
      orderBy: {
        settlementYearMonth: 'desc'
      }
    });
    
    console.log('📊 조회된 정산 기록:', settlementRecords.length, '건');
    
    // API 응답 형식에 맞게 데이터 변환
    const completedData = settlementRecords.map(record => ({
      id: record.id,
      userName: record.userName,
      userPhone: record.userPhone,
      finalPoints: record.finalPoints,
      sumPoints: record.sumPoints,
      currentLevel: record.currentLevel,
      basicCommission: record.basicCommission,
      recruitmentCommission: record.recruitmentCommission,
      indirectCommission: record.indirectCommission,
      dividendBasicCommission: record.dividendBasicCommission,
      dividendLevelCommission: record.dividendLevelCommission,
      totalCommission: record.totalCommission,
      settlementYearMonth: record.settlementYearMonth,
      paymentStatus: record.paymentStatus,
      requestStatus: record.requestStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }));
    
    console.log('✅ 정산완료 데이터 변환 완료:', completedData.length, '건');
    
    return NextResponse.json({
      success: true,
      data: completedData,
      total: completedData.length
    });
    
  } catch (error) {
    console.error('❌ 정산완료 데이터 조회 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산완료 데이터 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 정산완료 데이터 저장 API
 * /admin/settlements/commission-calculator 페이지에서 승인완료 버튼 클릭 시 사용
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 정산완료 데이터 저장 API 시작');
    
    const { completedData } = await request.json();
    
    if (!completedData || !Array.isArray(completedData)) {
      return NextResponse.json({
        success: false,
        message: '유효하지 않은 데이터입니다.',
        error: 'completedData is required and must be an array'
      }, { status: 400 });
    }

    console.log('📊 저장할 정산완료 데이터:', completedData.length, '건');

    // 데이터베이스에 저장 (중복 체크 포함)
    const savedRecords = [];
    const skippedRecords = [];
    
    for (const data of completedData) {
      try {
        // 🔍 중복 체크: 회원명 + 기본수당 + 모집수당 + 간접수당 + 총지급액으로 중복 확인
        const existingRecord = await prisma.settlementRecord.findFirst({
          where: {
            userName: data.userName,
            basicCommission: data.basicCommission,
            recruitmentCommission: data.recruitmentCommission,
            indirectCommission: data.indirectCommission,
            totalCommission: data.totalCommission
          }
        });
        
        if (existingRecord) {
          console.log('⚠️ 중복 데이터 발견, 건너뛰기:', {
            userName: data.userName,
            userPhone: data.userPhone,
            basicCommission: data.basicCommission,
            recruitmentCommission: data.recruitmentCommission,
            indirectCommission: data.indirectCommission,
            totalCommission: data.totalCommission,
            existingId: existingRecord.id
          });
          skippedRecords.push({
            userName: data.userName,
            userPhone: data.userPhone,
            basicCommission: data.basicCommission,
            recruitmentCommission: data.recruitmentCommission,
            indirectCommission: data.indirectCommission,
            totalCommission: data.totalCommission,
            reason: '동일한 회원의 동일한 수당 정보가 이미 존재'
          });
          continue;
        }
        
        // 🆕 새 레코드 생성
        const newRecord = await prisma.settlementRecord.create({
          data: {
            userId: data.id, // 임시로 id를 userId로 사용
            userName: data.userName,
            userPhone: data.userPhone,
            finalPoints: data.finalPoints,
            sumPoints: data.sumPoints,
            currentLevel: data.currentLevel,
            basicCommission: data.basicCommission,
            recruitmentCommission: data.recruitmentCommission,
            indirectCommission: data.indirectCommission,
            dividendBasicCommission: data.dividendBasicCommission,
            dividendLevelCommission: data.dividendLevelCommission,
            totalCommission: data.totalCommission,
            settlementYearMonth: data.settlementYearMonth,
            paymentStatus: data.paymentStatus,
            requestStatus: data.requestStatus,
            processedBy: 'admin', // 실제로는 현재 로그인한 관리자 정보
            processedAt: new Date()
          }
        });
        
        savedRecords.push(newRecord);
        console.log('✅ 새 레코드 생성:', {
          id: newRecord.id,
          userName: newRecord.userName,
          userPhone: newRecord.userPhone,
          basicCommission: newRecord.basicCommission,
          recruitmentCommission: newRecord.recruitmentCommission,
          indirectCommission: newRecord.indirectCommission,
          totalCommission: newRecord.totalCommission
        });
        
      } catch (error) {
        console.error('❌ 레코드 저장 실패:', {
          userName: data.userName,
          userPhone: data.userPhone,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('✅ 정산완료 데이터 저장 완료:', {
      총요청: completedData.length,
      새로저장: savedRecords.length,
      중복건너뛰기: skippedRecords.length
    });

    return NextResponse.json({
      success: true,
      message: `정산완료 데이터 처리 완료: ${savedRecords.length}건 저장, ${skippedRecords.length}건 중복으로 건너뛰기`,
      data: {
        totalRequested: completedData.length,
        savedCount: savedRecords.length,
        skippedCount: skippedRecords.length,
        savedRecords: savedRecords.map(record => ({
          id: record.id,
          userName: record.userName,
          userPhone: record.userPhone,
          totalCommission: record.totalCommission
        })),
        skippedRecords: skippedRecords
      }
    });

  } catch (error) {
    console.error('❌ 정산완료 데이터 저장 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산완료 데이터 저장 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * 정산완료 데이터 삭제 API
 * /admin/settlements/completed 페이지에서 삭제하기 버튼 클릭 시 사용
 */
export async function DELETE(request: NextRequest) {
  try {
    console.log('🔄 정산완료 데이터 삭제 API 시작');
    
    const { idsToDelete } = await request.json();
    
    if (!idsToDelete || !Array.isArray(idsToDelete) || idsToDelete.length === 0) {
      return NextResponse.json({
        success: false,
        message: '삭제할 항목 ID가 필요합니다.',
        error: 'idsToDelete is required and must be a non-empty array'
      }, { status: 400 });
    }

    console.log('📊 삭제할 정산완료 데이터 ID:', idsToDelete);

    // 데이터베이스에서 삭제
    const deleteResult = await prisma.settlementRecord.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    });

    console.log('✅ 정산완료 데이터 삭제 완료:', deleteResult.count, '건');

    return NextResponse.json({
      success: true,
      message: '정산완료 데이터가 성공적으로 삭제되었습니다.',
      data: {
        deletedCount: deleteResult.count,
        deletedIds: idsToDelete
      }
    });

  } catch (error) {
    console.error('❌ 정산완료 데이터 삭제 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산완료 데이터 삭제 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}



