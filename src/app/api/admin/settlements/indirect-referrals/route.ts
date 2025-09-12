import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 간접 추천 회원 조회 API 호출 시작');
    const { searchParams } = new URL(request.url);
    const directReferralCodes = searchParams.get('directReferralCodes');

    if (!directReferralCodes) {
      return NextResponse.json(
        { success: false, error: 'directReferralCodes 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 직접 추천인코드들을 배열로 변환
    const referralCodes = directReferralCodes.split(',').filter(code => code.trim());
    console.log('📋 요청 파라미터:', { directReferralCodes, referralCodes });

    if (referralCodes.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          indirectReferrals: [],
          totalCount: 0,
          levelBreakdown: {}
        }
      });
    }

    // 재귀적으로 간접 추천인들을 조회
    const { indirectReferrals, levelBreakdown } = await findIndirectReferralsRecursively(referralCodes);

    console.log('📊 최종 결과:', {
      totalIndirectReferrals: indirectReferrals.length,
      levelBreakdown
    });

    return NextResponse.json({
      success: true,
      data: {
        indirectReferrals,
        totalCount: indirectReferrals.length,
        levelBreakdown
      }
    });

  } catch (error) {
    console.error('❌ 간접 추천 회원 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '간접 추천 회원 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 재귀적으로 간접 추천인들을 조회하는 함수
 * @param referralCodes 현재 레벨의 추천인코드들
 * @param visited 이미 방문한 추천인코드들 (무한루프 방지)
 * @param currentLevel 현재 레벨 (0부터 시작)
 * @returns 간접 추천인들과 레벨별 통계
 */
async function findIndirectReferralsRecursively(
  referralCodes: string[], 
  visited: Set<string> = new Set(), 
  currentLevel: number = 0
): Promise<{ indirectReferrals: any[], levelBreakdown: Record<number, number> }> {
  
  console.log(`🔄 레벨 ${currentLevel} 처리 시작:`, referralCodes);
  
  const allIndirectReferrals: any[] = [];
  const levelBreakdown: Record<number, number> = {};

  // 현재 레벨의 추천인코드들 처리
  for (const referralCode of referralCodes) {
    // 중복 방문 체크 (무한루프 방지)
    if (visited.has(referralCode)) {
      console.log(`⚠️ 이미 방문한 추천인코드 건너뛰기: ${referralCode}`);
      continue;
    }
    
    visited.add(referralCode);
    console.log(`🔍 추천인코드 ${referralCode} 처리 중...`);

    try {
      // 해당 추천인코드로 가입한 회원들 조회
      const directReferrals = await getDirectReferralsByCode(referralCode);
      
      if (directReferrals.length > 0) {
        console.log(`👥 ${referralCode}로 ${directReferrals.length}명의 직접 추천인 발견`);
        
        // 현재 레벨의 결과에 추가
        allIndirectReferrals.push(...directReferrals);
        levelBreakdown[currentLevel] = (levelBreakdown[currentLevel] || 0) + directReferrals.length;
        
        // 각 회원의 전화번호 뒤 8자리를 추천인코드로 사용하여 다음 레벨 조회
        const nextLevelCodes = directReferrals
          .map(r => {
            const phoneLast8 = r.customerPhone.slice(-8);
            console.log(`📋 회원 정보:`, {
              customerName: r.customerName,
              customerPhone: r.customerPhone,
              phoneLast8: phoneLast8,
              referralCode: r.referralCode
            });
            return phoneLast8;
          })
          .filter(code => code && code.trim() !== '');
        
        if (nextLevelCodes.length > 0) {
          console.log(`🔄 다음 레벨로 전달할 추천인코드들:`, nextLevelCodes);
          
          // 재귀 호출로 다음 레벨 조회
          const nextLevelResult = await findIndirectReferralsRecursively(
            nextLevelCodes, 
            visited, 
            currentLevel + 1
          );
          
          // 다음 레벨 결과 병합
          allIndirectReferrals.push(...nextLevelResult.indirectReferrals);
          
          // 레벨별 통계 병합
          Object.entries(nextLevelResult.levelBreakdown).forEach(([level, count]) => {
            levelBreakdown[parseInt(level)] = (levelBreakdown[parseInt(level)] || 0) + count;
          });
        } else {
          console.log(`🏁 ${referralCode}의 하위 추천인코드가 없어 종료`);
        }
      } else {
        console.log(`🏁 ${referralCode}로 가입한 회원이 없어 종료`);
      }
    } catch (error) {
      console.error(`❌ 추천인코드 ${referralCode} 처리 중 오류:`, error);
      // 개별 오류는 무시하고 계속 진행
    }
  }

  console.log(`✅ 레벨 ${currentLevel} 처리 완료: ${allIndirectReferrals.length}명`);
  
  return {
    indirectReferrals: allIndirectReferrals,
    levelBreakdown
  };
}

/**
 * 특정 추천인코드로 가입한 직접 추천인들을 조회하는 함수
 * @param referralCode 추천인코드
 * @returns 직접 추천인들
 */
async function getDirectReferralsByCode(referralCode: string): Promise<any[]> {
  try {
    // 1. 수금완료계약에서 추천인코드가 일치하는 계약들 조회
    const completedContracts = await prisma.contract.findMany({
      where: {
        status: 'COMPLETED_COLLECTION'
      },
      select: {
        id: true,
        contractNumber: true,
        customerName: true,
        customerPhone: true,
        contractAmount: true,
        finalPoints: true,
        confirmedAt: true,
        status: true,
        referralCode: true,
        createdAt: true
      }
    });

    // 2. 일시납계약에서 추천인코드가 일치하는 계약들 조회
    const lumpSumContracts = await prisma.contract.findMany({
      where: {
        status: 'LUMP_SUM'
      },
      select: {
        id: true,
        contractNumber: true,
        customerName: true,
        customerPhone: true,
        contractAmount: true,
        finalPoints: true,
        confirmedAt: true,
        status: true,
        referralCode: true,
        createdAt: true
      }
    });

    // 3. 두 데이터 합치기
    const allContracts = [...completedContracts, ...lumpSumContracts];

    // 4. 파트너회원목록에서 추천인코드 매칭
    const partnerUsers = await prisma.user.findMany({
      where: {
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        referralCode: true
      }
    });

    // 5. 추천인코드가 일치하는 계약들만 필터링
    const filteredContracts = allContracts.filter(contract => {
      // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      
      // 요청한 추천인코드와 일치하는지 확인
      return contractReferralCode === referralCode;
    });

    // 6. 고객별로 그룹화하여 집계
    const aggregatedData = filteredContracts.reduce((acc, contract) => {
      const key = `${contract.customerName}_${contract.customerPhone}`;
      
      // 파트너회원목록에서 추천인코드 찾기 (고객명+연락처 매칭)
      const matchingPartner = partnerUsers.find(partner => 
        partner.name === contract.customerName && partner.phone === contract.customerPhone
      );
      
      const contractReferralCode = matchingPartner?.referralCode || contract.referralCode;
      
      if (!acc[key]) {
        acc[key] = {
          id: key,
          customerName: contract.customerName,
          customerPhone: contract.customerPhone,
          contractCount: 0,
          totalContractAmount: 0,
          totalFinalPoints: 0,
          firstContractDate: contract.createdAt,
          lastContractDate: contract.createdAt,
          referralCode: contractReferralCode, // 추천인코드 추가
          contracts: []
        };
      }
      
      acc[key].contractCount += 1;
      acc[key].totalContractAmount += contract.contractAmount;
      acc[key].totalFinalPoints += contract.finalPoints;
      acc[key].contracts.push({
        id: contract.id,
        contractNumber: contract.contractNumber,
        customerName: contract.customerName,
        customerPhone: contract.customerPhone,
        contractAmount: contract.contractAmount,
        finalPoints: contract.finalPoints,
        confirmedAt: contract.confirmedAt,
        status: contract.status,
        referralCode: contract.referralCode,
        createdAt: contract.createdAt
      });

      // 가장 오래된 가입일과 가장 최근 가입일 업데이트
      if (new Date(contract.createdAt) < new Date(acc[key].firstContractDate)) {
        acc[key].firstContractDate = contract.createdAt;
      }
      if (new Date(contract.createdAt) > new Date(acc[key].lastContractDate)) {
        acc[key].lastContractDate = contract.createdAt;
      }
      
      return acc;
    }, {} as Record<string, any>);

    return Object.values(aggregatedData);
    
  } catch (error) {
    console.error(`❌ 추천인코드 ${referralCode} 조회 중 오류:`, error);
    return [];
  }
}
