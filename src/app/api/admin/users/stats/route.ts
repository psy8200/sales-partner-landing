import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export const runtime = 'nodejs';

export async function GET() {
  try {
    const [total, general, partner] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "GENERAL" } }),
      prisma.user.count({ where: { role: "MEMBER" } }),
    ]);

    // 파트너 전환율 계산 (전체 회원 대비 파트너 비율)
    const partnerRate = total > 0 ? Math.round((partner / total) * 100) : 0;

    return NextResponse.json({ 
      total, 
      general, 
      partner, 
      partnerRate 
    });
  } catch (error) {
    console.error('통계 조회 오류:', error);
    return NextResponse.json(
      { error: '통계 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
