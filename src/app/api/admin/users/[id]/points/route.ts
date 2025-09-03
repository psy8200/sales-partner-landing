import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 먼저 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true, phone: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 해당 사용자의 모든 계약 조회 (고객명으로 매칭)
    const contracts = await prisma.contract.findMany({
      where: {
        customerName: user.name
      },
      select: {
        id: true,
        itemCategory: true,
        finalPoints: true,
        startDate: true,
        customerName: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });

    // 카테고리별로 포인트 그룹화
    const categoryPoints = contracts.reduce((acc, contract) => {
      const category = contract.itemCategory;
      if (!acc[category]) {
        acc[category] = {
          category,
          points: 0,
          count: 0,
          contracts: []
        };
      }
      
      acc[category].points += contract.finalPoints || 0;
      acc[category].count += 1;
      acc[category].contracts.push({
        id: contract.id,
        startDate: contract.startDate,
        finalPoints: contract.finalPoints || 0
      });
      
      return acc;
    }, {} as Record<string, {category: string, points: number, count: number, contracts: Array<{id: string, startDate: Date | null, finalPoints: number}>}>);

    // 전체 합계 계산
    const totalPoints = contracts.reduce((sum, contract) => sum + (contract.finalPoints || 0), 0);
    const totalContracts = contracts.length;

    return NextResponse.json({
      totalPoints,
      totalContracts,
      categoryPoints: Object.values(categoryPoints)
    });

  } catch (error) {
    console.error('포인트 조회 오류:', error);
    return NextResponse.json(
      { error: '포인트 정보를 불러오지 못했습니다.' },
      { status: 500 }
    );
  }
}
