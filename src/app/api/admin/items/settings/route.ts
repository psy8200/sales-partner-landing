import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// GET: list settings by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'INSURANCE' | 'RENTAL' | 'INTERNET_TV' | 'FUNERAL' | 'RENTAL_MALL' | 'CUSTOM' | null;
    const where = category ? { category } : {};
    const items = await prisma.itemSetting.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: '목록 조회 실패' }, { status: 500 });
  }
}

// POST: create setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const created = await prisma.itemSetting.create({
      data: {
        category: body.category,
        provider: body.provider,
        productName: body.productName,
        paymentTerm: body.paymentTerm,
        baseAmount: body.baseAmount,
        expectedRate: body.expectedRate,
        pointRate: body.pointRate,
        pointAmount: body.pointAmount,
      },
    });
    return NextResponse.json({ item: created });
  } catch {
    return NextResponse.json({ error: '등록 실패' }, { status: 500 });
  }
}





