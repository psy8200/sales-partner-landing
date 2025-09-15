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

// 수당수수료계산 데이터 타입 정의
interface CommissionCalculation {
  id: string;
  userName: string;
  userPhone: string;
  finalPoints: number;
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

  // 검색 함수
  const handleSearch = () => {
    setFilteredSearchTerm(searchTerm);
  };

  // 데이터 조회 함수
  const fetchCommissionData = async () => {
    try {
      setLoading(true);
      
      // TODO: 실제 API 호출로 대체
      // const response = await fetch('/api/admin/settlements/commission-calculation');
      // const data = await response.json();
      
      // 임시 목업 데이터
      const mockData: CommissionCalculation[] = [
        {
          id: '1',
          userName: '박수용',
          userPhone: '01011111234',
          finalPoints: 91000,
          currentLevel: 2,
          basicCommission: 50000,
          recruitmentCommission: 25000,
          indirectCommission: 15000,
          dividendBasicCommission: 10000,
          dividendLevelCommission: 5000,
          totalCommission: 105000,
          settlementYearMonth: '2025-01',
          paymentStatus: 'PENDING',
          createdAt: '2025-01-15T10:00:00Z',
          updatedAt: '2025-01-15T10:00:00Z'
        },
        {
          id: '2',
          userName: '정미선',
          userPhone: '01022221234',
          finalPoints: 14500,
          currentLevel: 1,
          basicCommission: 30000,
          recruitmentCommission: 15000,
          indirectCommission: 8000,
          dividendBasicCommission: 5000,
          dividendLevelCommission: 2000,
          totalCommission: 60000,
          settlementYearMonth: '2025-01',
          paymentStatus: 'PAID',
          createdAt: '2025-01-14T09:00:00Z',
          updatedAt: '2025-01-14T15:30:00Z'
        }
      ];
      
      setCommissionData(mockData);
    } catch (error) {
      console.error('Error fetching commission data:', error);
      setCommissionData([]);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 함수
  const handleRefresh = () => {
    setFilteredSearchTerm('');
    setSearchTerm('');
    fetchCommissionData();
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
          지급완료
        </span>;
      case 'CANCELLED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          취소
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
            <div className="flex items-center space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Calculator className="w-4 h-4 mr-2" />
                수당계산
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            {/* 검색바 */}
            <div className="flex-1 relative">
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

            {/* 버튼 영역 */}
            <div className="flex-1 flex justify-start gap-3">
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                검색
              </button>
              <button
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                새로고침
              </button>
            </div>
          </div>

          {/* 필터 영역 */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 지급상태 필터 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="지급상태 필터"
            >
              <option value="ALL">전체 지급상태</option>
              <option value="PENDING">대기중</option>
              <option value="PAID">지급완료</option>
              <option value="CANCELLED">취소</option>
            </select>

            {/* 레벨 필터 */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="정산월 필터"
            >
              <option value="ALL">전체 기간</option>
              <option value="2025-01">2025년 1월</option>
              <option value="2025-02">2025년 2월</option>
              <option value="2025-03">2025년 3월</option>
            </select>
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
                  4.배당기본
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  5.배당등급별
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  총지급액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정산년월
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
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.userName}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {item.userPhone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatAmount(item.finalPoints)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      레벨 {item.currentLevel}
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
                      <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                        수정
                      </button>
                      <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                        지급
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

