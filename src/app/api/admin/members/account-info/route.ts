import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');

    if (!name || !phone) {
      return NextResponse.json({ 
        success: false, 
        message: '이름과 전화번호가 필요합니다.' 
      });
    }

    // 해당 회원의 계좌정보 조회
    const user = await prisma.user.findFirst({
      where: {
        name: {
          contains: name.trim()
        },
        phone: {
          contains: phone.trim()
        },
        partnerApplications: {
          some: {} // 파트너신청이 있는 사용자만
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        bankName: true,
        bankAccount: true,
        accountHolder: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: '해당 회원을 찾을 수 없습니다.' 
      });
    }

    // 계좌정보가 있는지 확인
    if (!user.bankName || !user.bankAccount) {
      return NextResponse.json({ 
        success: false, 
        message: '계좌정보가 등록되지 않았습니다.' 
      });
    }

    return NextResponse.json({ 
      success: true,
      data: {
        bankName: user.bankName,
        accountNumber: user.bankAccount,
        accountHolder: user.accountHolder || user.name
      }
    });

  } catch (error) {
    console.error('계좌정보 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        message: '계좌정보 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

