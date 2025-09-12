import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * 승급회원 목록 조회 API
 * 정산리스트 데이터를 기반으로 승급된 회원들을 조회합니다.
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 승급회원 목록 조회 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'ALL';
    const levelFilter = searchParams.get('level') || 'ALL';

    console.log('📋 요청 파라미터:', { page, limit, search, statusFilter, levelFilter });

    // 검색 조건 구성
    const whereCondition: any = {};

    // 검색어 필터링 (이름, 연락처, 내코드, 추천인코드)
    if (search.trim()) {
      whereCondition.OR = [
        { userName: { contains: search.trim() } },
        { userPhone: { contains: search.trim() } },
        { myCode: { contains: search.trim() } },
        { referralCode: { contains: search.trim() } }
      ];
    }

    // 상태 필터링
    if (statusFilter !== 'ALL') {
      whereCondition.paymentStatus = statusFilter;
    }

    // 레벨 필터링
    if (levelFilter !== 'ALL') {
      whereCondition.currentLevel = parseInt(levelFilter);
    }

    console.log('🔍 검색 조건:', whereCondition);

    // 승급회원 목록 조회
    const promotionMembers = await prisma.promotionMember.findMany({
      where: whereCondition,
      orderBy: {
        promotionDate: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    });

    // 총 개수 조회
    const totalCount = await prisma.promotionMember.count({
      where: whereCondition
    });

    console.log('✅ 승급회원 조회 완료:', { count: promotionMembers.length, total: totalCount });

    return NextResponse.json({
      success: true,
      data: promotionMembers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('❌ 승급회원 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '승급회원 목록을 불러올 수 없습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 승급회원 생성 API
 * 정산리스트에서 승급된 회원을 승급회원 테이블에 추가합니다.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 승급회원 생성 API 호출 시작');
    
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
      memo
    } = body;

    console.log('📋 요청 데이터:', {
      userId, userName, userPhone, myCode, referralCode,
      previousLevel, currentLevel, totalReferrals, directReferrals, indirectReferrals,
      promotionDate, giftContent, giftAmount, giftType, memo
    });

    // 필수 필드 검증
    if (!userId || !userName || !userPhone || !myCode || !previousLevel || !currentLevel) {
      return NextResponse.json(
        { success: false, error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 중복 확인 (동일한 사용자의 동일한 레벨 승급)
    const existingMember = await prisma.promotionMember.findFirst({
      where: {
        userId,
        currentLevel
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: '이미 해당 레벨로 승급된 회원입니다.' },
        { status: 409 }
      );
    }

    // 승급회원 생성
    const promotionMember = await prisma.promotionMember.create({
      data: {
        userId,
        userName,
        userPhone,
        myCode,
        referralCode,
        previousLevel,
        currentLevel,
        totalReferrals: totalReferrals || 0,
        directReferrals: directReferrals || 0,
        indirectReferrals: indirectReferrals || 0,
        promotionDate: promotionDate ? new Date(promotionDate) : new Date(),
        giftContent,
        giftAmount,
        giftType: giftType || 'GIFT_CARD',
        memo
      }
    });

    console.log('✅ 승급회원 생성 완료:', promotionMember.id);

    return NextResponse.json({
      success: true,
      data: promotionMember
    });

  } catch (error) {
    console.error('❌ 승급회원 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '승급회원을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}
