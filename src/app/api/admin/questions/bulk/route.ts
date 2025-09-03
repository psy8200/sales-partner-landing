import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: string[] = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { error: "삭제할 질문 ID가 없습니다." },
        { status: 400 }
      );
    }

    const result = await prisma.question.deleteMany({
      where: { id: { in: ids } },
    });

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("Bulk delete questions error:", error);
    return NextResponse.json(
      { error: "질문 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}












