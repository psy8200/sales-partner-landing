import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 3트리 구조용 트리 노드 타입
interface TreeNode {
  id: string;
  name: string;
  phone: string;
  myCode: string;
  referralCode: string;
  points: number;
  totalReferrals: number;
  level: number;
  position: 1 | 2 | 3; // 트리 내 위치 (1, 2, 3)
  children: TreeNode[];
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    console.log('🌳 3트리 구조 모형 API 호출 시작');
    
    const { searchParams } = new URL(request.url);
    const maxDepth = parseInt(searchParams.get('maxDepth') || '3');
    
    console.log('📋 요청 파라미터:', { maxDepth });

    // 회사 대표의 직접 추천인들 조회 (11번, 12번, 13번)
    console.log('🌳 3트리 구조 생성 시작...');
    
    // 회사대표(87587200)의 직접 추천인들 조회
    const directReferrals = await prisma.user.findMany({
      where: {
        referralCode: '87587200',
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
      orderBy: { createdAt: 'asc' }, // 가입 순서대로 정렬
      take: 3 // 최대 3명만
    });

    console.log(`👥 회사대표의 직접 추천인 ${directReferrals.length}명 발견`);

    // 재귀적으로 3트리 구조 생성하는 함수 (모든 박스를 빈 박스로)
    const build3TreeRecursive = async (parentMyCode: string, level: number, maxLevel: number): Promise<TreeNode[]> => {
      if (level > maxLevel) {
        return [];
      }

      console.log(`📦 ${parentMyCode}의 ${level}단계 → 3개 빈 박스 생성`);

      // 3트리 구조에 맞게 항상 3개의 빈 박스 생성
      const children = [];
      for (let i = 0; i < 3; i++) {
        // 하위 레벨 재귀 호출
        const subChildren = level < maxLevel ? await build3TreeRecursive(`empty-${parentMyCode}-${level}-${i + 1}`, level + 1, maxLevel) : [];
        
        children.push({
          id: `empty-${parentMyCode}-${level}-${i + 1}`,
          name: '빈 자리',
          phone: '',
          myCode: '',
          referralCode: parentMyCode,
          points: 0,
          totalReferrals: 0,
          level: level,
          position: (i + 1) as 1 | 2 | 3,
          children: subChildren
        });
      }

      return children;
    };

    // 3단계까지만 제한된 3트리 구조 생성 (브라우저 성능 고려)
    const limitedDepth = Math.min(maxDepth, 3);
    const children = await build3TreeRecursive('87587200', 1, limitedDepth);

    const treeData = {
      id: 'company',
      name: '회사대표',
      phone: '010-8758-7200',
      myCode: '87587200',
      referralCode: '00000000',
      points: 100000,
      totalReferrals: children.length,
      level: 0,
      position: 1 as 1 | 2 | 3,
      children: children
    };

    // 트리 통계 계산
    const calculateTreeStats = (node: TreeNode): {
      totalMembers: number;
      directReferrals: number;
      indirectReferrals: number;
      maxLevel: number;
    } => {
      let totalMembers = 1; // 본인 포함
      let directReferrals = node.children ? node.children.length : 0;
      let indirectReferrals = 0;
      let maxLevel = node.level;

      // 자식 노드들 재귀적으로 계산 (null 체크 추가)
      if (node.children) {
        for (const child of node.children) {
          if (child) { // null 체크 추가
            const childStats = calculateTreeStats(child);
            totalMembers += childStats.totalMembers;
            indirectReferrals += childStats.totalMembers;
            maxLevel = Math.max(maxLevel, childStats.maxLevel);
          }
        }
      }

      return {
        totalMembers,
        directReferrals,
        indirectReferrals,
        maxLevel
      };
    };

    const statistics = calculateTreeStats(treeData);
    
    console.log('📊 3트리 통계:', statistics);

    return NextResponse.json({
      success: true,
      data: {
        treeData,
        statistics
      }
    });

  } catch (error) {
    console.error('❌ 3트리 구조 모형 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '3트리 구조 모형 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}