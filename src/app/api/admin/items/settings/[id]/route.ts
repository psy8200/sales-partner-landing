import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/db'; // 미사용 import 제거

export const runtime = 'nodejs';

export async function DELETE() {
  // Deletion is forbidden by policy
  return NextResponse.json({ error: '삭제 금지: 정책상 아이템 삭제 불가' }, { status: 405 });
}


