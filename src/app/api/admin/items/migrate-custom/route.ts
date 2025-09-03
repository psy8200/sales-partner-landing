import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST() {
  try {
    console.log('🔧 CUSTOM 카테고리를 RENTAL_MALL로 변경 시작...');

    // Raw SQL로 CUSTOM을 RENTAL_MALL로 변경
    const updateResult = await prisma.$executeRaw`
      UPDATE "ItemSetting"
      SET "category" = 'RENTAL_MALL'
      WHERE "category" = 'CUSTOM'
    `;

    // Contract 테이블도 업데이트
    const contractUpdateResult = await prisma.$executeRaw`
      UPDATE "Contract"
      SET "itemCategory" = 'RENTAL_MALL'
      WHERE "itemCategory" = 'CUSTOM'
    `;

    console.log(`✅ CUSTOM 카테고리를 RENTAL_MALL로 변경 완료`);

    return NextResponse.json({
      success: true,
      message: 'CUSTOM 카테고리를 RENTAL_MALL로 변경했습니다.',
      result: {
        itemSettingsUpdated: updateResult,
        contractsUpdated: contractUpdateResult
      }
    });

  } catch (error) {
    console.error('❌ 마이그레이션 중 오류 발생:', error);
    return NextResponse.json(
      { error: '마이그레이션 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
