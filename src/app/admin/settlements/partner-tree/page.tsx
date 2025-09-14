'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  User,
  Phone,
  Calendar,
  FileText,
  Target,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getLevelIcon, getLevelName, getLevelColor } from '@/lib/levelIcons';
import { calculateLevel } from '@/lib/levelCalculator';

// 동적 패딩을 위한 CSS 클래스 생성 함수
const getTreeNodeClassName = (depth: number) => {
  return `flex items-center gap-2 pl-[${depth * 20}px]`;
};

// 트리 노드 데이터 타입 정의
interface TreeNode {
  id: string;
  name: string;
  phone: string;
  level: number | 'LEGEND'; // 1, 2, 3, 4, 5... 또는 LEGEND
  totalReferrals: number;  // 총 추천수
  directReferrals: number; // 직접 추천수
  contracts: number;       // 계약수
  points: number;          // 포인트
  joinDate: string;        // 가입일
  children: TreeNode[];    // 하위 노드들
  isExpanded: boolean;     // 확장 상태
  parentId?: string;       // 부모 노드 ID
}

// 승급 아이콘 매핑 (개발가이드 기준)
const getLevelIconInfo = (level: number | 'LEGEND') => {
  return {
    icon: getLevelIcon(level),
    color: getLevelColor(level),
    name: getLevelName(level)
  };
};

// 목업 트리 데이터 (새로운 레벨 시스템 적용)
const mockTreeData: TreeNode = {
  id: 'root',
  name: '나 (11111234)',
  phone: '010-1111-1234',
  level: calculateLevel(15), // 15명 추천 = 3단계
  totalReferrals: 15,
  directReferrals: 3,
  contracts: 5,
  points: 100000,
  joinDate: '2025-01-01',
  isExpanded: false,
  children: [
    {
      id: 'A-1',
      name: '김철수',
      phone: '010-2222-5678',
      level: calculateLevel(8), // 8명 추천 = 3단계
      totalReferrals: 8,
      directReferrals: 2,
      contracts: 3,
      points: 50000,
      joinDate: '2025-01-02',
      isExpanded: false,
      children: [
        {
          id: 'A-1-1',
          name: '이영희',
          phone: '010-3333-9012',
          level: calculateLevel(3), // 3명 추천 = 2단계
          totalReferrals: 3,
          directReferrals: 1,
          contracts: 2,
          points: 30000,
          joinDate: '2025-01-05',
          isExpanded: false,
          children: [],
          parentId: 'A-1'
        },
        {
          id: 'A-1-2',
          name: '박민수',
          phone: '010-4444-3456',
          level: calculateLevel(2), // 2명 추천 = 1단계
          totalReferrals: 2,
          directReferrals: 0,
          contracts: 1,
          points: 20000,
          joinDate: '2025-01-06',
          isExpanded: false,
          children: [],
          parentId: 'A-1'
        }
      ],
      parentId: 'root'
    },
    {
      id: 'A-2',
      name: '최지영',
      phone: '010-5555-7890',
      level: calculateLevel(5), // 5명 추천 = 3단계
      totalReferrals: 5,
      directReferrals: 1,
      contracts: 2,
      points: 40000,
      joinDate: '2025-01-03',
      isExpanded: false,
      children: [
        {
          id: 'A-2-1',
          name: '정수현',
          phone: '010-6666-1234',
          level: calculateLevel(1), // 1명 추천 = 1단계
          totalReferrals: 1,
          directReferrals: 0,
          contracts: 1,
          points: 15000,
          joinDate: '2025-01-07',
          isExpanded: false,
          children: [],
          parentId: 'A-2'
        }
      ],
      parentId: 'root'
    },
    {
      id: 'A-3',
      name: '한소영',
      phone: '010-7777-5678',
      level: calculateLevel(2), // 2명 추천 = 1단계
      totalReferrals: 2,
      directReferrals: 0,
      contracts: 1,
      points: 25000,
      joinDate: '2025-01-04',
      isExpanded: false,
      children: [],
      parentId: 'root'
    }
  ]
};

export default function PartnerTreePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [statistics, setStatistics] = useState<any>(null);

  // 검색 실행 함수
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    
    try {
      console.log('🔍 파트너 트리 검색 시작:', searchTerm);
      
      const response = await fetch(`/api/admin/settlements/partner-tree?search=${encodeURIComponent(searchTerm)}&maxDepth=5`);
      const result = await response.json();
      
      if (result.success) {
        setTreeData(result.data.treeData);
        setSearchedUser(result.data.searchedUser);
        setStatistics(result.data.statistics);
        setExpandedNodes(new Set());
        
        console.log('✅ 트리 데이터 로드 성공:', result.data);
      } else {
        console.error('❌ 검색 실패:', result.error);
        alert('검색 중 오류가 발생했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('❌ API 호출 오류:', error);
      alert('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  // 새로고침 함수
  const handleRefresh = () => {
    setSearchTerm('');
    setTreeData(null);
    setSearchedUser(null);
    setStatistics(null);
    setExpandedNodes(new Set());
    setIsSearching(false);
  };

  // 검색 필터링 (실제 데이터에서는 API에서 필터링하므로 여기서는 단순히 반환)
  const filteredTreeData = React.useMemo(() => {
    return treeData;
  }, [treeData]);

  // 노드 확장/축소
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // 트리 테이블 행 생성
  const renderTreeNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const levelInfo = getLevelIconInfo(node.level);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;

    return (
      <React.Fragment key={node.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className={getTreeNodeClassName(depth)}>
              {hasChildren ? (
                <button
                  onClick={() => toggleNode(node.id)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              ) : (
                <div className="w-6" />
              )}
              <span className={`text-2xl ${levelInfo.color}`}>
                {levelInfo.icon}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {node.level === 'LEGEND' ? 'LEGEND' : `${node.level}단계`} ({levelInfo.name})
              </span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{node.name}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{node.phone}</div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-green-600">
              {new Intl.NumberFormat('ko-KR').format(node.points * 6)}p
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">
              {node.totalReferrals}명
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-blue-600">
              {new Intl.NumberFormat('ko-KR').format(node.points * 3.5)}p
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {hasChildren ? (
              <button
                onClick={() => toggleNode(node.id)}
                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                {isExpanded ? '축소' : '확장'}
              </button>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </td>
        </tr>
        {isExpanded && node.children.map(child => renderTreeNode(child, depth + 1))}
      </React.Fragment>
    );
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">파트너 트리 정보</h1>
              <p className="text-gray-600 mt-2">파트너 트리 구조를 조회하고 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Download className="h-4 w-4 mr-2" />
                Excel 다운로드
              </button>
            </div>
          </div>
        </motion.div>

        {/* 검색 및 필터 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색바 - 풀사이즈의 30% */}
            <div className="w-full lg:w-[30%]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="회원명, 연락처 또는 내코드로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {/* 검색바 우측 버튼들 */}
            <div className="flex gap-3">
              <button 
                onClick={handleSearch}
                disabled={isSearching}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isSearching ? '검색중...' : '검색'}
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                필터
              </button>
              <button 
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
              </button>
            </div>
          </div>
        </motion.div>

        {/* 트리 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🏆</span>
                      레벨
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      회원명
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      연락처
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      포인트합계
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      추천수
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💰</span>
                      트리수당
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4" />
                      액션
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTreeData ? renderTreeNode(filteredTreeData) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">🔍</span>
                        <span className="text-lg font-medium">회원을 검색해주세요</span>
                        <span className="text-sm">회원명, 연락처 또는 내코드로 검색하세요</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 트리 정보 요약 */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-sm font-medium text-blue-900">
                  트리 요약: 총 {statistics.totalMembers}명 - {searchedUser ? getLevelIconInfo(searchedUser.level).name : ''} {searchedUser && searchedUser.level === 'LEGEND' ? 'LEGEND' : searchedUser ? `${searchedUser.level}단계` : ''}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    // 전체 확장 로직
                    if (treeData) {
                      const allNodeIds = new Set<string>();
                      const collectNodeIds = (node: TreeNode) => {
                        allNodeIds.add(node.id);
                        node.children.forEach(collectNodeIds);
                      };
                      collectNodeIds(treeData);
                      setExpandedNodes(allNodeIds);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  전체 확장
                </button>
                <button 
                  onClick={() => setExpandedNodes(new Set())}
                  className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50"
                >
                  전체 축소
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
