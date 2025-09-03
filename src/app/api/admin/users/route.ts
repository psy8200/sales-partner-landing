import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs"; // edge 금지 (Prisma는 edge 미지원)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");
    const role = searchParams.get("role") || undefined;
    const partnerStatus = searchParams.get("partnerStatus") || undefined;

    console.log('API /admin/users called with params:', { page, limit, role, partnerStatus });

    const where: Record<string, unknown> = {};
          if (role) where.role = role;
      if (partnerStatus) where.partnerStatus = partnerStatus;
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
          loginCount: true,
          createdAt: true,
          points: true,
          bankName: true,
          bankAccount: true,
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
