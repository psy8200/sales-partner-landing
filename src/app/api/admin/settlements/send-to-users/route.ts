import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 정산완료내역보내기 API
 * 어드민에서 선택한 정산 데이터를 회원들에게 전송
 * SettlementRecord → UserSettlementRecord 복사
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📤 정산완료내역보내기 API 시작');
    
    const { selectedIds } = await request.json();
    
    if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
      return NextResponse.json({
        success: false,
        message: '전송할 항목 ID가 필요합니다.',
        error: 'selectedIds is required and must be a non-empty array'
      }, { status: 400 });
    }

    console.log('📊 전송할 정산 데이터 ID:', selectedIds);

    // 선택된 SettlementRecord 조회 (정산가능 상태만)
    const settlementRecords = await prisma.settlementRecord.findMany({
      where: {
        id: {
          in: selectedIds
        },
        requestStatus: '정산가능'  // 정산가능 상태만 전송
      }
    });

    console.log('🔍 조회된 정산가능 데이터:', {
      selectedIdsCount: selectedIds.length,
      foundRecordsCount: settlementRecords.length,
      foundIds: settlementRecords.map(r => r.id)
    });

    // 선택된 ID들의 현재 상태 확인
    const allSelectedRecords = await prisma.settlementRecord.findMany({
      where: {
        id: {
          in: selectedIds
        }
      },
      select: {
        id: true,
        userName: true,
        userPhone: true,
        requestStatus: true
      }
    });

    console.log('🔍 선택된 모든 레코드 상태:', allSelectedRecords.map(r => ({
      id: r.id,
      userName: r.userName,
      userPhone: r.userPhone,
      requestStatus: r.requestStatus
    })));

    if (settlementRecords.length === 0) {
      return NextResponse.json({
        success: false,
        message: '전송할 정산 데이터를 찾을 수 없습니다.',
        error: 'No settlement records found with status 정산가능',
        debug: {
          selectedIdsCount: selectedIds.length,
          foundRecordsCount: settlementRecords.length,
          allSelectedRecordsStatus: allSelectedRecords.map(r => ({
            id: r.id,
            requestStatus: r.requestStatus
          }))
        }
      }, { status: 404 });
    }

    console.log('📋 조회된 정산 기록:', settlementRecords.length, '건');

    // UserSettlementRecord에 복사 (중복 체크 포함)
    const sentRecords = [];
    const skippedRecords = [];
    
    for (const record of settlementRecords) {
      try {
        // 🔍 차익 계산: 기존 UserSettlementRecord 데이터와 비교하여 차익 계산
        const existingUserRecords = await prisma.userSettlementRecord.findMany({
          where: {
            userName: record.userName,
            userPhone: record.userPhone,
            settlementYearMonth: record.settlementYearMonth
          }
        });
        
        // 기존 데이터의 수당 합계 계산
        const existingBasicCommission = existingUserRecords.reduce((sum, r) => sum + r.basicCommission, 0);
        const existingRecruitmentCommission = existingUserRecords.reduce((sum, r) => sum + r.recruitmentCommission, 0);
        const existingIndirectCommission = existingUserRecords.reduce((sum, r) => sum + r.indirectCommission, 0);
        const existingDividendBasicCommission = existingUserRecords.reduce((sum, r) => sum + r.dividendBasicCommission, 0);
        const existingDividendLevelCommission = existingUserRecords.reduce((sum, r) => sum + r.dividendLevelCommission, 0);
        
        // 차익 계산 (0보다 큰 경우만)
        const diffBasicCommission = Math.max(0, record.basicCommission - existingBasicCommission);
        const diffRecruitmentCommission = Math.max(0, record.recruitmentCommission - existingRecruitmentCommission);
        const diffIndirectCommission = Math.max(0, record.indirectCommission - existingIndirectCommission);
        const diffDividendBasicCommission = Math.max(0, record.dividendBasicCommission - existingDividendBasicCommission);
        const diffDividendLevelCommission = Math.max(0, record.dividendLevelCommission - existingDividendLevelCommission);
        
        // 차익이 있는지 확인
        const hasDifference = diffBasicCommission > 0 || diffRecruitmentCommission > 0 || 
                             diffIndirectCommission > 0 || diffDividendBasicCommission > 0 || 
                             diffDividendLevelCommission > 0;
        
        if (!hasDifference) {
          console.log('⚠️ 차익이 없음, 건너뛰기:', {
            userName: record.userName,
            userPhone: record.userPhone,
            existingBasicCommission,
            existingRecruitmentCommission,
            existingIndirectCommission,
            existingDividendBasicCommission,
            existingDividendLevelCommission,
            newBasicCommission: record.basicCommission,
            newRecruitmentCommission: record.recruitmentCommission,
            newIndirectCommission: record.indirectCommission,
            newDividendBasicCommission: record.dividendBasicCommission,
            newDividendLevelCommission: record.dividendLevelCommission
          });
          skippedRecords.push({
            userName: record.userName,
            userPhone: record.userPhone,
            reason: '차익이 없음 (기존 데이터와 동일)'
          });
          continue;
        }
        
        console.log('💰 차익 발견, 전송:', {
          userName: record.userName,
          userPhone: record.userPhone,
          existingBasicCommission,
          existingRecruitmentCommission,
          existingIndirectCommission,
          existingDividendBasicCommission,
          existingDividendLevelCommission,
          newBasicCommission: record.basicCommission,
          newRecruitmentCommission: record.recruitmentCommission,
          newIndirectCommission: record.indirectCommission,
          newDividendBasicCommission: record.dividendBasicCommission,
          newDividendLevelCommission: record.dividendLevelCommission,
          diffBasicCommission,
          diffRecruitmentCommission,
          diffIndirectCommission,
          diffDividendBasicCommission,
          diffDividendLevelCommission
        });
        
        // 🆕 UserSettlementRecord에 차익만 전송
        const newUserRecord = await prisma.userSettlementRecord.create({
          data: {
            userId: record.userId,
            userName: record.userName,
            userPhone: record.userPhone,
            finalPoints: record.finalPoints,
            sumPoints: record.sumPoints,
            currentLevel: record.currentLevel,
            basicCommission: diffBasicCommission, // 차익만 전송
            recruitmentCommission: diffRecruitmentCommission, // 차익만 전송
            indirectCommission: diffIndirectCommission, // 차익만 전송
            dividendBasicCommission: diffDividendBasicCommission, // 차익만 전송
            dividendLevelCommission: diffDividendLevelCommission, // 차익만 전송
            totalCommission: diffBasicCommission + diffRecruitmentCommission + diffIndirectCommission + 
                           diffDividendBasicCommission + diffDividendLevelCommission, // 차익 합계
            remainingPoints: 0, // 잔여포인트 (기본값 0, 출금 시 업데이트)
            settlementYearMonth: record.settlementYearMonth,
            paymentStatus: 'PAID', // 회원용은 항상 PAID
            requestStatus: '지급완료', // 회원용은 항상 지급완료
            processedBy: record.processedBy,
            processedAt: record.processedAt,
            sentAt: new Date() // 전송 일시 기록
          }
        });
        
        sentRecords.push({
          ...newUserRecord,
          settlementId: record.id  // 원본 SettlementRecord ID 추가
        });
        console.log('✅ 회원에게 전송 완료:', {
          id: newUserRecord.id,
          userName: newUserRecord.userName,
          userPhone: newUserRecord.userPhone,
          totalCommission: newUserRecord.totalCommission,
          sentAt: newUserRecord.sentAt
        });
        
      } catch (error) {
        console.error('❌ 회원 전송 실패:', {
          userName: record.userName,
          userPhone: record.userPhone,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // 전송 완료된 SettlementRecord의 상태를 '정산완료'로 변경
    if (sentRecords.length > 0) {
      const sentSettlementIds = sentRecords.map(record => record.settlementId);
      await prisma.settlementRecord.updateMany({
        where: {
          id: {
            in: sentSettlementIds
          }
        },
        data: {
          requestStatus: '정산완료'
        }
      });
      console.log('✅ 전송된 SettlementRecord 상태를 정산완료로 변경:', sentSettlementIds.length, '건');
    }

    console.log('✅ 정산완료내역보내기 완료:', {
      총요청: selectedIds.length,
      전송완료: sentRecords.length,
      중복건너뛰기: skippedRecords.length
    });

    return NextResponse.json({
      success: true,
      message: `정산완료내역 전송 완료: ${sentRecords.length}건 전송, ${skippedRecords.length}건 중복으로 건너뛰기`,
      data: {
        totalRequested: selectedIds.length,
        sentCount: sentRecords.length,
        skippedCount: skippedRecords.length,
        sentRecords: sentRecords.map(record => ({
          id: record.id,
          userName: record.userName,
          userPhone: record.userPhone,
          totalCommission: record.totalCommission,
          sentAt: record.sentAt
        })),
        skippedRecords: skippedRecords
      }
    });

  } catch (error) {
    console.error('❌ 정산완료내역보내기 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산완료내역 전송 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
