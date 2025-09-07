import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from 'bcryptjs';

export const runtime = "nodejs"; // edge 금지 (Prisma는 edge 미지원)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // 관리자 생성 시 필요한 필드 검증
    const { name, email, phone, password, joinDate, role, isAdmin } = body;
    
    if (!name || !email || !phone || !password || !joinDate || !role) {
      return NextResponse.json({ 
        error: '필수 필드가 누락되었습니다.' 
      }, { status: 400 });
    }

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json({ 
        error: '이미 등록된 이메일입니다.' 
      }, { status: 400 });
    }
    
    // 전화번호 중복 확인
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    
    if (existingPhone) {
      return NextResponse.json({ 
        error: '이미 등록된 전화번호입니다.' 
      }, { status: 400 });
    }

    // 비밀번호 해시화
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 관리자 생성
    console.log('Creating admin user with data:', { name, email, phone, joinDate, role });
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash, // 실제 해시된 비밀번호
        role: role === 'SUPER_ADMIN' ? 'ADMIN' : role, // SUPER_ADMIN은 ADMIN으로 저장
        status: 'ACTIVE',
        partnerStatus: 'NOT_APPLIED',
        agreeTerms: true,
        agreeTermsAt: new Date(),
        marketingAgreed: false,
        createdAt: new Date(joinDate), // 입사일을 생성일로 설정
        // 최고관리자 구분을 위한 referralCode 설정
        referralCode: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : null,
        // 관리자 전용 필드들
        isActive: true,
        loginCount: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        referralCode: true, // 최고관리자 구분을 위해 추가
        createdAt: true,
      },
    });

    console.log('Admin user created successfully:', user);

    return NextResponse.json({ 
      success: true, 
      message: '관리자가 성공적으로 생성되었습니다.',
      user 
    });
  } catch (e: unknown) {
    console.error("POST /api/admin/users error:", e);
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: e instanceof Error ? e.message : '알 수 없는 오류',
      details: e instanceof Error ? e.toString() : String(e)
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");
    const role = searchParams.get("role") || undefined;
    const partnerStatus = searchParams.get("partnerStatus") || undefined;
    const referralCodeFilter = searchParams.get("referralCodeFilter") || undefined;
    const searchQuery = searchParams.get("q") || undefined;

    console.log('API /admin/users called with params:', { page, limit, role, partnerStatus, referralCodeFilter, searchQuery });

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (partnerStatus) where.partnerStatus = partnerStatus;
    
    // 검색 기능 추가 (SQLite 호환)
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery } },
        { email: { contains: searchQuery } },
        { phone: { contains: searchQuery } }
      ];
    }
    
    // 추천인코드 필터 (실제 추천인코드 값으로)
    if (referralCodeFilter && referralCodeFilter !== '') {
      where.referralCode = referralCodeFilter;
    }
    const skip = (page - 1) * limit;

    console.log('Prisma query where:', where);

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          role: true,
          partnerStatus: true,
          lastLoginAt: true,
          lastLogoutAt: true,
          loginCount: true,
          createdAt: true,
          points: true,
          bankName: true,
          bankAccount: true,
          referralCode: true, // 최고관리자 구분을 위해 추가
          isOnline: true,
          lastActivityAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    console.log('Query results:', { itemsCount: items.length, total });

    return NextResponse.json({ items, total, page, limit });
  } catch (e: unknown) {
    console.error("GET /api/admin/users error:", e);
    return NextResponse.json({ 
      error: "INTERNAL_ERROR", 
      message: e instanceof Error ? e.message : '알 수 없는 오류',
      details: e instanceof Error ? e.toString() : String(e)
    }, { status: 500 });
  }
}
