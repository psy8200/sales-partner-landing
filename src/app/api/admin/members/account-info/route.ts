import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * 회원 계좌정보 조회 API
 * /partners 페이지의 회원 정보와 정확히 매칭
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 계좌정보 조회 API 시작');
    
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const phone = searchParams.get('phone');
    
    console.log('📋 요청 파라미터:', { name, phone });
    
    if (!name || !phone) {
      console.log('❌ 필수 파라미터 누락');
      return NextResponse.json({
        success: false,
        message: '회원명과 연락처가 필요합니다.'
      }, { status: 400 });
    }
    
    console.log('🔍 데이터베이스 조회 시작...');
    
    // 단순화된 조회
    const user = await prisma.user.findFirst({
      where: {
        name: name,
        phone: phone
      }
    });
    
    console.log('📊 조회 결과:', user ? '회원 발견' : '회원 없음');
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: '해당 회원의 정보를 찾을 수 없습니다.'
      }, { status: 404 });
    }
    
    console.log('✅ 회원 정보:', {
      name: user.name,
      phone: user.phone,
      role: user.role,
      hasBankName: !!user.bankName,
      hasBankAccount: !!user.bankAccount,
      hasAccountHolder: !!user.accountHolder
    });
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        bankName: user.bankName || '정보 없음',
        bankAccount: user.bankAccount || '정보 없음',
        accountHolder: user.accountHolder || '정보 없음',
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('❌ API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '계좌정보 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}