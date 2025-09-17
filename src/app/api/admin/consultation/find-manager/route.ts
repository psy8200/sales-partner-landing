import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 고객명과 연락처로 상담이력에서 담당자 정보를 찾는 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerName = searchParams.get('customerName');
    const customerPhone = searchParams.get('customerPhone');

    // 필수 파라미터 검증
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: '고객명과 연락처가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('🔍 담당자 검색 요청:', { customerName, customerPhone });

    // 상담이력에서 고객명과 연락처가 일치하는 가장 최근 기록 찾기
    const consultation = await prisma.consultation.findFirst({
      where: {
        contactName: customerName,
        contactPhone: customerPhone,
        assignedTo: { not: null } // 담당자가 있는 기록만
      },
      orderBy: { createdAt: 'desc' }, // 가장 최근 기록
      select: {
        id: true,
        contactName: true,
        contactPhone: true,
        assignedTo: true, // 담당자 정보
        assignedAt: true,
        createdAt: true,
        status: true
      }
    });

    if (!consultation) {
      console.log('❌ 해당 고객의 상담이력이 없거나 담당자가 없습니다.');
      return NextResponse.json({
        success: false,
        message: '해당 고객의 상담이력이 없거나 담당자가 배정되지 않았습니다.',
        manager: null
      });
    }

    console.log('✅ 담당자 정보 찾음:', {
      customerName: consultation.contactName,
      customerPhone: consultation.contactPhone,
      manager: consultation.assignedTo,
      assignedAt: consultation.assignedAt
    });

    return NextResponse.json({
      success: true,
      message: '담당자 정보를 찾았습니다.',
      manager: consultation.assignedTo,
      consultationInfo: {
        id: consultation.id,
        assignedAt: consultation.assignedAt,
        status: consultation.status,
        createdAt: consultation.createdAt
      }
    });

  } catch (error) {
    console.error('담당자 검색 오류:', error);
    return NextResponse.json(
      { error: '담당자 정보를 찾는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}


