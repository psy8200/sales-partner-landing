import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 포인트추가 신청 API
 * PartnerApplication 테이블에 consultationType: "포인트추가"로 저장
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      userId, 
      selectedItems, 
      consultationDate, 
      consultationTime
    } = body;

    console.log('포인트추가 신청 데이터:', { userId, selectedItems, consultationDate, consultationTime });

    // 필수 필드 검증
    if (!userId || !selectedItems || !consultationDate || !consultationTime) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자 정보 조회 (추천인코드 가져오기)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        name: true, 
        phone: true, 
        address: true, 
        referralCode: true 
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 선택된 아이템들을 메모 필드에 저장
    const memo = `선택된 아이템: ${selectedItems.join(', ')}`;

    // PartnerApplication 테이블에 포인트추가 신청 데이터 저장
    const pointAddRequest = await prisma.partnerApplication.create({
      data: {
        userId,
        availableDate: consultationDate,
        availableTime: consultationTime,
        area: user.address || "서울", // 사용자 주소 사용
        referrer: user.referralCode || "없음", // 사용자의 실제 추천인코드 사용
        additionalNote: memo,
        consultationType: "포인트추가", // 상담종류를 포인트추가로 설정
        status: 'PENDING'
      }
    });

    console.log('포인트추가 신청 저장 완료:', {
      id: pointAddRequest.id,
      userId,
      userName: user.name,
      userPhone: user.phone,
      referralCode: user.referralCode,
      selectedItems
    });

    return NextResponse.json({
      success: true,
      message: '포인트추가 신청이 완료되었습니다.',
      data: {
        id: pointAddRequest.id
      }
    });

  } catch (error) {
    console.error('포인트추가 신청 오류:', error);
    return NextResponse.json(
      { error: '포인트추가 신청 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 포인트추가 신청 목록 조회 API
 * additionalNote에 "선택된 아이템"이 포함된 데이터만 조회
 */
export async function GET() {
  try {
    const pointAddRequests = await prisma.partnerApplication.findMany({
      where: {
        additionalNote: {
          contains: "선택된 아이템"
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: pointAddRequests
    });

  } catch (error) {
    console.error('포인트추가 신청 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '포인트추가 신청 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
