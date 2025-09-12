import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 선물 지급 취소 API
 * 승급회원의 선물 지급을 취소 처리합니다.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 선물 지급 취소 API 호출 시작');
    
    const body = await request.json();
    const { promotionMemberId, processedBy, memo, cancelReason } = body;

    console.log('📋 요청 데이터:', { promotionMemberId, processedBy, memo, cancelReason });

    // 필수 필드 검증
    if (!promotionMemberId) {
      return NextResponse.json(
        { success: false, error: '승급회원 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!cancelReason || cancelReason.trim() === '') {
      return NextResponse.json(
        { success: false, error: '취소 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 승급회원 조회
    const promotionMember = await prisma.promotionMember.findUnique({
      where: { id: promotionMemberId }
    });

    if (!promotionMember) {
      return NextResponse.json(
        { success: false, error: '승급회원을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 이미 취소된 경우
    if (promotionMember.paymentStatus === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: '이미 취소된 선물입니다.' },
        { status: 409 }
      );
    }

    // 취소 처리
    const updatedMember = await prisma.promotionMember.update({
      where: { id: promotionMemberId },
      data: {
        paymentStatus: 'CANCELLED',
        processedBy: processedBy || '관리자',
        memo: `[취소] ${cancelReason}${memo ? ` | ${memo}` : ''}`
      }
    });

    console.log('✅ 선물 지급 취소 완료:', {
      memberId: updatedMember.id,
      userName: updatedMember.userName,
      giftContent: updatedMember.giftContent,
      cancelReason,
      processedBy: updatedMember.processedBy
    });

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: '선물 지급이 취소되었습니다.'
    });

  } catch (error) {
    console.error('❌ 선물 지급 취소 오류:', error);
    return NextResponse.json(
      { success: false, error: '선물 지급 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 일괄 선물 지급 취소 API
 * 여러 승급회원의 선물을 일괄 취소 처리합니다.
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 일괄 선물 지급 취소 API 호출 시작');
    
    const body = await request.json();
    const { promotionMemberIds, processedBy, memo, cancelReason } = body;

    console.log('📋 요청 데이터:', { 
      memberIds: promotionMemberIds?.length || 0, 
      processedBy, 
      memo, 
      cancelReason 
    });

    // 필수 필드 검증
    if (!promotionMemberIds || !Array.isArray(promotionMemberIds) || promotionMemberIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '승급회원 ID 목록이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!cancelReason || cancelReason.trim() === '') {
      return NextResponse.json(
        { success: false, error: '취소 사유를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 승급회원들 조회
    const promotionMembers = await prisma.promotionMember.findMany({
      where: {
        id: { in: promotionMemberIds },
        paymentStatus: { not: 'CANCELLED' } // 취소되지 않은 것만 처리
      }
    });

    if (promotionMembers.length === 0) {
      return NextResponse.json(
        { success: false, error: '취소 가능한 승급회원이 없습니다.' },
        { status: 404 }
      );
    }

    // 일괄 취소 처리
    const updateResult = await prisma.promotionMember.updateMany({
      where: {
        id: { in: promotionMemberIds },
        paymentStatus: { not: 'CANCELLED' }
      },
      data: {
        paymentStatus: 'CANCELLED',
        processedBy: processedBy || '관리자',
        memo: `[취소] ${cancelReason}${memo ? ` | ${memo}` : ''}`
      }
    });

    console.log('✅ 일괄 선물 지급 취소 완료:', {
      cancelledCount: updateResult.count,
      cancelReason,
      processedBy: processedBy || '관리자'
    });

    return NextResponse.json({
      success: true,
      data: {
        cancelledCount: updateResult.count,
        cancelReason,
        processedBy: processedBy || '관리자'
      },
      message: `${updateResult.count}명의 선물 지급이 취소되었습니다.`
    });

  } catch (error) {
    console.error('❌ 일괄 선물 지급 취소 오류:', error);
    return NextResponse.json(
      { success: false, error: '일괄 선물 지급 취소 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
