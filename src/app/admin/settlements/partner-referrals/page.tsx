'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, RefreshCw, Users, UserCheck, TrendingUp, Award } from 'lucide-react'
import { getLevelIcon, getLevelColor, getLevelName } from '@/lib/levelIcons'
import { calculateLevel } from '@/lib/levelCalculator'

// 타입 정의
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
  matchingCode?: string // 매칭에 사용된 추천인코드
  level?: number // 추천 단계 (1차, 2차, 3차...)
  contractNumbers?: string[] // 계약번호 배열
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface Statistics {
  totalDirectReferrals: number
  totalIndirectReferrals: number
  totalTreeReferrals: number
}

// localStorage 키
const STORAGE_KEYS = {
  USER_INFO: 'partner_referrals_user_info',
  DIRECT_REFERRALS: 'partner_referrals_direct_referrals',
  INDIRECT_REFERRALS: 'partner_referrals_indirect_referrals',
  SEARCH_INPUT: 'partner_referrals_search_input',
  STATISTICS: 'partner_referrals_statistics'
}

export default function PartnerReferralsPage() {
  // 상태 관리
  const [searchTerm, setSearchTerm] = useState('')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [searchResults, setSearchResults] = useState<UserInfo[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [referredUsers, setReferredUsers] = useState<ReferralUser[]>([])
  const [indirectReferrals, setIndirectReferrals] = useState<ReferralUser[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [statistics, setStatistics] = useState<Statistics>({
    totalDirectReferrals: 0,
    totalIndirectReferrals: 0,
    totalTreeReferrals: 0
  })
  const [loading, setLoading] = useState(false)
  const [directLoading, setDirectLoading] = useState(false)
  const [indirectLoading, setIndirectLoading] = useState(false)

  // localStorage에서 데이터 로드
  const loadFromStorage = () => {
    try {
      const savedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO)
      const savedDirectReferrals = localStorage.getItem(STORAGE_KEYS.DIRECT_REFERRALS)
      const savedIndirectReferrals = localStorage.getItem(STORAGE_KEYS.INDIRECT_REFERRALS)
      const savedSearchInput = localStorage.getItem(STORAGE_KEYS.SEARCH_INPUT)
      const savedStatistics = localStorage.getItem(STORAGE_KEYS.STATISTICS)

      if (savedUserInfo) setUserInfo(JSON.parse(savedUserInfo))
      if (savedDirectReferrals) setReferredUsers(JSON.parse(savedDirectReferrals))
      if (savedIndirectReferrals) setIndirectReferrals(JSON.parse(savedIndirectReferrals))
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
    setReferredUsers([])
    setIndirectReferrals([])
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

  // 검색 핸들러
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
          
          // 추천 정보 초기화
          setReferredUsers([])
          setIndirectReferrals([])
          setStatistics({
            totalDirectReferrals: 0,
            totalIndirectReferrals: 0,
            totalTreeReferrals: 0
          })
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

  // 사용자 선택 핸들러
  const handleUserSelect = (user: UserInfo) => {
    setUserInfo(user)
    setSearchTerm(`${user.customerName} (${user.customerPhone})`)
    setShowSearchResults(false)
    setSearchResults([])
    
    // localStorage에 저장
    saveToStorage(STORAGE_KEYS.USER_INFO, user)
    saveToStorage(STORAGE_KEYS.SEARCH_INPUT, `${user.customerName} (${user.customerPhone})`)
    
    // 추천 정보 초기화
    setReferredUsers([])
    setIndirectReferrals([])
    setStatistics({
      totalDirectReferrals: 0,
      totalIndirectReferrals: 0,
      totalTreeReferrals: 0
    })
  }

  // 새로고침 핸들러
  const handleRefresh = () => {
    setUserInfo(null)
    setReferredUsers([])
    setIndirectReferrals([])
    setSearchTerm('')
    setSearchResults([])
    setShowSearchResults(false)
    setStatistics({
      totalDirectReferrals: 0,
      totalIndirectReferrals: 0,
      totalTreeReferrals: 0
    })
    clearStorage()
  }

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // 직접 추천 회원 로드 (정산리스트에서 추천인코드로 조회)
  const handleLoadDirectReferrals = async () => {
    if (!userInfo) return

    setDirectLoading(true)
    try {
      // 회원정보박스의 추천인코드 (연락처 뒤 8자리)
      const referralCode = userInfo.customerPhone.slice(-8)
      console.log('🔍 정산리스트에서 추천인코드로 직접 추천 회원 조회:', referralCode)
      
      const response = await fetch(`/api/admin/settlements/direct-referrals?phoneLast8=${referralCode}`)
      const data = await response.json()

      if (data.success && data.data && data.data.directReferrals) {
        console.log('✅ 정산리스트에서 조회된 직접 추천 회원:', data.data.directReferrals)
        
        // 정산리스트 데이터를 테이블 컬럼에 맞게 변환
        const transformedData = data.data.directReferrals.map((user: any) => ({
          customerName: user.customerName,
          customerPhone: user.customerPhone,
          contractCount: user.contractCount,
          finalPoints: user.totalFinalPoints, // totalFinalPoints 사용
          createdAt: user.firstContractDate, // firstContractDate 사용
          contractNumbers: user.contracts?.map((c: any) => c.contractNumber) || []
        }))

        setReferredUsers(transformedData)
        setStatistics(prev => ({
          ...prev,
          totalDirectReferrals: transformedData.length
        }))
        
        // localStorage에 저장
        saveToStorage(STORAGE_KEYS.DIRECT_REFERRALS, transformedData)
        saveToStorage(STORAGE_KEYS.STATISTICS, {
          ...statistics,
          totalDirectReferrals: transformedData.length
        })
      } else {
        console.log('❌ 정산리스트에서 직접 추천 회원을 찾을 수 없음')
        setReferredUsers([])
      }
    } catch (error) {
      console.error('정산리스트에서 직접 추천 회원 로드 오류:', error)
    } finally {
      setDirectLoading(false)
    }
  }

  // 전체 추천 체인 회원 로드 (재귀적으로 모든 단계 조회)
  const handleLoadIndirectReferrals = async () => {
    if (referredUsers.length === 0) {
      alert('직접 추천 회원을 먼저 로드해주세요.')
      return
    }

    setIndirectLoading(true)
    try {
      // 재귀적으로 모든 추천 체인을 조회하는 함수
      const getAllReferralChain = async (referralCodes: string[], topLevelMatchingCode: string, level: number = 1, maxLevel: number = 10): Promise<any[]> => {
        if (level > maxLevel || referralCodes.length === 0) {
          return []
        }

        console.log(`🔍 ${level}차 추천 회원 조회 시작 (최상위 매칭코드: ${topLevelMatchingCode}):`, referralCodes)
        const allReferrals = []
        const nextLevelCodes = new Set<string>() // 중복 방지를 위해 Set 사용

        for (const referralCode of referralCodes) {
          try {
            const response = await fetch(`/api/admin/settlements/direct-referrals?phoneLast8=${referralCode}`)
            const data = await response.json()

            if (data.success && data.data && data.data.directReferrals) {
              console.log(`✅ ${level}차 - ${referralCode}로 조회된 추천 회원:`, data.data.directReferrals.length, '명')
              
              // 정산리스트 데이터를 테이블 컬럼에 맞게 변환
              const transformedData = data.data.directReferrals.map((user: any) => ({
                customerName: user.customerName,
                customerPhone: user.customerPhone,
                contractCount: user.contractCount,
                finalPoints: user.totalFinalPoints,
                createdAt: user.firstContractDate,
                contractNumbers: user.contracts?.map((c: any) => c.contractNumber) || [],
                matchingCode: topLevelMatchingCode, // 항상 최상위 추천인의 내코드 (내가 추천한 회원의 내코드)
                level: level // 추천 단계 표시
              }))

              allReferrals.push(...transformedData)

              // 다음 단계를 위한 추천인코드 수집 (각 회원의 내코드)
              transformedData.forEach((user: any) => {
                const nextCode = user.customerPhone.slice(-8)
                nextLevelCodes.add(nextCode)
              })
            }
          } catch (error) {
            console.error(`❌ ${level}차 - ${referralCode} 조회 오류:`, error)
          }
        }

        // 다음 단계가 있으면 재귀 호출 (최상위 매칭코드 유지)
        if (nextLevelCodes.size > 0) {
          const nextLevelReferrals = await getAllReferralChain(Array.from(nextLevelCodes), topLevelMatchingCode, level + 1, maxLevel)
          allReferrals.push(...nextLevelReferrals)
        }

        return allReferrals
      }

      // 각 직접 추천 회원별로 개별적으로 추천 체인 조회
      const allIndirectReferrals = []
      
      for (const directUser of referredUsers) {
        const directUserCode = directUser.customerPhone.slice(-8)
        console.log(`🚀 ${directUser.customerName}(${directUserCode})의 추천 체인 조회 시작`)
        
        // 각 직접 추천 회원을 최상위 매칭코드로 하여 추천 체인 조회
        const userReferralChain = await getAllReferralChain([directUserCode], directUserCode)
        allIndirectReferrals.push(...userReferralChain)
        
        console.log(`✅ ${directUser.customerName}의 추천 체인 완료:`, userReferralChain.length, '명')
      }

      console.log('✅ 전체 추천 체인 회원 조회 완료:', allIndirectReferrals.length, '명')

      setIndirectReferrals(allIndirectReferrals)
      setStatistics(prev => ({
        ...prev,
        totalIndirectReferrals: allIndirectReferrals.length,
        totalTreeReferrals: prev.totalDirectReferrals + allIndirectReferrals.length
      }))
      
      // localStorage에 저장
      saveToStorage(STORAGE_KEYS.INDIRECT_REFERRALS, allIndirectReferrals)
      saveToStorage(STORAGE_KEYS.STATISTICS, {
        ...statistics,
        totalIndirectReferrals: allIndirectReferrals.length,
        totalTreeReferrals: statistics.totalDirectReferrals + allIndirectReferrals.length
      })
    } catch (error) {
      console.error('전체 추천 체인 회원 로드 오류:', error)
    } finally {
      setIndirectLoading(false)
    }
  }

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
          <h1 className="text-4xl font-bold text-gray-900">파트너 추천 리스트</h1>
        </div>

        {/* 검색 및 회원 정보 섹션 */}
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
                      <span className="text-gray-500">내 등급:</span>
                      <div className="ml-2 flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getLevelColor(myLevel)}`}>
                          {getLevelIcon(myLevel)}
                        </div>
                        <span className="font-medium">추천인원 {statistics.totalTreeReferrals}명</span>
                      </div>
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

        {/* 메인 테이블들 - 좌우 배치 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 내가 추천한 회원 목록 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    내가 추천한 회원 목록
                  </h2>
                  <div className="text-sm text-gray-600">
                    추천인코드: <span className="font-medium text-gray-900">{userInfo?.customerPhone?.slice(-8) || '-'}</span>
                  </div>
                </div>
                <button
                  onClick={handleLoadDirectReferrals}
                  disabled={!userInfo || directLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {directLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  정보불러오기
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">회원명</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">가입일</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">결정포인트</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">내코드</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">내등급</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referredUsers.length > 0 ? (
                      referredUsers.map((user, index) => {
                        // 해당 회원이 추천한 인원 수 계산 (매칭코드가 해당 회원의 내코드인 indirectReferrals 개수)
                        const userReferralCount = indirectReferrals.filter(indirect => 
                          indirect.matchingCode === user.customerPhone.slice(-8)
                        ).length
                        
                        // 해당 회원의 실제 등급 계산 (추천한 인원 수 기준)
                        const userLevel = calculateLevel(userReferralCount)
                        
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-4 font-medium text-gray-900 text-sm">{user.customerName}</td>
                            <td className="py-2 px-4 text-gray-600 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 text-gray-600 text-sm">{user.finalPoints.toLocaleString()}P</td>
                            <td className="py-2 px-4 text-gray-600 text-sm">{user.customerPhone.slice(-8)}</td>
                            <td className="py-2 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${getLevelColor(userLevel)}`}>
                                  {getLevelIcon(userLevel)}
                                </div>
                                <span className="text-gray-900 text-sm">추천인원 {userReferralCount}명</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                          {userInfo ? '정보불러오기 버튼을 클릭하여 직접 추천 회원을 확인하세요.' : '회원을 검색한 후 직접 추천 회원을 확인하세요.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 내가 추천한 회원 이하 전체 회원 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  내가 추천한 회원 이하 전체 회원
                </h2>
                <button
                  onClick={handleLoadIndirectReferrals}
                  disabled={referredUsers.length === 0 || indirectLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  {indirectLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  전체추천체인불러오기
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">매칭코드</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">회원명</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">가입일</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">결정포인트</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">내코드</th>
                      <th className="text-left py-2 px-4 font-medium text-gray-900 text-sm">추천단계</th>
                    </tr>
                  </thead>
                  <tbody>
                    {indirectReferrals.length > 0 ? (
                      indirectReferrals.map((user, index) => {
                        return (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-4 text-gray-600 text-sm font-mono">{user.matchingCode || '-'}</td>
                            <td className="py-2 px-4 font-medium text-gray-900 text-sm">{user.customerName}</td>
                            <td className="py-2 px-4 text-gray-600 text-sm">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-4 text-gray-600 text-sm">{user.finalPoints.toLocaleString()}P</td>
                            <td className="py-2 px-4 text-gray-600 text-sm">{user.customerPhone.slice(-8)}</td>
                            <td className="py-2 px-4 text-gray-600 text-sm">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.level === 1 ? 'bg-blue-100 text-blue-800' :
                                user.level === 2 ? 'bg-green-100 text-green-800' :
                                user.level === 3 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.level}차 추천
                              </span>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                          {referredUsers.length > 0 ? '추천매칭불러오기 버튼을 클릭하여 전체 추천 체인 회원을 확인하세요.' : '직접 추천 회원을 먼저 로드한 후 전체 추천 체인을 확인하세요.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

