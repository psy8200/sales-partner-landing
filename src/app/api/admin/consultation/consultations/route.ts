import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 상담 이력 조회 API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const searchTerm = searchParams.get('q') || '';
    const status = searchParams.get('status') || '';
    const manager = searchParams.get('manager') || '';

    const skip = (page - 1) * limit;

    // 검색 조건 구성
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { contactName: { contains: searchTerm } },
        { contactPhone: { contains: searchTerm } },
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } }
      ];
    }

    if (status) {
      where.status = status;
    }

    if (manager) {
      where.assignedTo = manager;
    }

    // 총 개수 조회
    const total = await prisma.consultation.count({ where });

    // 상담 이력 조회 (기존 필드만 사용)
    const consultations = await prisma.consultation.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // 응답 데이터 변환
    const items = consultations.map(consultation => ({
      id: consultation.id,
      customerName: consultation.contactName,
      phone: consultation.contactPhone,
      email: consultation.contactEmail,
      title: consultation.title,
      description: consultation.description,
      category: consultation.category,
      type: consultation.type,
      status: consultation.status,
      priority: consultation.priority,
      assignedTo: consultation.assignedTo,
      assignedAt: consultation.assignedAt,
      requestedDate: consultation.requestedDate,
      scheduledDate: consultation.scheduledDate,
      completedDate: consultation.completedDate,
      expectedAmount: null, // 기존 필드가 없으므로 null로 설정
      followUpDate: null, // 기존 필드가 없으므로 null로 설정
      contractCreated: false, // 기존 필드가 없으므로 false로 설정
      contractId: null, // 기존 필드가 없으므로 null로 설정
      memo: consultation.memo,
      result: consultation.result,
      rating: consultation.rating,
      createdAt: consultation.createdAt,
      updatedAt: consultation.updatedAt,
      user: consultation.user
    }));

    return NextResponse.json({
      success: true,
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('상담 이력 조회 오류:', error);
    return NextResponse.json(
      { error: '상담 이력을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

// 새로운 상담 이력 생성 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      description,
      category,
      contactName,
      contactPhone,
      contactEmail,
      requestedDate,
      priority = 'NORMAL',
      expectedAmount,
      followUpDate,
      memo
    } = body;

    // 필수 필드 검증
    if (!type || !title || !description || !category || !contactName || !contactPhone) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 상담 이력 생성
    const consultation = await prisma.consultation.create({
      data: {
        userId: userId || null,
        type,
        title,
        description,
        category,
        contactName,
        contactPhone,
        contactEmail: contactEmail || null,
        requestedDate: requestedDate ? new Date(requestedDate) : null,
        priority,
        // expectedAmount와 followUpDate는 기존 스키마에 없으므로 제거
        memo: memo || null,
        tags: {} // 기본값으로 빈 객체
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
      }
    });

    return NextResponse.json({
      success: true,
      message: '상담 이력이 생성되었습니다.',
      data: consultation
    });

  } catch (error) {
    console.error('상담 이력 생성 오류:', error);
    return NextResponse.json(
      { error: '상담 이력 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
