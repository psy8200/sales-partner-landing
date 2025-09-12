import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 지급완료 내역 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 지급완료 내역 조회 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const level = searchParams.get('level') || '';
    const giftType = searchParams.get('giftType') || '';
    const dateFilter = searchParams.get('dateFilter') || '';

    console.log('📋 요청 파라미터:', { page, limit, search, level, giftType, dateFilter });

    // 검색 조건 구성
    const where: any = {};

    // 검색어 조건
    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { userPhone: { contains: search } },
        { myCode: { contains: search } },
        { processedBy: { contains: search } }
      ];
    }

    // 등급 필터
    if (level && level !== 'all') {
      where.currentLevel = parseInt(level);
    }

    // 선물 타입 필터
    if (giftType && giftType !== 'all') {
      where.giftType = giftType;
    }

    // 날짜 필터
    if (dateFilter && dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }

      where.paymentDate = {
        gte: startDate
      };
    }

    // 데이터 조회
    const [paymentHistory, totalCount] = await Promise.all([
      prisma.paymentHistory.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.paymentHistory.count({ where })
    ]);

    console.log('📊 조회 결과:', { 
      totalCount, 
      currentPage: page, 
      totalPages: Math.ceil(totalCount / limit),
      dataCount: paymentHistory.length 
    });

    return NextResponse.json({
      success: true,
      data: paymentHistory,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ 지급완료 내역 조회 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '지급완료 내역 조회 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 지급완료 내역 저장 API
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 지급완료 내역 저장 API 호출 시작');
    
    const body = await request.json();
    const {
      userId,
      userName,
      userPhone,
      myCode,
      referralCode,
      previousLevel,
      currentLevel,
      totalReferrals,
      directReferrals,
      indirectReferrals,
      promotionDate,
      giftContent,
      giftAmount,
      giftType,
      processedBy,
      memo
    } = body;

    console.log('📋 저장할 데이터:', {
      userName,
      userPhone,
      myCode,
      currentLevel,
      giftType,
      processedBy
    });

    // 필수 필드 검증
    if (!userName || !userPhone || !myCode || !currentLevel || !giftType || !processedBy) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 지급완료 내역 저장
    const paymentHistory = await prisma.paymentHistory.create({
      data: {
        userId: userId || `user_${Date.now()}`,
        userName,
        userPhone,
        myCode,
        referralCode,
        previousLevel: previousLevel || Math.max(0, currentLevel - 1),
        currentLevel,
        totalReferrals: totalReferrals || 0,
        directReferrals: directReferrals || 0,
        indirectReferrals: indirectReferrals || 0,
        promotionDate: promotionDate ? new Date(promotionDate) : new Date(),
        giftContent,
        giftAmount: giftAmount ? parseFloat(giftAmount) : null,
        giftType,
        paymentDate: new Date(), // 현재 시간을 지급일시로 설정
        processedBy,
        memo
      }
    });

    console.log('✅ 지급완료 내역 저장 완료:', paymentHistory.id);

    return NextResponse.json({
      success: true,
      data: paymentHistory,
      message: '지급완료 내역이 성공적으로 저장되었습니다.'
    });

  } catch (error) {
    console.error('❌ 지급완료 내역 저장 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '지급완료 내역 저장 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 지급완료 내역 메모 업데이트 API
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, memo } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID가 필요합니다.' }, { status: 400 });
    }

    // 메모 업데이트
    const updatedPaymentHistory = await prisma.paymentHistory.update({
      where: { id },
      data: { memo }
    });

    console.log('✅ 메모 업데이트 완료:', id);

    return NextResponse.json({
      success: true,
      data: updatedPaymentHistory,
      message: '메모가 성공적으로 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('❌ 메모 업데이트 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '메모 업데이트 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 지급완료 내역 삭제 API
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: '삭제할 ID 목록이 필요합니다.' }, { status: 400 });
    }

    // 선택된 항목들 삭제
    const deletedCount = await prisma.paymentHistory.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });

    console.log('✅ 삭제 완료:', deletedCount.count, '개 항목');

    return NextResponse.json({
      success: true,
      deletedCount: deletedCount.count,
      message: `${deletedCount.count}개 항목이 성공적으로 삭제되었습니다.`
    });

  } catch (error) {
    console.error('❌ 삭제 API 오류:', error);
    return NextResponse.json(
      { success: false, error: '삭제 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
