import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 특정 경로의 사이드바 아이템 제목 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ href: string }> }
) {
  try {
    const { href: hrefParam } = await params;
    const href = decodeURIComponent(hrefParam);
    
    const sidebarItem = await prisma.sidebarItem.findUnique({
      where: { href }
    });

    if (sidebarItem) {
      return NextResponse.json({
        success: true,
        data: {
          name: sidebarItem.name,
          href: sidebarItem.href,
          icon: sidebarItem.icon
        }
      });
    } else {
      // 데이터베이스에 없으면 기본 제목 반환
      const defaultTitles: { [key: string]: string } = {
        '/admin/items/insurance': '보험상담신청',
        '/admin/items/rental': '렌탈상품신청',
        '/admin/items/internet-tv': '인터넷+TV 결합상품신청',
        '/admin/items/funeral': '상조결합상품신청',
        '/admin/items/rental-mall': '렌탈몰분양신청'
      };

      return NextResponse.json({
        success: true,
        data: {
          name: defaultTitles[href] || '상품 설정',
          href: href,
          icon: '📦'
        }
      });
    }
  } catch (error) {
    console.error('사이드바 아이템 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '사이드바 아이템을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}