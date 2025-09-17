'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  User,
  Phone,
  Calendar,
  Target,
  Users,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  UserPlus,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { getLevelIcon, getLevelName, getLevelColor } from '@/lib/levelIcons';
import { calculateLevel } from '@/lib/levelCalculator';

// 타입 정의 (partner-referrals와 동일)
interface UserInfo {
  customerName: string
  customerPhone: string
  finalPoints: number
  referralCode: string
}

interface ReferralUser {
  customerName: string
  customerPhone: string
  contractCount: number
  finalPoints: number
  createdAt: string
  referralCode: string
  matchingCode?: string
  level?: number
  contractNumbers?: string[]
}

interface Statistics {
  totalDirectReferrals: number
  totalIndirectReferrals: number
  totalTreeReferrals: number
}

// localStorage 키
const STORAGE_KEYS = {
  USER_INFO: 'partner_tree_user_info',
  SEARCH_INPUT: 'partner_tree_search_input',
  STATISTICS: 'partner_tree_statistics'
}

// 회원 데이터 타입 정의
interface MemberData {
  id: string;
  name: string;
  phone: string;
  referralCode: string;
  level: number;
  totalReferrals: number;
  directReferrals: number;
  contracts: number;
  points: number;
  joinDate: string;
  parentId?: string;
  levelDepth: number;
}

// 레벨 박스 데이터 타입
interface LevelBox {
  level: number;
  label: string;
  count: number;
  totalPoints: number;
  isActive: boolean;
  members: MemberData[];
  isLoading: boolean;
}

export default function PartnerTreePage() {
  // 상태 관리 (partner-referrals와 동일)
  const [searchTerm, setSearchTerm] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [searchResults, setSearchResults] = useState<UserInfo[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [levelBoxes, setLevelBoxes] = useState<LevelBox[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    totalDirectReferrals: 0,
    totalIndirectReferrals: 0,
    totalTreeReferrals: 0
  });
  // 동적 회원 리스트 상태 (무한 확장 가능)
  const [accordionStates, setAccordionStates] = useState<{
    show: boolean;
    data: any[];
    loading: boolean;
  }[]>([]);

  // localStorage에서 데이터 로드
  const loadFromStorage = () => {
    try {
      const savedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      const savedSearchInput = localStorage.getItem(STORAGE_KEYS.SEARCH_INPUT)
      const savedStatistics = localStorage.getItem(STORAGE_KEYS.STATISTICS)

      if (savedUserInfo) setUserInfo(JSON.parse(savedUserInfo))
      if (savedSearchInput) setSearchTerm(savedSearchInput)
      if (savedStatistics) setStatistics(JSON.parse(savedStatistics))
    } catch (error) {
      console.error('localStorage 로드 오류:', error)
    }
  }

  // localStorage에 데이터 저장
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('localStorage 저장 오류:', error)
    }
  }

  // localStorage 초기화
  const clearStorage = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    setUserInfo(null)
    setSearchTerm('')
    setStatistics({
      totalDirectReferrals: 0,
      totalIndirectReferrals: 0,
      totalTreeReferrals: 0
    })
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadFromStorage()
  }, [])

  // 검색 핸들러 (partner-referrals와 동일)
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('검색어를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/settlements/data?page=1&limit=1000&search=${encodeURIComponent(searchTerm)}`)
      const data = await response.json()
      
      if (data.success && data.data && data.data.length > 0) {
        setSearchResults(data.data)
        
        if (data.data.length === 1) {
          // 결과가 1개면 자동 선택
          const user = data.data[0]
          setUserInfo(user)
          saveToStorage(STORAGE_KEYS.USER_INFO, user)
          saveToStorage(STORAGE_KEYS.SEARCH_INPUT, searchTerm)
          setShowSearchResults(false)
          
          // 레벨 박스 로드
          loadLevelBoxes(user.customerName, user.customerPhone)
        } else {
          // 결과가 여러 개면 선택 목록 표시
          setShowSearchResults(true)
        }
      } else {
        alert('검색 결과가 없습니다.')
        setSearchResults([])
        setShowSearchResults(false)
      }
    } catch (error) {
      console.error('검색 오류:', error)
      alert('검색 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 사용자 선택 핸들러 (partner-referrals와 동일)
  const handleUserSelect = (user: UserInfo) => {
    setUserInfo(user)
    setSearchTerm(`${user.customerName} (${user.customerPhone})`)
    setShowSearchResults(false)
    setSearchResults([])
    
    // localStorage에 저장
    saveToStorage(STORAGE_KEYS.USER_INFO, user)
    saveToStorage(STORAGE_KEYS.SEARCH_INPUT, `${user.customerName} (${user.customerPhone})`)
    
    // 레벨 박스 로드
    loadLevelBoxes(user.customerName, user.customerPhone)
  }

  // 새로고침 핸들러 (partner-referrals와 동일)
  const handleRefresh = () => {
    setUserInfo(null)
    setSearchTerm('')
    setSearchResults([])
    setShowSearchResults(false)
    setLevelBoxes([])
    setStatistics({
      totalDirectReferrals: 0,
      totalIndirectReferrals: 0,
      totalTreeReferrals: 0
    })
    clearStorage()
  }

  // Enter 키 처리 (partner-referrals와 동일)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 동적 아코디언 토글 핸들러 (무한 확장)
  const handleAccordionToggle = async (level: number) => {
    if (!userInfo) return;

    const currentState = accordionStates[level - 1];
    if (!currentState) return;

    if (!currentState.show) {
      // 아코디언 열기
      setAccordionStates(prev => {
        const newStates = [...prev];
        newStates[level - 1] = { ...newStates[level - 1], loading: true };
        return newStates;
      });

      try {
        let targetCodes: string[] = [];
        
        if (level === 1) {
          // 1차 회원: 상단 회원정보의 전화번호 뒤 8자리를 내 코드로 사용
          const myCode = userInfo.customerPhone.slice(-8);
          targetCodes = [myCode];
          console.log('🔍 1차 회원 조회 - 내 코드:', myCode);
        } else {
          // N차 회원: (N-1)차 회원들의 전화번호 뒤 8자리를 "내 코드"로 추출
          const prevLevelData = accordionStates[level - 2]?.data || [];
          targetCodes = prevLevelData.map(member => member.customerPhone.slice(-8));
          console.log(`🔍 ${level}차 회원 조회 - ${level-1}차 회원들의 "내 코드":`, targetCodes);
        }
        
        // /api/admin/settlements/data API를 사용하여 전체 데이터 조회
        const response = await fetch(`/api/admin/settlements/data?page=1&limit=1000&search=`);
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          // N차 회원 필터링: targetCodes를 "추천인코드"로 가진 회원들
          const levelMembers = data.data.filter((member: any) => {
            return targetCodes.includes(member.referralCode);
          });
          
          console.log(`✅ ${level}차 회원들:`, levelMembers);
          
          setAccordionStates(prev => {
            const newStates = [...prev];
            newStates[level - 1] = { 
              show: true, 
              data: levelMembers, 
              loading: false 
            };
            
            // N차 회원이 있으면 (N+1)차 아코디언 자동 생성
            if (levelMembers.length > 0 && !newStates[level]) {
              newStates[level] = { show: false, data: [], loading: false };
            }
            
            return newStates;
          });
        } else {
          console.log(`❌ ${level}차 회원이 없음`);
          setAccordionStates(prev => {
            const newStates = [...prev];
            newStates[level - 1] = { 
              show: true, 
              data: [], 
              loading: false 
            };
            return newStates;
          });
        }
      } catch (error) {
        console.error(`${level}차 회원 데이터 로드 오류:`, error);
        setAccordionStates(prev => {
          const newStates = [...prev];
          newStates[level - 1] = { 
            show: true, 
            data: [], 
            loading: false 
          };
          return newStates;
        });
      }
    } else {
      // 아코디언 닫기
      setAccordionStates(prev => {
        const newStates = [...prev];
        newStates[level - 1] = { 
          show: false, 
          data: [], 
          loading: false 
        };
        // 해당 레벨 이후의 모든 아코디언도 닫기
        for (let i = level; i < newStates.length; i++) {
          newStates[i] = { show: false, data: [], loading: false };
        }
        return newStates;
      });
    }
  }

  // 색상 배열 (무한 확장)
  const getAccordionColor = (level: number) => {
    const colors = [
      'blue',    // 1차
      'green',   // 2차
      'purple',  // 3차
      'orange',  // 4차
      'red',     // 5차
      'indigo',  // 6차
      'pink',    // 7차
      'teal',    // 8차
      'yellow',  // 9차
      'gray',    // 10차
    ];
    return colors[(level - 1) % colors.length];
  }

  // 1차 회원 리스트 초기화
  useEffect(() => {
    if (userInfo) {
      setAccordionStates([{ show: false, data: [], loading: false }]);
    }
  }, [userInfo]);

  // 레벨 박스 데이터 로드
  const loadLevelBoxes = useCallback(async (userName: string, userPhone: string) => {
    try {
      setLoading(true);
      setError(null);

      // 1단계: 전체 트리 데이터 조회
      const response = await fetch(`/api/admin/settlements/partner-tree-data?userName=${encodeURIComponent(userName)}&userPhone=${encodeURIComponent(userPhone)}`);
      const data = await response.json();

      if (data.success) {
        const members = data.data.members || [];
        
        // 2단계: 레벨별로 그룹화
        const levelGroups: Record<number, MemberData[]> = {};
        members.forEach((member: MemberData) => {
          const level = member.levelDepth;
          if (!levelGroups[level]) {
            levelGroups[level] = [];
          }
          levelGroups[level].push(member);
        });

        // 3단계: 레벨 박스 생성 (최대 20개)
        const boxes: LevelBox[] = [];
        for (let level = 1; level <= 20; level++) {
          const levelMembers = levelGroups[level] || [];
          const totalPoints = levelMembers.reduce((sum, member) => sum + member.points, 0);
          
          boxes.push({
            level,
            label: `${level}차 추천인`,
            count: levelMembers.length,
            totalPoints,
            isActive: levelMembers.length > 0,
            members: levelMembers,
            isLoading: false
          });
        }

        setLevelBoxes(boxes);
        console.log('✅ 레벨 박스 생성 완료:', boxes.filter(b => b.isActive).length, '개');
      }
    } catch (error) {
      console.error('레벨 박스 로드 오류:', error);
      setError('데이터 로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 레벨 회원 상세 조회
  const loadLevelMembers = useCallback(async (level: number) => {
    if (!userInfo) return;

    try {
      // 해당 레벨 박스의 로딩 상태 업데이트
      setLevelBoxes(prev => prev.map(box => 
        box.level === level ? { ...box, isLoading: true } : box
      ));

      // API 호출 (레벨별 상세 조회)
      const response = await fetch(`/api/admin/settlements/partner-tree-level?userName=${encodeURIComponent(userInfo.customerName)}&userPhone=${encodeURIComponent(userInfo.customerPhone)}&level=${level}`);
      const data = await response.json();

      if (data.success) {
        const members = data.data.members || [];
        const totalPoints = members.reduce((sum: number, member: MemberData) => sum + member.points, 0);

        // 해당 레벨 박스 업데이트
        setLevelBoxes(prev => prev.map(box => 
          box.level === level 
            ? { 
                ...box, 
                members, 
                count: members.length,
                totalPoints,
                isLoading: false 
              } 
            : box
        ));

        setSelectedLevel(level);
        console.log(`✅ ${level}차 추천인 상세 조회 완료:`, members.length, '명');
      }
    } catch (error) {
      console.error(`${level}차 추천인 조회 오류:`, error);
      setError(`${level}차 추천인 조회 중 오류가 발생했습니다.`);
      
      // 로딩 상태 해제
      setLevelBoxes(prev => prev.map(box => 
        box.level === level ? { ...box, isLoading: false } : box
      ));
    }
  }, [userInfo]);

  // 검색 결과 렌더링
  const renderSearchResults = () => {
    if (!showSearchResults || searchResults.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
        {searchResults.map((result, index) => (
          <div
            key={index}
            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            onClick={() => handleUserSelect(result)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{result.customerName}</div>
                <div className="text-sm text-gray-500">{result.customerPhone}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-blue-600">{result.finalPoints?.toLocaleString()}P</div>
                <div className="text-xs text-gray-500">계약완료</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 레벨 박스 렌더링
  const renderLevelBox = (box: LevelBox) => {
    if (!box.isActive) return null;

    return (
      <motion.div
        key={box.level}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: box.level * 0.1 }}
        className={`bg-white border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
          selectedLevel === box.level 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        onClick={() => loadLevelMembers(box.level)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{box.label}</h3>
              <p className="text-sm text-gray-500">
                {box.count}명 • {box.totalPoints.toLocaleString()}P
              </p>
            </div>
            </div>
          <div className="flex items-center space-x-2">
            {box.isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </motion.div>
    );
  };

  // 선택된 레벨의 회원 목록 렌더링
  const renderSelectedLevelMembers = () => {
    if (selectedLevel === null) return null;

    const selectedBox = levelBoxes.find(box => box.level === selectedLevel);
    if (!selectedBox || selectedBox.members.length === 0) return null;

  return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-white border border-gray-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedBox.label} 상세 ({selectedBox.members.length}명)
          </h3>
          <div className="text-sm text-gray-500">
            총 포인트: {selectedBox.totalPoints.toLocaleString()}P
          </div>
        </div>

        <div className="grid gap-4">
          {selectedBox.members.map((member) => (
            <div key={member.id} className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
            <div>
                    <div className="font-medium text-gray-900">{member.name}</div>
                    <div className="text-sm text-gray-500">{member.phone}</div>
                    <div className="text-xs text-gray-400">
                      추천인코드: {member.referralCode} • 가입일: {member.joinDate}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-blue-600">
                    {member.points.toLocaleString()}P
                  </div>
                  <div className="text-sm text-gray-500">
                    직접추천: {member.directReferrals}명
                  </div>
                  <div className="text-xs text-gray-400">
                    계약: {member.contracts}건
                  </div>
                </div>
            </div>
            </div>
          ))}
          </div>
        </motion.div>
    );
  };

  // 등급 계산
  const myLevel = userInfo ? calculateLevel(statistics.totalTreeReferrals) : 0
  const myLevelName = getLevelName(myLevel)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full mx-auto px-8"
      >
        {/* 헤더 */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">파트너 모집정보</h1>
        </div>

        {/* 검색 및 회원 정보 섹션 (partner-referrals와 동일) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* 검색바 */}
            <div className="flex-shrink-0">
          <div className="flex flex-col lg:flex-row gap-4">
                <div className="w-96">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                      placeholder="회원명 또는 연락처로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleSearch}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-blue-600 rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    검색
              </button>
              <button 
                onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                    <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>
            </div>

            {/* 검색 결과 목록 (동명이인 처리) */}
            {showSearchResults && searchResults.length > 1 && (
              <div className="w-full mt-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="text-blue-500">🔍</div>
                    <h3 className="text-lg font-medium text-blue-900">
                      검색 결과가 {searchResults.length}개 있습니다. 정확한 회원을 선택해주세요.
                    </h3>
                  </div>
                  <div className="grid gap-2 max-h-60 overflow-y-auto">
                    {searchResults.map((user, index) => (
                      <div
                        key={index}
                        onClick={() => handleUserSelect(user)}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-sm">
                              {user.customerName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.customerName}</div>
                            <div className="text-sm text-gray-500">{user.customerPhone}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">기본 포인트</div>
                          <div className="font-medium text-gray-900">{user.finalPoints.toLocaleString()}P</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 회원 정보 테이블 */}
            <div className="flex-1">
              {userInfo ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-wrap items-center gap-6 text-base">
                    <div>
                      <span className="text-gray-500">회원명:</span>
                      <span className="ml-2 font-medium">{userInfo.customerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">연락처:</span>
                      <span className="ml-2 font-medium">{userInfo.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">기본 포인트:</span>
                      <span className="ml-2 font-medium">{userInfo.finalPoints.toLocaleString()}P</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">총인원:</span>
                      <span className="ml-2 font-medium text-orange-600">
                        {accordionStates.reduce((total, state) => total + state.data.length, 0)}명
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">합산포인트:</span>
                      <span className="ml-2 font-medium text-orange-600">
                        {accordionStates.reduce((total, state) => {
                          return total + state.data.reduce((sum, member) => sum + (member.finalPoints || 0), 0);
                        }, 0).toLocaleString()}P
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-500 text-base">
                  회원을 검색하여 정보를 확인하세요
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 동적 아코디언 테이블 (무한 확장) */}
        {userInfo && accordionStates.map((state, index) => {
          const level = index + 1;
          const color = getAccordionColor(level);
          const shouldShow = level === 1 || (level > 1 && accordionStates[level - 2]?.data?.length > 0);
          
          if (!shouldShow) return null;
          
          return (
            <div key={level} className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
              {/* 아코디언 헤더 (버튼) */}
              <div className="p-6 border-b border-gray-200">
                <button 
                  onClick={() => handleAccordionToggle(level)}
                  disabled={state.loading}
                  className={`w-full flex items-center justify-between p-4 border border-${color}-600 rounded-lg text-lg font-medium text-white bg-${color}-600 hover:bg-${color}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 transition-colors disabled:opacity-50`}
                >
                  <div className="flex items-center">
                    <Users className="h-6 w-6 mr-3" />
                    {level}차 회원 리스트
                    {state.data.length > 0 && (
                      <>
                        <span className={`ml-3 px-2 py-1 bg-${color}-500 text-white text-sm rounded-full`}>
                          {state.data.length}명
                        </span>
                        <span className="ml-2 text-sm font-medium text-white">
                          합산포인트 {state.data.reduce((sum, member) => sum + (member.finalPoints || 0), 0).toLocaleString()}P
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center">
                    {state.loading && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    )}
                    <ChevronRight className={`h-5 w-5 transition-transform ${state.show ? 'rotate-90' : ''}`} />
                  </div>
                </button>
              </div>

              {/* 아코디언 콘텐츠 (테이블) */}
              {state.show && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6">
                    {state.data.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                회원명
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                연락처
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                추천인코드
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                포인트
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                계약수
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                                가입일
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {state.data.map((member, memberIndex) => (
                              <tr key={memberIndex} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                  {member.customerName}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                  {member.customerPhone}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                  {member.referralCode}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                  {member.finalPoints?.toLocaleString() || 0}P
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                  {member.contractCount || 1}건
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                                  {member.confirmedAt ? new Date(member.confirmedAt).toLocaleDateString() : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{level}차 추천인이 없습니다</h3>
                        <p className="text-gray-500">{level === 1 ? '이 회원의 1차 추천인 정보가 없습니다.' : `${level-1}차 회원들의 ${level}차 추천인 정보가 없습니다.`}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })}


      </motion.div>
    </div>
  );
}