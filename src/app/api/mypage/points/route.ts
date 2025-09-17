import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }
    
    // 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { id: authToken },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true,
        finalPoints: true,
        points: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    console.log('🔍 회원 포인트 계산:', {
      userName: user.name,
      userPhone: user.phone,
      userId: user.id
    });

    // 해당 사용자의 모든 확정된 계약 조회 (이름 + 전화번호로 정확 매칭)
    // 파트너회원목록과 동일한 로직 사용
    const contracts = await prisma.contract.findMany({
      where: {
        customerName: user.name,
        customerPhone: user.phone,
        status: {
          in: ['CONFIRMED', 'COLLECTION', 'LUMP_SUM', 'COMPLETED_COLLECTION']
        }
      },
      select: {
        id: true,
        itemCategory: true,
        finalPoints: true,
        startDate: true,
        customerName: true,
        customerPhone: true,
        itemName: true,
        dynamicFields: true
      },
      orderBy: {
        startDate: 'desc'
      }
    });
    
    console.log('📊 계약 포인트:', contracts.map(c => ({ 
      itemName: c.itemName, 
      finalPoints: c.finalPoints 
    })));

    // 전체 합계 계산 (finalPoints 사용) - 파트너회원목록의 결정포인트와 동일
    const totalPoints = contracts.reduce((sum, contract) => {
      return sum + (contract.finalPoints || 0);
    }, 0);
    
    console.log('✅ 총 결정포인트:', totalPoints);

    return NextResponse.json({
      success: true,
      data: {
        totalPoints, // 파트너회원목록의 결정포인트와 동일한 값
        totalContracts: contracts.length,
        userFinalPoints: user.finalPoints, // 기존 User.finalPoints
        userPoints: user.points // 기존 User.points
      }
    });

  } catch (error) {
    console.error('❌ 회원 포인트 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '포인트 정보를 불러오지 못했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


