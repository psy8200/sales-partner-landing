import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 출금신청확인 API 시작');
    
    const body = await request.json();
    const { withdrawalRequestId, userId, userName, userPhone, finalPoints, totalAmount } = body;

    // 필수 데이터 검증
    if (!withdrawalRequestId || !userId || !userName || !userPhone || !finalPoints || !totalAmount) {
      return NextResponse.json({
        success: false,
        message: '필수 데이터가 누락되었습니다.'
      }, { status: 400 });
    }

    console.log('📊 처리할 출금신청 데이터:', {
      withdrawalRequestId,
      userId,
      userName,
      userPhone,
      finalPoints,
      totalAmount
    });

    // 트랜잭션으로 처리
    const result = await prisma.$transaction(async (tx) => {
      // 1. User.remainingPoints 계산 (출금가능금액 - 출금신청금액)
      const newRemainingPoints = finalPoints - totalAmount;
      
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          remainingPoints: newRemainingPoints
        }
      });

      console.log('✅ User.remainingPoints 업데이트 완료:', {
        userId,
        userName,
        finalPoints,
        totalAmount,
        newRemainingPoints,
        calculation: `${finalPoints} - ${totalAmount} = ${newRemainingPoints}`
      });

      // 2. UserSettlementRecord의 수당현황을 0으로 초기화
      const updatedSettlementRecords = await tx.userSettlementRecord.updateMany({
        where: {
          userName: userName,
          userPhone: userPhone
        },
        data: {
          basicCommission: 0,
          recruitmentCommission: 0,
          indirectCommission: 0,
          dividendBasicCommission: 0,
          dividendLevelCommission: 0,
          totalCommission: 0,
          remainingPoints: newRemainingPoints
        }
      });

      console.log('✅ UserSettlementRecord 수당현황 초기화 완료:', {
        userId,
        userName,
        updatedRecords: updatedSettlementRecords.count,
        newRemainingPoints
      });

      return { updatedUser, updatedSettlementRecords };
    });

    console.log('🎉 출금신청확인 처리 완료:', {
      withdrawalRequestId,
      userId,
      userName,
      totalAmount,
      newRemainingPoints: result.updatedUser.remainingPoints,
      updatedRecords: result.updatedSettlementRecords.count
    });

    return NextResponse.json({
      success: true,
      message: '출금신청이 확인되었습니다. 잔여포인트가 계산되고 수당현황이 초기화되었습니다.',
      data: {
        withdrawalRequestId,
        userId,
        userName,
        totalAmount,
        newRemainingPoints: result.updatedUser.remainingPoints,
        updatedRecords: result.updatedSettlementRecords.count
      }
    });

  } catch (error) {
    console.error('❌ 출금신청확인 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '출금신청확인 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}