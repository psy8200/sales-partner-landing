'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  User,
  Phone,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  Calculator,
  TrendingUp
} from 'lucide-react';
import { getLevelIcon, getLevelName, getLevelColor } from '@/lib/levelIcons';
import { calculateLevel } from '@/lib/levelCalculator';

// 수당수수료계산 데이터 타입 정의
interface CommissionCalculation {
  id: string;
  userName: string;
  userPhone: string;
  finalPoints: number;
  sumPoints: number; // 합산포인트 추가
  currentLevel: number;
  basicCommission: number;
  recruitmentCommission: number;
  indirectCommission: number;
  dividendBasicCommission: number;
  dividendLevelCommission: number;
  totalCommission: number;
  settlementYearMonth: string;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export default function CommissionCalculationPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSearchTerm, setFilteredSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [commissionData, setCommissionData] = useState<CommissionCalculation[]>([]);
  const [loading, setLoading] = useState(true);

  // localStorage 키
  const STORAGE_KEYS = {
    COMMISSION_DATA: 'commission_calculator_data',
    LAST_UPDATED: 'commission_calculator_last_updated'
  };

  // localStorage에서 데이터 로드
  const loadFromStorage = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEYS.COMMISSION_DATA);
      const lastUpdated = localStorage.getItem(STORAGE_KEYS.LAST_UPDATED);
      
      if (savedData && lastUpdated) {
        const data = JSON.parse(savedData);
        const updateTime = new Date(lastUpdated);
        const now = new Date();
        
        // 1시간 이내의 데이터면 사용
        if (now.getTime() - updateTime.getTime() < 60 * 60 * 1000) {
          setCommissionData(data);
          console.log('✅ localStorage에서 데이터 로드 완료:', data.length, '건');
          return true;
        }
      }
    } catch (error) {
      console.error('localStorage 로드 오류:', error);
    }
    return false;
  };

  // localStorage에 데이터 저장
  const saveToStorage = (data: CommissionCalculation[]) => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMMISSION_DATA, JSON.stringify(data));
      localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ localStorage에 데이터 저장 완료:', data.length, '건');
    } catch (error) {
      console.error('localStorage 저장 오류:', error);
    }
  };

  // 검색 함수
  const handleSearch = () => {
    setFilteredSearchTerm(searchTerm);
  };

  // 데이터 조회 함수 (지급여부 상태값 보존)
  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      
      // 🔥 기존 데이터의 지급여부 상태값 보존을 위한 맵 생성
      const existingPaymentStatusMap = new Map<string, 'PENDING' | 'PAID' | 'CANCELLED'>();
      commissionData.forEach(item => {
        existingPaymentStatusMap.set(item.id, item.paymentStatus);
      });
      
      // localStorage에서 데이터 로드 시도
      if (loadFromStorage()) {
        setLoading(false);
        return;
      }
      
      // 정산리스트 API에서 데이터 가져오기
      const settlementsResponse = await fetch('/api/admin/settlements/data?page=1&limit=1000');
      const settlementsData = await settlementsResponse.json();
      
      if (settlementsData.success && settlementsData.data) {
        // 정산리스트 데이터를 고객별로 집계 (승급관리와 동일한 방식)
        const customerMap = new Map();
        
        settlementsData.data.forEach((contract: any) => {
          const customerKey = `${contract.customerName}_${contract.customerPhone}`;
          
          if (!customerMap.has(customerKey)) {
            customerMap.set(customerKey, {
              customerName: contract.customerName,
              customerPhone: contract.customerPhone,
              totalPoints: 0,
              totalAmount: 0,
              contractCount: 0,
              referralCode: contract.referralCode,
              latestConfirmedAt: contract.confirmedAt,
              contractNumbers: []
            });
          }
          
          const customer = customerMap.get(customerKey);
          customer.totalPoints += contract.finalPoints || 0;
          customer.totalAmount += contract.contractAmount || 0;
          customer.contractCount += 1;
          customer.contractNumbers.push(contract.contractNumber);
          
          // 가장 최근 확정일로 업데이트
          if (new Date(contract.confirmedAt) > new Date(customer.latestConfirmedAt)) {
            customer.latestConfirmedAt = contract.confirmedAt;
          }
        });
        
        // 각 고객별로 레벨 계산 (승급관리와 동일한 방식)
        const transformedData: CommissionCalculation[] = await Promise.all(
          Array.from(customerMap.values()).map(async (customer, index) => {
            const myCode = customer.customerPhone.slice(-8);
            
            // 직접 추천인원 계산 (승급관리와 동일한 API 호출)
            let directReferrals = 0;
            let indirectReferrals = 0;
            
            try {
              const response = await fetch(`/api/admin/settlements/user-referrals?phoneLast8=${myCode}`);
              const data = await response.json();
              
              if (data.success && data.data) {
                directReferrals = data.data.totalDirectReferrals;
                indirectReferrals = data.data.totalIndirectReferrals;
                
                console.log(`✅ ${customer.customerName}(${myCode}) 추천인원:`, {
                  직접: directReferrals,
                  간접: indirectReferrals,
                  총합: directReferrals + indirectReferrals
                });
              }
            } catch (error) {
              console.error(`❌ ${customer.customerName}의 추천인원 계산 오류:`, error);
            }
            
            const totalReferrals = directReferrals + indirectReferrals;
            
            // 레벨 계산 (승급회원관리와 완전히 동일한 방식)
            const currentLevel = calculateLevel(totalReferrals);
            const currentLevelNum = typeof currentLevel === 'number' ? currentLevel : 10;
            
            // 합산포인트 계산 (직접 추천 + 간접 추천 회원들의 결정포인트 합계)
            let totalSumPoints = 0;
            
            try {
              // 직접 추천 회원들의 결정포인트 합계
              const directResponse = await fetch(`/api/admin/settlements/direct-referrals?phoneLast8=${myCode}`);
              const directData = await directResponse.json();
              
              if (directData.success && directData.data && directData.data.directReferrals) {
                const directPoints = directData.data.directReferrals.reduce((sum: number, user: any) => {
                  return sum + (user.totalFinalPoints || 0);
                }, 0);
                totalSumPoints += directPoints;
                
                console.log(`✅ ${customer.customerName}(${myCode}) 직접 추천 회원 포인트 합계:`, directPoints);
                
                // 간접 추천 회원들의 결정포인트 합계 (2차까지만 조회)
                const getAllIndirectPoints = async (referralCodes: string[], level: number = 1, maxLevel: number = 2): Promise<number> => {
                  if (level > maxLevel || referralCodes.length === 0) {
                    return 0;
                  }
                  
                  let indirectPoints = 0;
                  const nextLevelCodes = new Set<string>();
                  
                  for (const referralCode of referralCodes) {
                    try {
                      const response = await fetch(`/api/admin/settlements/direct-referrals?phoneLast8=${referralCode}`);
                      const data = await response.json();
                      
                      if (data.success && data.data && data.data.directReferrals) {
                        const levelPoints = data.data.directReferrals.reduce((sum: number, user: any) => {
                          return sum + (user.totalFinalPoints || 0);
                        }, 0);
                        indirectPoints += levelPoints;
                        
                        // 다음 단계를 위한 추천인코드 수집
                        data.data.directReferrals.forEach((user: any) => {
                          const nextCode = user.customerPhone.slice(-8);
                          nextLevelCodes.add(nextCode);
                        });
                      }
                    } catch (error) {
                      console.error(`❌ ${level}차 - ${referralCode} 조회 오류:`, error);
                    }
                  }
                  
                  // 다음 단계가 있으면 재귀 호출
                  if (nextLevelCodes.size > 0) {
                    const nextLevelPoints = await getAllIndirectPoints(Array.from(nextLevelCodes), level + 1, maxLevel);
                    indirectPoints += nextLevelPoints;
                  }
                  
                  return indirectPoints;
                };
                
                // 간접 추천 회원들의 포인트 합계 계산
                const directUserCodes = directData.data.directReferrals.map((user: any) => user.customerPhone.slice(-8));
                const indirectPoints = await getAllIndirectPoints(directUserCodes);
                totalSumPoints += indirectPoints;
                
                console.log(`✅ ${customer.customerName}(${myCode}) 간접 추천 회원 포인트 합계:`, indirectPoints);
                console.log(`✅ ${customer.customerName}(${myCode}) 총 합산포인트:`, totalSumPoints);
              }
            } catch (error) {
              console.error(`❌ ${customer.customerName}의 합산포인트 계산 오류:`, error);
            }
            
            // 확정년일에서 정산년월 추출 (YYYY-MM 형식)
            const confirmedDate = new Date(customer.latestConfirmedAt);
            const settlementYearMonth = `${confirmedDate.getFullYear()}-${String(confirmedDate.getMonth() + 1).padStart(2, '0')}`;
            
            return {
              id: `commission_${index}`,
              userName: customer.customerName || '',
              userPhone: customer.customerPhone || '',
              finalPoints: customer.totalPoints || 0,
              sumPoints: totalSumPoints, // 합산포인트 추가
              currentLevel: currentLevelNum,
              basicCommission: Math.round((customer.totalPoints || 0) * 0.3), // 결정포인트 X 30%
              recruitmentCommission: 0, // TODO: 모집수당 계산 로직 추가
              indirectCommission: 0, // TODO: 간접수당 계산 로직 추가
              dividendBasicCommission: 0, // TODO: 기본배당 계산 로직 추가
              dividendLevelCommission: 0, // TODO: 배당등급별 계산 로직 추가
              totalCommission: 0, // TODO: 총지급액 계산 로직 추가
              settlementYearMonth: settlementYearMonth,
              paymentStatus: existingPaymentStatusMap.get(myCode) || 'PENDING' as const, // 🔥 보존된 상태값 사용
              createdAt: customer.latestConfirmedAt || new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          })
        );
        
        setCommissionData(transformedData);
        saveToStorage(transformedData); // localStorage에 저장
        console.log('✅ 승급관리와 동일한 방식으로 데이터 변환 완료:', transformedData.length, '건');
      } else {
        console.error('❌ 정산리스트 API 응답 실패:', settlementsData);
        setCommissionData([]);
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
      setCommissionData([]);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 함수 (캐시 무시하고 최신 데이터 가져오기)
  const handleRefresh = () => {
    setFilteredSearchTerm('');
    setSearchTerm('');
    // localStorage 캐시 삭제 후 데이터 새로 로드
    localStorage.removeItem(STORAGE_KEYS.COMMISSION_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
    fetchCommissionData();
  };

  // 지급여부 상태 변경 함수 (순환)
  const handleStatusChange = (itemId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'PAID' : 
                     currentStatus === 'PAID' ? 'CANCELLED' : 'PENDING';
    
    setCommissionData(prevData => 
      prevData.map(item => 
        item.id === itemId 
          ? { ...item, paymentStatus: newStatus as 'PENDING' | 'PAID' | 'CANCELLED' }
          : item
      )
    );
    
    // localStorage 업데이트
    const updatedData = commissionData.map(item => 
      item.id === itemId 
        ? { ...item, paymentStatus: newStatus as 'PENDING' | 'PAID' | 'CANCELLED' }
        : item
    );
    localStorage.setItem(STORAGE_KEYS.COMMISSION_DATA, JSON.stringify(updatedData));
  };

  // 승인 처리 함수 (대기중 → 승인됨만)
  const handleApprove = (itemId: string, currentStatus: string) => {
    if (currentStatus !== 'PENDING') {
      alert('대기중 상태의 회원만 승인할 수 있습니다.');
      return;
    }
    
    setCommissionData(prevData => 
      prevData.map(item => 
        item.id === itemId 
          ? { ...item, paymentStatus: 'PAID' as const }
          : item
      )
    );
    
    // localStorage 업데이트
    const updatedData = commissionData.map(item => 
      item.id === itemId 
        ? { ...item, paymentStatus: 'PAID' as const }
        : item
    );
    localStorage.setItem(STORAGE_KEYS.COMMISSION_DATA, JSON.stringify(updatedData));
  };

  // 승인완료 처리 함수 (승인됨 회원들을 정산완료 페이지로 이동)
  const handleCompleteApproval = () => {
    // 승인됨 상태인 회원들만 필터링
    const approvedMembers = commissionData.filter(item => item.paymentStatus === 'PAID');
    
    if (approvedMembers.length === 0) {
      alert('승인된 회원이 없습니다.');
      return;
    }

    // 정산완료 페이지용 데이터로 변환 (현재 테이블의 모든 컬럼값을 정확하게 복사)
    const completedData = approvedMembers.map(member => ({
      id: member.id,
      userName: member.userName,
      userPhone: member.userPhone,
      finalPoints: member.finalPoints,
      sumPoints: member.sumPoints,
      currentLevel: member.currentLevel,
      basicCommission: member.basicCommission,
      recruitmentCommission: member.recruitmentCommission,
      indirectCommission: member.indirectCommission,
      dividendBasicCommission: member.dividendBasicCommission,
      dividendLevelCommission: member.dividendLevelCommission,
      totalCommission: member.totalCommission,
      settlementYearMonth: member.settlementYearMonth,
      paymentStatus: member.paymentStatus,
      createdAt: member.createdAt,
      updatedAt: new Date().toISOString()
    }));

    // 정산완료 페이지 데이터에 추가 (복사만, 원본 데이터는 유지)
    const existingCompletedData = JSON.parse(localStorage.getItem('completedSettlements') || '[]');
    const updatedCompletedData = [...existingCompletedData, ...completedData];
    localStorage.setItem('completedSettlements', JSON.stringify(updatedCompletedData));

    alert(`${approvedMembers.length}명의 승인된 회원이 정산완료 페이지로 복사되었습니다.`);
  };

  // 수당 계산 함수 (지급여부 상태값 보존)
  const handleCalculateCommission = async (commissionType: string) => {
    try {
      console.log(`🔍 ${commissionType} 계산 시작`);
      
      // 🔥 기존 지급여부 상태값 보존을 위한 맵 생성
      const existingPaymentStatusMap = new Map<string, 'PENDING' | 'PAID' | 'CANCELLED'>();
      commissionData.forEach(item => {
        existingPaymentStatusMap.set(item.id, item.paymentStatus);
      });
      
      // 현재 표시된 모든 회원에 대해 수당 계산
      const updatedData = await Promise.all(
        commissionData.map(async (item) => {
          const myCode = item.userPhone.slice(-8);
          
          try {
            let commissionValue = 0;
            
            switch (commissionType) {
              case 'recruitment':
                // 모집수당: 내가 추천해서 가입한 회원들의 포인트 합산 × 20%
                const recruitmentResponse = await fetch(`/api/admin/settlements/commission/recruitment?phoneLast8=${myCode}`);
                const recruitmentData = await recruitmentResponse.json();
                if (recruitmentData.success) {
                  commissionValue = recruitmentData.data.commission;
                }
                break;
                
              case 'indirect':
                // 간접수당: 내가 추천한 회원의 추천으로 가입한 파트너의 결정포인트값 × 10%
                const indirectResponse = await fetch(`/api/admin/settlements/commission/indirect?phoneLast8=${myCode}`);
                const indirectData = await indirectResponse.json();
                if (indirectData.success) {
                  commissionValue = indirectData.data.commission;
                }
                break;
                
              case 'dividend-basic':
                // 기본배당 계산
                const dividendBasicResponse = await fetch(`/api/admin/settlements/commission/dividend-basic?phoneLast8=${myCode}`);
                const dividendBasicData = await dividendBasicResponse.json();
                if (dividendBasicData.success) {
                  commissionValue = dividendBasicData.data.commission;
                }
                break;
                
              case 'dividend-level':
                // 배당등급별 계산
                const dividendLevelResponse = await fetch(`/api/admin/settlements/commission/dividend-level?phoneLast8=${myCode}`);
                const dividendLevelData = await dividendLevelResponse.json();
                if (dividendLevelData.success) {
                  commissionValue = dividendLevelData.data.commission;
                }
                break;
            }
            
            // 해당 수당 타입에 따라 업데이트 (지급여부 상태값 보존)
            const updatedItem = { 
              ...item, 
              paymentStatus: existingPaymentStatusMap.get(item.id) || item.paymentStatus // 🔥 보존된 상태값 사용
            };
            switch (commissionType) {
              case 'recruitment':
                updatedItem.recruitmentCommission = commissionValue;
                break;
              case 'indirect':
                updatedItem.indirectCommission = commissionValue;
                break;
              case 'dividend-basic':
                updatedItem.dividendBasicCommission = commissionValue;
                break;
              case 'dividend-level':
                updatedItem.dividendLevelCommission = commissionValue;
                break;
            }
            
            // 총지급액 재계산
            updatedItem.totalCommission = 
              updatedItem.basicCommission + 
              updatedItem.recruitmentCommission + 
              updatedItem.indirectCommission + 
              updatedItem.dividendBasicCommission + 
              updatedItem.dividendLevelCommission;
            
            return updatedItem;
            
          } catch (error) {
            console.error(`❌ ${item.userName}의 ${commissionType} 계산 오류:`, error);
            return item;
          }
        })
      );
      
      setCommissionData(updatedData);
      saveToStorage(updatedData); // localStorage에 저장
      console.log(`✅ ${commissionType} 계산 완료`);
      
    } catch (error) {
      console.error(`❌ ${commissionType} 계산 오류:`, error);
    }
  };

  // 엔터키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 필터링된 데이터
  const filteredData = commissionData.filter(item => {
    // 검색어 필터링
    const matchesSearch = !filteredSearchTerm || (() => {
      const searchLower = filteredSearchTerm.toLowerCase();
      return (
        item.userName.toLowerCase().includes(searchLower) ||
        item.userPhone.includes(filteredSearchTerm)
      );
    })();
    
    // 상태 필터링
    const matchesStatus = statusFilter === 'ALL' || item.paymentStatus === statusFilter;
    
    // 레벨 필터링
    const matchesLevel = levelFilter === 'ALL' || item.currentLevel.toString() === levelFilter;
    
    // 월 필터링
    const matchesMonth = monthFilter === 'ALL' || item.settlementYearMonth === monthFilter;
    
    return matchesSearch && matchesStatus && matchesLevel && matchesMonth;
  });

  // 개별 선택 처리
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // 전체 선택 처리
  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData.map(item => item.id));
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원';
  };

  // 결정포인트 합계 계산
  const totalFinalPoints = commissionData.reduce((sum, item) => sum + item.finalPoints, 0);
  
  // 합산포인트 합계 계산
  const totalSumPoints = commissionData.reduce((sum, item) => sum + item.sumPoints, 0);
  
  // 총지급액 합계 계산
  const totalPaymentAmount = commissionData.reduce((sum, item) => sum + item.totalCommission, 0);

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          대기중
        </span>;
      case 'PAID':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          승인됨
        </span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          지급보류
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchCommissionData();
  }, []);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">💰 수당수수료계산</h1>
              <p className="text-sm text-gray-600 mt-1">
                4개 수당(기본수당, 모집수당, 간접수당, 배당수당)을 통합 관리하는 수당계산 시스템
              </p>
            </div>
            
            {/* 데이터 정보 표시 영역 */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">총인원:</span>
                <span className="font-semibold text-blue-600">{commissionData.length}명</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">결정포인트합계:</span>
                <span className="font-semibold text-green-600">{totalFinalPoints.toLocaleString()}P</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">합산포인트합계:</span>
                <span className="font-semibold text-purple-600">{totalSumPoints.toLocaleString()}P</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">총지급액합계:</span>
                <span className="font-semibold text-orange-600">{formatAmount(totalPaymentAmount)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            1.기본수당=결정포인트X30% | 2.모집수당=내추천으로가입한파트너의결정포인트X20% | 3.간접수당=내가추천한회원의추천으로가입한파트너의결정포인트값X10% | 4.기본배당
          </p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {/* 검색바 (작게) */}
            <div className="w-80 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="회원명, 연락처 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 필터 드롭다운들 */}
            <div className="flex gap-2">
            {/* 지급상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="지급상태 필터"
            >
              <option value="ALL">전체 지급상태</option>
              <option value="PENDING">대기중</option>
                <option value="PAID">승인됨</option>
                <option value="CANCELLED">지급보류</option>
            </select>

            {/* 레벨 필터 */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="레벨 필터"
            >
              <option value="ALL">전체 레벨</option>
              <option value="0">레벨 0</option>
              <option value="1">레벨 1</option>
              <option value="2">레벨 2</option>
              <option value="3">레벨 3</option>
              <option value="4">레벨 4</option>
              <option value="5">레벨 5</option>
            </select>

            {/* 정산월 필터 */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                aria-label="정산월 필터"
            >
              <option value="ALL">전체 기간</option>
              <option value="2025-01">2025년 1월</option>
              <option value="2025-02">2025년 2월</option>
              <option value="2025-03">2025년 3월</option>
            </select>
          </div>

            {/* 수당 계산 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleCalculateCommission('recruitment')}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <Calculator className="w-4 h-4 mr-1" />
                모집수당계산
              </button>
              <button
                onClick={() => handleCalculateCommission('indirect')}
                className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                <Calculator className="w-4 h-4 mr-1" />
                간접수당계산
              </button>
              <button
                onClick={() => handleCalculateCommission('dividend-basic')}
                className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
              >
                <Calculator className="w-4 h-4 mr-1" />
                기본배당계산
              </button>
              <button
                onClick={() => handleCalculateCommission('dividend-level')}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <Calculator className="w-4 h-4 mr-1" />
                배당등급별계산
              </button>
            </div>

            {/* 기본 버튼들 */}
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                <Search className="w-4 h-4 mr-1" />
                검색
              </button>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                새로고침
              </button>
              <button
                onClick={handleCompleteApproval}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                승인완료
              </button>
              <button
                onClick={() => {}}
                className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                다운로드
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 메인 테이블 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="전체 선택"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  회원정보
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  결정포인트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  합산포인트
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  현재등급
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  1.기본수당
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  2.모집수당
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  3.간접수당
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  4.기본배당
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  5.배당등급별
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총지급액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  확정년월
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  지급여부
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label={`${item.userName} 선택`}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                      {item.userName} / {item.userPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.finalPoints)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.sumPoints)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <span className="text-2xl">
                        {getLevelIcon(item.currentLevel)}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        LV:{item.currentLevel}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.basicCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.recruitmentCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.indirectCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.dividendBasicCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.dividendLevelCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-blue-600">
                      {formatAmount(item.totalCommission)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {item.settlementYearMonth}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(item.paymentStatus)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleStatusChange(item.id, item.paymentStatus)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => handleApprove(item.id, item.paymentStatus)}
                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        승인
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">수당 데이터를 불러오는 중...</h3>
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && filteredData.length === 0 && (
          <div className="text-center py-12">
            <Calculator className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">수당 데이터가 없습니다</h3>
            <p className="mt-1 text-sm text-gray-500">
              검색 조건을 변경하거나 다른 필터를 시도해보세요.
            </p>
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            이전
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            다음
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{filteredData.length}</span>개 결과
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                이전
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                다음
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
