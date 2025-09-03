import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    console.log('=== 파트너신청 삭제 API 시작 ===');
    
    const { id } = await request.json();
    console.log('삭제 요청 ID:', id);

    if (!id) {
      console.log('❌ ID가 제공되지 않음');
      return NextResponse.json(
        { success: false, error: "파트너신청 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 파트너신청 정보 조회
    console.log('파트너신청 정보 조회 중...');
    const partnerApplication = await prisma.partnerApplication.findUnique({
      where: { id },
      select: { 
        userId: true,
        status: true,
        createdAt: true
      }
    });

    if (!partnerApplication) {
      console.log('❌ 파트너신청을 찾을 수 없음');
      return NextResponse.json(
        { success: false, error: "파트너신청을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log('파트너신청 정보:', {
      userId: partnerApplication.userId,
      status: partnerApplication.status,
      createdAt: partnerApplication.createdAt
    });

    // 사용자 정보 조회
    console.log('사용자 정보 조회 중...');
    const user = await prisma.user.findUnique({
      where: { id: partnerApplication.userId },
      select: { 
        name: true, 
        email: true, 
        partnerStatus: true 
      }
    });

    console.log('사용자 정보:', {
      name: user?.name,
      email: user?.email,
      currentPartnerStatus: user?.partnerStatus
    });

    // 트랜잭션으로 파트너신청 삭제와 사용자 상태 초기화를 동시에 수행
    console.log('트랜잭션 시작...');
    const result = await prisma.$transaction(async (tx) => {
      // 1. 파트너신청 완전 삭제
      console.log('1단계: 파트너신청 삭제 중...');
      const deletedApp = await tx.partnerApplication.delete({
        where: { id }
      });
      console.log('✅ 파트너신청 삭제 완료:', deletedApp.id);
      
      // 2. 사용자의 파트너 상태를 NOT_APPLIED로 초기화
      console.log('2단계: 사용자 상태 업데이트 중...');
      const updatedUser = await tx.user.update({
        where: { id: partnerApplication.userId },
        data: { 
          partnerStatus: 'NOT_APPLIED',
          updatedAt: new Date()
        },
        select: { partnerStatus: true, updatedAt: true }
      });
      console.log('✅ 사용자 상태 업데이트 완료:', {
        newPartnerStatus: updatedUser.partnerStatus,
        updatedAt: updatedUser.updatedAt
      });
      
      return { deletedApp, updatedUser };
    });

    console.log('✅ 트랜잭션 완료:', result);

    // 활동 로그 기록
    try {
      await prisma.activityLog.create({
        data: {
          userId: partnerApplication.userId,
          type: 'PARTNER_APPLICATION_DELETED',
          title: '파트너신청 삭제',
          description: `파트너신청이 관리자에 의해 완전히 삭제되었습니다. (ID: ${id})`,
          metadata: JSON.stringify({
            deletedApplicationId: id,
            previousStatus: partnerApplication.status,
            newPartnerStatus: 'NOT_APPLIED'
          })
        }
      });
      console.log('✅ 활동 로그 기록 완료');
    } catch (logError) {
      console.warn('⚠️ 활동 로그 기록 실패 (무시됨):', logError);
    }

    console.log('=== 파트너신청 삭제 API 완료 ===');
    
    return NextResponse.json({
      success: true,
      message: "파트너신청이 완전히 삭제되었습니다.",
      userId: partnerApplication.userId,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 파트너신청 삭제 API 오류:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "파트너신청 삭제에 실패했습니다.",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
