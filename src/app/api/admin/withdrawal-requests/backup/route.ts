import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 출금신청 데이터 백업 API (기존 호환성 유지)
 * 새로운 백업 시스템으로 리다이렉트
 */
export async function GET(request: NextRequest) {
  try {
    console.log('💾 출금신청 데이터 백업 시작 (기존 API)');

    // 새로운 백업 시스템으로 리다이렉트
    const response = await fetch(`${request.nextUrl.origin}/api/admin/withdrawal-backup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        backupType: 'MANUAL',
        backupDescription: '기존 백업 API 호출',
        createdBy: 'legacy-api'
      })
    });

    if (!response.ok) {
      throw new Error('백업 생성 실패');
    }

    const result = await response.json();
    const backupId = result.data.id;

    console.log('✅ 새 백업 시스템으로 백업 생성 완료:', { backupId });

    // 생성된 백업을 외부 저장장치로 내보내기
    const exportResponse = await fetch(`${request.nextUrl.origin}/api/admin/withdrawal-backup/${backupId}/export`);
    
    if (!exportResponse.ok) {
      throw new Error('백업 내보내기 실패');
    }

    const exportBuffer = await exportResponse.arrayBuffer();
    const jsonBuffer = Buffer.from(exportBuffer);

    console.log('✅ 백업 데이터 내보내기 완료');

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="출금신청백업_${new Date().toISOString().split('T')[0]}.json"`);

    return new NextResponse(jsonBuffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('❌ 백업 오류:', error);
    return NextResponse.json(
      { error: '백업 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
