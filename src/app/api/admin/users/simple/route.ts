import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    console.log('Simple users API called');
    
    // 간단한 사용자 조회
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        partnerStatus: true
      }
    });

    console.log('Found users:', users.length);

    return NextResponse.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Simple users API error:', error);
    return NextResponse.json({ 
      error: 'Simple users API failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
