import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateLevel } from '@/lib/levelCalculator';

// 트리 노드 데이터 타입 정의
interface TreeNode {
  id: string;
  name: string;
  phone: string;
  myCode: string; // 연락처 뒤 8자리
  level: number | 'LEGEND';
  totalReferrals: number;
  directReferrals: number;
  points: number;
  joinDate: string;
  children: TreeNode[];
  isExpanded: boolean;
  parentId?: string;
  depth: number;
}

// 재귀적 트리 구조 생성 함수
async function buildTreeStructure(
  referralCode: string,
  currentDepth: number = 0,
  maxDepth: number = 10,
  visitedCodes: Set<string> = new Set()
): Promise<TreeNode | null> {
  // 깊이 제한 및 중복 방지
  if (currentDepth >= maxDepth || visitedCodes.has(referralCode)) {
    return null;
  }
  
  visitedCodes.add(referralCode);
  
  console.log(`🔍 ${currentDepth}단계 트리 노드 조회: ${referralCode}`);
  
  // 현재 추천인코드로 가입한 회원 조회 (referralCode는 상위 추천인의 코드)
  const user = await prisma.user.findFirst({
    where: {
      referralCode: referralCode,
      role: 'MEMBER',
      partnerStatus: 'APPROVED'
    },
    select: {
      id: true,
      name: true,
      phone: true,
      points: true,
      totalReferrals: true,
      createdAt: true,
      referralCode: true
    }
  });

  if (!user) {
    return null;
  }

  // 내코드 생성 (연락처 뒤 8자리)
  const myCode = user.phone.replace(/-/g, '').slice(-8);
  
  // 등급 계산
  const level = calculateLevel(user.totalReferrals);
  
  console.log(`👤 ${currentDepth}단계 회원: ${user.name} (${myCode}) - ${level}단계`);

  // 하위 추천인들 조회 (현재 사용자의 추천인코드로 가입한 회원들)
  // 사용자의 추천인코드는 연락처 뒤 8자리
  const userReferralCode = user.phone.replace(/-/g, '').slice(-8);
  
  const directReferrals = await prisma.user.findMany({
    where: {
      referralCode: userReferralCode, // 현재 사용자의 추천인코드로 가입한 회원들
      role: 'MEMBER',
      partnerStatus: 'APPROVED'
    },
    select: {
      id: true,
      name: true,
      phone: true,
      points: true,
      totalReferrals: true,
      createdAt: true,
      referralCode: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // 하위 노드들 재귀적으로 생성
  const children: TreeNode[] = [];
  for (const referral of directReferrals) {
    // 하위 회원의 추천인코드 (연락처 뒤 8자리)로 재귀 호출
    const childReferralCode = referral.phone.replace(/-/g, '').slice(-8);
    
    const childNode = await buildTreeStructure(
      childReferralCode,
      currentDepth + 1,
      maxDepth,
      new Set(visitedCodes) // 새로운 Set으로 복사
    );
    
    if (childNode) {
      children.push(childNode);
    }
  }

  // 트리 노드 생성
  const treeNode: TreeNode = {
    id: user.id,
    name: `${user.name} (${myCode})`,
    phone: user.phone,
    myCode: myCode,
    level: level,
    totalReferrals: user.totalReferrals,
    directReferrals: directReferrals.length,
    points: user.points,
    joinDate: user.createdAt.toISOString().split('T')[0],
    children: children,
    isExpanded: false,
    depth: currentDepth
  };

  return treeNode;
}

/**
 * 파트너 트리 정보 API
 * 1. 검색된 회원 정보 조회 (회원명, 연락처, 내코드로 검색)
 * 2. 트리 구조 생성 (재귀적 하위 추천인 조회)
 * 3. 트리 통계 계산
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🌳 파트너 트리 정보 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search'); // 회원명, 연락처, 내코드
    const maxDepth = parseInt(searchParams.get('maxDepth') || '5'); // 최대 깊이

    if (!searchTerm) {
      return NextResponse.json(
        { success: false, error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('📋 요청 파라미터:', { searchTerm, maxDepth });

    // 1. 검색된 회원 정보 조회
    console.log('🔍 회원 검색 시작...');
    
    let searchedUser = null;
    
    // 회원명으로 검색
    searchedUser = await prisma.user.findFirst({
      where: {
        name: {
          contains: searchTerm
        },
        role: 'MEMBER',
        partnerStatus: 'APPROVED'
      },
      select: {
        id: true,
        name: true,
        phone: true,
        points: true,
        totalReferrals: true,
        createdAt: true,
        referralCode: true
      }
    });

    // 연락처로 검색 (없으면)
    if (!searchedUser) {
      searchedUser = await prisma.user.findFirst({
        where: {
          phone: {
            contains: searchTerm
          },
          role: 'MEMBER',
          partnerStatus: 'APPROVED'
        },
        select: {
          id: true,
          name: true,
          phone: true,
          points: true,
          totalReferrals: true,
          createdAt: true,
          referralCode: true
        }
      });
    }

    // 내코드로 검색 (없으면)
    if (!searchedUser) {
      // 내코드는 연락처 뒤 8자리이므로, 연락처로 검색
      const phoneSearch = searchTerm.replace(/-/g, '');
      if (phoneSearch.length >= 8) {
        const last8Digits = phoneSearch.slice(-8);
        
        searchedUser = await prisma.user.findFirst({
          where: {
            phone: {
              endsWith: last8Digits
            },
            role: 'MEMBER',
            partnerStatus: 'APPROVED'
          },
          select: {
            id: true,
            name: true,
            phone: true,
            points: true,
            totalReferrals: true,
            createdAt: true,
            referralCode: true
          }
        });
      }
    }

    if (!searchedUser) {
      return NextResponse.json({
        success: true,
        data: {
          treeData: null,
          statistics: {
            totalMembers: 0,
            directReferrals: 0,
            indirectReferrals: 0,
            maxLevel: 0
          }
        }
      });
    }

    console.log('👤 검색된 회원:', searchedUser);

    // 2. 트리 구조 생성
    console.log('🌳 트리 구조 생성 시작...');
    
    // 검색된 회원의 추천인코드 (연락처 뒤 8자리)
    const searchedUserReferralCode = searchedUser.phone.replace(/-/g, '').slice(-8);
    
    const treeData = await buildTreeStructure(searchedUserReferralCode, 0, maxDepth);
    
    if (!treeData) {
      return NextResponse.json({
        success: true,
        data: {
          treeData: null,
          statistics: {
            totalMembers: 0,
            directReferrals: 0,
            indirectReferrals: 0,
            maxLevel: 0
          }
        }
      });
    }

    // 3. 트리 통계 계산
    const calculateTreeStats = (node: TreeNode): {
      totalMembers: number;
      directReferrals: number;
      indirectReferrals: number;
      maxLevel: number;
    } => {
      let totalMembers = 1; // 본인 포함
      let directReferrals = node.directReferrals;
      let indirectReferrals = 0;
      let maxLevel = node.depth;

      for (const child of node.children) {
        const childStats = calculateTreeStats(child);
        totalMembers += childStats.totalMembers;
        indirectReferrals += childStats.totalMembers;
        maxLevel = Math.max(maxLevel, childStats.maxLevel);
      }

      return {
        totalMembers,
        directReferrals,
        indirectReferrals,
        maxLevel
      };
    };

    const statistics = calculateTreeStats(treeData);

    console.log('📊 트리 통계:', statistics);

    return NextResponse.json({
      success: true,
      data: {
        treeData,
        statistics,
        searchedUser: {
          id: searchedUser.id,
          name: searchedUser.name,
          phone: searchedUser.phone,
          myCode: searchedUser.phone.replace(/-/g, '').slice(-8),
          level: calculateLevel(searchedUser.totalReferrals),
          totalReferrals: searchedUser.totalReferrals,
          points: searchedUser.points
        }
      }
    });

  } catch (error) {
    console.error('❌ 파트너 트리 정보 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '파트너 트리 정보 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
