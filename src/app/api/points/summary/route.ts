import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    const userId = authToken;

    const now = new Date();

    const [accrualSum, withdrawSum, pendingLedger] = await Promise.all([
      prisma.pointLedger.aggregate({ where: { userId }, _sum: { amount: true } }),
      prisma.withdrawalRequest.aggregate({ where: { userId, status: 'PAID' }, _sum: { amount: true } }),
      prisma.pointLedger.aggregate({ where: { userId, availableAt: { gt: now } }, _sum: { amount: true } }),
    ]);

    const totalAccrued = accrualSum._sum.amount || 0;
    const totalPaid = withdrawSum._sum.amount || 0;
    const scheduled = pendingLedger._sum.amount || 0;
    const withdrawable = Math.max(0, totalAccrued - scheduled - totalPaid);

    return NextResponse.json({ totalAccrued, withdrawable, scheduled, totalPaid, asOf: now });
  } catch (error) {
    console.error('Points summary error:', error);
    return NextResponse.json({ error: '포인트 요약 조회 실패' }, { status: 500 });
  }
}












