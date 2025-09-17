import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// GET: list settings by category or itemName
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'INSURANCE' | 'RENTAL' | 'INTERNET_TV' | 'FUNERAL' | 'RENTAL_MALL' | 'SHOPPING_MALL' | 'INSTANT_PARTNER' | 'IMMEDIATE_JOIN' | 'CUSTOM' | null;
    const customId = searchParams.get('customId');
    const itemName = searchParams.get('itemName');
    
    let where: any = {};
    if (category) {
      where.category = category;
    }
    if (customId) {
      where.customId = customId;
    }
    if (itemName) {
      // itemName으로 검색하는 경우 (새로운 방식)
      where.itemName = itemName;
    }
    
    const items = await prisma.itemSetting.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ items });
  } catch (error) {
    console.error('ItemSetting 조회 오류:', error);
    return NextResponse.json({ error: '목록 조회 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류') }, { status: 500 });
  }
}

// POST: create setting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 새로운 방식: itemName 기반
    if (body.itemName) {
      const created = await prisma.itemSetting.create({
        data: {
          itemName: body.itemName && body.itemName.trim() !== '' ? body.itemName.trim() : null,
          provider: body.provider && body.provider.trim() !== '' ? body.provider.trim() : null,
          productName: body.productName && body.productName.trim() !== '' ? body.productName.trim() : null,
          paymentTerm: body.paymentTerm && body.paymentTerm.trim() !== '' ? body.paymentTerm.trim() : null,
          baseAmount: body.baseAmount ? Number(body.baseAmount) : null,
          expectedRate: body.expectedRate ? Number(body.expectedRate) : null,
          pointRate: body.pointRate ? Number(body.pointRate) : null,
          pointAmount: body.pointAmount ? Number(body.pointAmount) : null,
        },
      });
      return NextResponse.json({ item: created });
    }
    
    // 기존 방식: category 기반 (하위 호환성)
    const created = await prisma.itemSetting.create({
      data: {
        category: body.category,
        provider: body.provider.trim(),
        productName: body.productName.trim(),
        paymentTerm: body.paymentTerm.trim(),
        baseAmount: Number(body.baseAmount),
        expectedRate: Number(body.expectedRate),
        pointRate: Number(body.pointRate),
        pointAmount: Number(body.pointAmount),
      },
    });
    return NextResponse.json({ item: created });
  } catch (error) {
    console.error('ItemSetting 생성 오류:', error);
    return NextResponse.json({ error: '등록 실패: ' + (error instanceof Error ? error.message : '알 수 없는 오류') }, { status: 500 });
  }
}





