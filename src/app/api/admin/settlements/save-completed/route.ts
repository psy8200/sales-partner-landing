import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 정산 완료 데이터 저장 API
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 정산 완료 데이터 저장 API 시작');
    
    const body = await request.json();
    const { selectedItems, processedBy } = body;
    
    console.log('📊 저장할 데이터:', {
      selectedItemsCount: selectedItems?.length || 0,
      processedBy
    });
    
    if (!selectedItems || selectedItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: '저장할 데이터가 없습니다.'
      }, { status: 400 });
    }
    
    // 선택된 항목들을 데이터베이스에 저장
    const savedRecords = [];
    
    for (const item of selectedItems) {
      try {
        // 기존 레코드가 있는지 확인 (이름 + 연락처 + 정산년월로 중복 체크)
        const existingRecord = await prisma.settlementRecord.findFirst({
          where: {
            userName: item.userName,
            userPhone: item.userPhone,
            settlementYearMonth: item.settlementYearMonth
          }
        });
        
        if (existingRecord) {
          // 기존 레코드 업데이트
          const updatedRecord = await prisma.settlementRecord.update({
            where: { id: existingRecord.id },
            data: {
              finalPoints: item.finalPoints,
              sumPoints: item.sumPoints,
              currentLevel: item.currentLevel,
              basicCommission: item.basicCommission,
              recruitmentCommission: item.recruitmentCommission,
              indirectCommission: item.indirectCommission,
              dividendBasicCommission: item.dividendBasicCommission,
              dividendLevelCommission: item.dividendLevelCommission,
              totalCommission: item.totalCommission,
              paymentStatus: item.paymentStatus,
              requestStatus: '정산가능', // 확인저장시 정산가능으로 변경
              processedBy: processedBy || 'admin',
              processedAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          savedRecords.push(updatedRecord);
          console.log('✅ 기존 레코드 업데이트:', updatedRecord.id);
        } else {
          // 새 레코드 생성
          const newRecord = await prisma.settlementRecord.create({
            data: {
              userName: item.userName,
              userPhone: item.userPhone,
              finalPoints: item.finalPoints,
              sumPoints: item.sumPoints,
              currentLevel: item.currentLevel,
              basicCommission: item.basicCommission,
              recruitmentCommission: item.recruitmentCommission,
              indirectCommission: item.indirectCommission,
              dividendBasicCommission: item.dividendBasicCommission,
              dividendLevelCommission: item.dividendLevelCommission,
              totalCommission: item.totalCommission,
              settlementYearMonth: item.settlementYearMonth,
              paymentStatus: item.paymentStatus,
              requestStatus: '정산가능', // 확인저장시 정산가능으로 변경
              processedBy: processedBy || 'admin',
              processedAt: new Date()
            }
          });
          
          savedRecords.push(newRecord);
          console.log('✅ 새 레코드 생성:', newRecord.id);
        }
      } catch (error) {
        console.error('❌ 개별 레코드 저장 실패:', error);
        // 개별 실패는 로그만 남기고 계속 진행
      }
    }
    
    console.log('🎉 정산 완료 데이터 저장 완료:', savedRecords.length, '건');
    
    return NextResponse.json({
      success: true,
      message: `${savedRecords.length}건의 정산 데이터가 저장되었습니다.`,
      data: {
        savedCount: savedRecords.length,
        records: savedRecords
      }
    });
    
  } catch (error) {
    console.error('❌ 정산 완료 데이터 저장 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산 데이터 저장 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// 정산 완료 데이터 조회 API
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 정산 완료 데이터 조회 API 시작');
    
    const { searchParams } = new URL(request.url);
    const userName = searchParams.get('userName');
    const userPhone = searchParams.get('userPhone');
    const settlementYearMonth = searchParams.get('settlementYearMonth');
    
    // 조회 조건 구성
    const where: any = {};
    if (userName) where.userName = { contains: userName };
    if (userPhone) where.userPhone = { contains: userPhone };
    if (settlementYearMonth) where.settlementYearMonth = settlementYearMonth;
    
    const records = await prisma.settlementRecord.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log('📊 조회된 정산 데이터:', records.length, '건');
    
    return NextResponse.json({
      success: true,
      data: records
    });
    
  } catch (error) {
    console.error('❌ 정산 완료 데이터 조회 실패:', error);
    
    return NextResponse.json({
      success: false,
      message: '정산 데이터 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
