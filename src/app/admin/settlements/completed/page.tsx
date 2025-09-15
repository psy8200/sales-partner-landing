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
import AccountInfoModal from '@/components/AccountInfoModal';

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
  requestStatus: '정산대기' | '정산가능' | '출금요청' | '지급완료'; // 요청정보 상태 추가
  createdAt: string;
  updatedAt: string;
}

export default function CompletedSettlementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSearchTerm, setFilteredSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [commissionData, setCommissionData] = useState<CommissionCalculation[]>([]);
  
  // 계좌정보 모달 관련 상태
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{name: string, phone: string} | null>(null);
  const [accountInfo, setAccountInfo] = useState<{bankName: string, accountNumber: string, accountHolder: string} | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  
  // 저장된 계좌정보 상태
  const [savedAccountInfo, setSavedAccountInfo] = useState<{[key: string]: {bankName: string, accountNumber: string, accountHolder: string}}>({});

  // 목업 데이터
  const mockCommissionData: CommissionCalculation[] = [
    {
      id: '1',
      userName: '김철수',
      userPhone: '010-1111-1234',
      finalPoints: 100000,
      sumPoints: 500000,
      currentLevel: 3,
      basicCommission: 30000,
      recruitmentCommission: 60000,
      indirectCommission: 30000,
      dividendBasicCommission: 10000,
      dividendLevelCommission: 20000,
      totalCommission: 150000,
      settlementYearMonth: '2025-01',
      paymentStatus: 'PAID',
      requestStatus: '정산대기',
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T09:00:00Z'
    },
    {
      id: '2',
      userName: '이영희',
      userPhone: '010-2222-5678',
      finalPoints: 150000,
      sumPoints: 800000,
      currentLevel: 4,
      basicCommission: 45000,
      recruitmentCommission: 90000,
      indirectCommission: 45000,
      dividendBasicCommission: 15000,
      dividendLevelCommission: 30000,
      totalCommission: 225000,
      settlementYearMonth: '2025-01',
      paymentStatus: 'PAID',
      requestStatus: '정산대기',
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T09:00:00Z'
    },
    {
      id: '3',
      userName: '박민수',
      userPhone: '010-3333-9012',
      finalPoints: 200000,
      sumPoints: 1200000,
      currentLevel: 5,
      basicCommission: 60000,
      recruitmentCommission: 120000,
      indirectCommission: 60000,
      dividendBasicCommission: 20000,
      dividendLevelCommission: 40000,
      totalCommission: 300000,
      settlementYearMonth: '2025-01',
      paymentStatus: 'PAID',
      requestStatus: '정산대기',
      createdAt: '2025-01-15T09:00:00Z',
      updatedAt: '2025-01-15T09:00:00Z'
    }
  ];

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // localStorage에서 정산완료 데이터 로드
        const completedData = localStorage.getItem('completedSettlements');
        
        if (completedData) {
          const parsedData = JSON.parse(completedData);
          setCommissionData(parsedData);
          console.log('✅ 정산완료 데이터 로드 완료:', parsedData.length, '건');
        } else {
          // 데이터가 없으면 빈 배열로 초기화
          setCommissionData([]);
          console.log('✅ 정산완료 데이터 없음 - 빈 상태로 초기화');
        }

        // 저장된 계좌정보 로드
        const savedAccountData = localStorage.getItem('savedAccountInfo');
        if (savedAccountData) {
          setSavedAccountInfo(JSON.parse(savedAccountData));
        }
      } catch (error) {
        console.error('데이터 로드 오류:', error);
        setCommissionData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 검색 및 필터링
  const filteredData = commissionData.filter(item => {
    const matchesSearch = !filteredSearchTerm || 
      item.userName.toLowerCase().includes(filteredSearchTerm.toLowerCase()) ||
      item.userPhone.includes(filteredSearchTerm);
    
    return matchesSearch;
  });

  // 선택 관련 함수들
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredData.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(item => selectedItems.includes(item.id));
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < filteredData.length;

  // 검색 핸들러
  const handleSearch = () => {
    setFilteredSearchTerm(searchTerm);
  };

  // 정산완료내역보내기 핸들러
  const handleSendCompleted = async () => {
    if (commissionData.length === 0) {
      alert('전송할 정산완료 데이터가 없습니다.');
      return;
    }

    const confirmSend = confirm(`현재 테이블의 ${commissionData.length}명의 정산완료내역을 회원 페이지로 보내시겠습니까?`);
    if (!confirmSend) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/settlements/send-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedData: commissionData, // 현재 테이블에 표시된 모든 데이터 전송
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`정산완료내역이 성공적으로 전송되었습니다. (${result.sentCount}명)`);
        // 데이터 새로고침
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`오류가 발생했습니다: ${error.message || error.error}`);
      }
    } catch (error) {
      console.error('정산완료내역 전송 오류:', error);
      alert('정산완료내역 전송 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 확인저장 핸들러 (선택된 항목들을 서버에 저장하고 정산가능으로 변경)
  const handleRefresh = async () => {
    if (selectedItems.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }

    const confirmUpdate = confirm(`선택된 ${selectedItems.length}개 항목을 정산가능으로 변경하고 서버에 저장하시겠습니까?`);
    if (!confirmUpdate) {
      return;
    }

    try {
      setLoading(true);
      
      // 선택된 항목들의 데이터 준비
      const selectedData = commissionData.filter(item => selectedItems.includes(item.id));
      
      console.log('📤 서버에 저장할 데이터:', selectedData);
      
      // 서버에 저장
      const response = await fetch('/api/admin/settlements/save-completed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedItems: selectedData,
          processedBy: 'admin' // 실제로는 현재 로그인한 관리자 정보
        })
      });

      const result = await response.json();
      console.log('🔍 API 응답 결과:', result);
      console.log('🔍 응답 상태:', response.status);
      console.log('🔍 응답 헤더:', response.headers);
      
      if (result.success && result.data.savedCount > 0) {
        // 서버 저장 성공시 로컬 데이터도 업데이트
        const updatedData = commissionData.map(item => {
          if (selectedItems.includes(item.id)) {
            return {
              ...item,
              requestStatus: '정산가능' as const,
              updatedAt: new Date().toISOString()
            };
          }
          return item;
        });

        setCommissionData(updatedData);
        
        // localStorage에도 저장 (백업용)
        localStorage.setItem('completedSettlements', JSON.stringify(updatedData));
        
        // 선택 항목 초기화
        setSelectedItems([]);
        
        alert(`✅ ${result.data.savedCount}개 항목이 서버에 저장되고 정산가능으로 변경되었습니다.`);
        console.log('✅ 서버 저장 완료:', result);
      } else {
        // 저장 실패 또는 0개 저장
        const errorMessage = result.message || result.error || '서버에 저장되지 않았습니다.';
        alert(`❌ 저장 실패: ${errorMessage}`);
        console.error('❌ 서버 저장 실패:', result);
      }
    } catch (error) {
      console.error('❌ 확인저장 오류:', error);
      alert('❌ 저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 선택된 데이터 삭제 핸들러
  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    const confirmDelete = confirm(`선택된 ${selectedItems.length}개 항목을 삭제하시겠습니까?`);
    if (!confirmDelete) {
      return;
    }

    // 선택된 항목들을 제외한 데이터로 업데이트
    const updatedData = commissionData.filter(item => !selectedItems.includes(item.id));
    setCommissionData(updatedData);
    
    // localStorage 업데이트
    localStorage.setItem('completedSettlements', JSON.stringify(updatedData));
    
    // 선택 항목 초기화
    setSelectedItems([]);
    
    alert(`${selectedItems.length}개 항목이 삭제되었습니다.`);
  };

  // 계좌정보 조회 함수
  const handleAccountInfo = async (userName: string, userPhone: string) => {
    setSelectedUser({ name: userName, phone: userPhone });
    setIsAccountModalOpen(true);
    setAccountLoading(true);
    setAccountInfo(null);

    try {
      // 새로운 계좌정보 API 호출
      const response = await fetch(`/api/admin/members/account-info?name=${encodeURIComponent(userName)}&phone=${encodeURIComponent(userPhone)}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setAccountInfo({
          bankName: data.data.bankName,
          accountNumber: data.data.accountNumber,
          accountHolder: data.data.accountHolder
        });
      }
    } catch (error) {
      console.error('계좌정보 조회 오류:', error);
    } finally {
      setAccountLoading(false);
    }
  };

  // 계좌정보 저장 함수
  const handleSaveAccountInfo = (accountInfo: {bankName: string, accountNumber: string, accountHolder: string}) => {
    if (!selectedUser) return;
    
    const userKey = `${selectedUser.name}_${selectedUser.phone}`;
    const updatedSavedInfo = {
      ...savedAccountInfo,
      [userKey]: accountInfo
    };
    
    setSavedAccountInfo(updatedSavedInfo);
    localStorage.setItem('savedAccountInfo', JSON.stringify(updatedSavedInfo));
    
    console.log('✅ 계좌정보 저장 완료:', userKey, accountInfo);
  };


  // 금액 포맷팅
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + 'P';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 상태별 색상
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return '승인됨';
      case 'PENDING': return '대기중';
      case 'CANCELLED': return '지급보류';
      default: return status;
    }
  };

  // 통계 계산
  const totalMembers = filteredData.length;
  const totalFinalPoints = filteredData.reduce((sum, item) => sum + item.finalPoints, 0);
  const totalCommission = filteredData.reduce((sum, item) => sum + item.totalCommission, 0);

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
              <h1 className="text-3xl font-bold text-gray-900">✅ 정산완료</h1>
              <p className="text-gray-600 mt-2">승인 완료된 정산 내역을 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-500">총인원</div>
                <div className="text-lg font-bold text-gray-900">{totalMembers.toLocaleString()}명</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">결정포인트합계</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(totalFinalPoints)}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">총지급액합계</div>
                <div className="text-lg font-bold text-gray-900">{formatCurrency(totalCommission)}</div>
              </div>
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="회원명 또는 연락처로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                확인저장
              </button>
              <button
                onClick={handleSendCompleted}
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                <DollarSign className="w-4 h-4 mr-1" />
                정산완료내역보내기
              </button>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle className="w-4 h-4 mr-1" />
                삭제하기
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
        </motion.div>

        {/* 메인 테이블 */}
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
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        aria-label="모든 항목 선택"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
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
                      <DollarSign className="h-4 w-4" />
                      결정포인트
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      기본수당
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      모집수당
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      간접수당
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      기본배당
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      배당등급별
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      총지급액
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      정산월
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      요청정보
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal className="h-4 w-4" />
                      정산관리
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                        <span>데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-400" />
                        <span>검색 결과가 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                          aria-label={`항목 ${item.id} 선택`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.userPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(item.finalPoints)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 font-semibold">{formatCurrency(item.basicCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-green-600 font-semibold">{formatCurrency(item.recruitmentCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-purple-600 font-semibold">{formatCurrency(item.indirectCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-600 font-semibold">{formatCurrency(item.dividendBasicCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-red-600 font-semibold">{formatCurrency(item.dividendLevelCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(item.totalCommission)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.settlementYearMonth}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.requestStatus === '정산대기' ? 'bg-yellow-100 text-yellow-800' :
                            item.requestStatus === '정산가능' ? 'bg-green-100 text-green-800' :
                            item.requestStatus === '출금요청' ? 'bg-blue-100 text-blue-800' :
                            item.requestStatus === '지급완료' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.requestStatus || '정산대기'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleAccountInfo(item.userName, item.userPhone)}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            계좌정보
                          </button>
                          <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600">
                            수정
                          </button>
                          <button className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">
                            지급
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 선택된 항목 정보 */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.length}개 항목이 선택되었습니다.
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  선택 항목 Excel 다운로드
                </button>
                <button 
                  onClick={() => setSelectedItems([])}
                  className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50"
                >
                  선택 해제
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 계좌정보 모달 */}
        <AccountInfoModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          userName={selectedUser?.name || ''}
          userPhone={selectedUser?.phone || ''}
          accountInfo={accountInfo}
          loading={accountLoading}
          onSaveAccountInfo={handleSaveAccountInfo}
        />
      </div>
    </div>
  );
}
