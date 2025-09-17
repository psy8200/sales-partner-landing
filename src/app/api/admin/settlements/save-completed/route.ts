import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs'; // Prisma 사용을 위해 Node.js 런타임 필수

// BigInt 직렬화 처리 함수
function jsonSafe(data: unknown) {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? Number(v) : v))
  );
}

// 정산 완료 데이터 저장 API
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 정산 완료 데이터 저장 API 시작');
    
    const body = await request.json();
    const { selectedItems, processedBy } = body;
    
    console.log('📊 저장할 데이터:', {
      selectedItemsCount: selectedItems?.length || 0,
      processedBy,
      firstItem: selectedItems?.[0] ? {
        id: selectedItems[0].id,
        userName: selectedItems[0].userName,
        userPhone: selectedItems[0].userPhone,
        settlementYearMonth: selectedItems[0].settlementYearMonth,
        hasAllFields: !!(selectedItems[0].userName && selectedItems[0].userPhone)
      } : null
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
        console.log('🔍 처리 중인 항목:', {
          userName: item.userName,
          userPhone: item.userPhone,
          settlementYearMonth: item.settlementYearMonth
        });
        
        // 기존 레코드가 있는지 확인 (이름 + 연락처 + 정산년월로 중복 체크)
        const existingRecord = await prisma.settlementRecord.findFirst({
          where: {
            userName: item.userName,
            userPhone: item.userPhone,
            settlementYearMonth: item.settlementYearMonth
          }
        });
        
        if (existingRecord) {
          console.log('📝 기존 레코드 업데이트:', existingRecord.id);
          // 기존 레코드 업데이트 (필수 필드 확인 및 기본값 설정)
          const updatedRecord = await prisma.settlementRecord.update({
            where: { id: existingRecord.id },
            data: {
              finalPoints: item.finalPoints || 0,
              sumPoints: item.sumPoints || 0,
              currentLevel: item.currentLevel || 1,
              basicCommission: item.basicCommission || 0,
              recruitmentCommission: item.recruitmentCommission || 0,
              indirectCommission: item.indirectCommission || 0,
              dividendBasicCommission: item.dividendBasicCommission || 0,
              dividendLevelCommission: item.dividendLevelCommission || 0,
              totalCommission: item.totalCommission || 0,
              paymentStatus: item.paymentStatus || 'PENDING',
              requestStatus: '정산가능', // 확인저장시 정산가능으로 설정
              processedBy: processedBy || 'admin',
              processedAt: new Date(),
              updatedAt: new Date()
            }
          });
          
          savedRecords.push(updatedRecord);
          console.log('✅ 기존 레코드 업데이트:', updatedRecord.id);
        } else {
          console.log('🆕 새 레코드 생성');
          // 새 레코드 생성 (필수 필드 확인 및 기본값 설정)
          const newRecord = await prisma.settlementRecord.create({
            data: {
              userName: item.userName || 'Unknown',
              userPhone: item.userPhone || '00000000000',
              finalPoints: item.finalPoints || 0,
              sumPoints: item.sumPoints || 0,
              currentLevel: item.currentLevel || 1,
              basicCommission: item.basicCommission || 0,
              recruitmentCommission: item.recruitmentCommission || 0,
              indirectCommission: item.indirectCommission || 0,
              dividendBasicCommission: item.dividendBasicCommission || 0,
              dividendLevelCommission: item.dividendLevelCommission || 0,
              totalCommission: item.totalCommission || 0,
              settlementYearMonth: item.settlementYearMonth || new Date().toISOString().slice(0, 7),
              paymentStatus: item.paymentStatus || 'PENDING',
              requestStatus: '정산가능', // 확인저장시 정산가능으로 설정
              processedBy: processedBy || 'admin',
              processedAt: new Date()
            }
          });
          
          savedRecords.push(newRecord);
          console.log('✅ 새 레코드 생성:', newRecord.id);
        }
      } catch (error) {
        console.error('❌ 개별 레코드 저장 실패:', {
          item: item.userName,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        // 개별 실패는 로그만 남기고 계속 진행
      }
    }
    
    console.log('🎉 정산 완료 데이터 저장 완료:', savedRecords.length, '건');
    
    // 저장된 건수가 0이어도 성공으로 처리 (데이터는 0으로 표시)
    const successResponse = {
      success: true,
      message: `${savedRecords.length}건의 정산 데이터가 저장되었습니다.`,
      data: {
        savedCount: savedRecords.length,
        records: jsonSafe(savedRecords)
      }
    };
    console.log('✅ 저장 완료 응답:', successResponse);
    return NextResponse.json(successResponse);
    
  } catch (error) {
    console.error('❌ 정산 완료 데이터 저장 실패:', error);
    
    const errorResponse = {
      success: false,
      message: '정산 데이터 저장 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    };
    console.log('❌ 예외 발생 응답:', errorResponse);
    return NextResponse.json(errorResponse, { status: 500 });
  } finally {
    // await prisma.$disconnect(); // @/lib/db에서 관리하므로 제거
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
    // await prisma.$disconnect(); // @/lib/db에서 관리하므로 제거
  }
}
