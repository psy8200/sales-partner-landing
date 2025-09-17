'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Search } from 'lucide-react';

interface Contract {
  id: string;
  contractNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  itemCategory: string;
  companyName: string;
  itemName: string;
  contractAmount: number;
  commissionRate: number;
  commissionAmount: number;
  expectedRate: number;
  pointRate: number;
  payoutRate: number;
  finalPoints: number;
  contractDate: string;
  startDate: string;
  endDate: string;
  installationDate: string;
  status: string;
  confirmedAt: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  dynamicFields?: string;
  createdByUser?: {
    id: string;
    name: string;
    phone: string;
  };
}

export default function CollectionContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmedDateFilter, setConfirmedDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());

  // 확정일시 필터를 위한 월별 그룹핑 목록 생성
  const getMonthlyConfirmedDates = () => {
    const monthlyGroups: { [key: string]: number } = {};
    
    contracts
      .map(contract => contract.confirmedAt)
      .filter(date => date)
      .forEach(date => {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const monthKey = `${year}년 ${month}월`;
        
        monthlyGroups[monthKey] = (monthlyGroups[monthKey] || 0) + 1;
      });
    
    return Object.entries(monthlyGroups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split('년 ').map(s => parseInt(s.replace(/월/g, '')));
        const [yearB, monthB] = b.month.split('년 ').map(s => parseInt(s.replace(/월/g, '')));
        
        if (yearA !== yearB) return yearB - yearA;
        return monthB - monthA;
      });
  };

  // 확정일시 필터링된 계약 목록 (월별)
  const filteredContracts = contracts.filter(contract => {
    if (!confirmedDateFilter) return true;
    
    const contractDate = new Date(contract.confirmedAt);
    const contractYear = contractDate.getFullYear();
    const contractMonth = contractDate.getMonth() + 1;
    const contractMonthKey = `${contractYear}년 ${contractMonth}월`;
    
    return contractMonthKey === confirmedDateFilter;
  });

  // 계약 목록 조회
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: 'COLLECTION'
      });

      const response = await fetch(`/api/admin/collections/collection-contracts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('수금관리계약 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // 선택박스 관련 함수들
  const handleSelectContract = (contractId: string, checked: boolean) => {
    const newSelected = new Set(selectedContracts);
    if (checked) {
      newSelected.add(contractId);
    } else {
      newSelected.delete(contractId);
    }
    setSelectedContracts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContracts(new Set(contracts.map(contract => contract.id)));
    } else {
      setSelectedContracts(new Set());
    }
  };

  const isAllSelected = filteredContracts.length > 0 && filteredContracts.every(contract => selectedContracts.has(contract.id));
  const isIndeterminate = selectedContracts.size > 0 && selectedContracts.size < filteredContracts.length;

  // 계약 되돌리기 함수
  const handleRevertContract = async (contractId: string) => {
    // confirm() 대신 alert() 사용하여 클릭 문제 해결
    alert('이 계약을 계약목록으로 되돌리시겠습니까?');

    try {
      const response = await fetch('/api/admin/contracts/revert-to-all-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractIds: [contractId] }),
      });

      if (response.ok) {
        alert('계약이 all-contracts로 되돌려졌습니다.');
        fetchContracts();
      } else {
        alert('계약 되돌리기 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('계약 되돌리기 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 수금확정 함수
  const handleConfirmCollection = async (contractId: string) => {
    // confirm() 대신 alert() 사용하여 클릭 문제 해결
    alert('이 계약을 수금확정하시겠습니까?');

    try {
      const response = await fetch(`/api/admin/contracts/${contractId}/confirm-collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert('수금확정이 완료되었습니다.');
        
        // 수금확정된 계약을 목록에서 제거 (즉시 UI 업데이트)
        setContracts(prevContracts => 
          prevContracts.filter(contract => contract.id !== contractId)
        );
        
        // 선택 상태에서도 제거
        setSelectedContracts(prev => {
          const newSet = new Set(prev);
          newSet.delete(contractId);
          return newSet;
        });
      } else {
        const error = await response.json();
        alert(error.error || '수금확정에 실패했습니다.');
      }
    } catch (error) {
      console.error('수금확정 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 선택된 계약들을 일괄 수금확정하는 함수
  const handleBulkConfirmCollection = async () => {
    if (selectedContracts.size === 0) {
      alert('수금확정할 계약을 선택해주세요.');
      return;
    }

    // confirm() 대신 alert() 사용하여 클릭 문제 해결
    alert(`선택된 ${selectedContracts.size}개 계약을 수금확정하시겠습니까?`);

    try {
      const selectedContractIds = Array.from(selectedContracts);
      const promises = selectedContractIds.map(contractId =>
        fetch(`/api/admin/contracts/${contractId}/confirm-collection`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(
        responses.map(async (res, index) => {
          try {
            const data = await res.json();
            return { success: res.ok, data, contractId: selectedContractIds[index] };
          } catch (error) {
            console.error('JSON 파싱 오류:', error);
            return { success: false, data: null, contractId: selectedContractIds[index] };
          }
        })
      );

      const successCount = results.filter(r => r.success).length;
      const failCount = results.length - successCount;

      if (successCount > 0) {
        alert(`${successCount}개 계약이 수금확정되었습니다.${failCount > 0 ? ` (${failCount}개 실패)` : ''}`);
        
        // 성공한 계약들을 목록에서 제거 (즉시 UI 업데이트)
        const successfulContractIds = results
          .filter(r => r.success)
          .map(r => r.contractId);
        
        setContracts(prevContracts => 
          prevContracts.filter(contract => !successfulContractIds.includes(contract.id))
        );
        
        // 선택 상태 초기화
        setSelectedContracts(new Set());
      } else {
        alert('수금확정에 실패했습니다.');
      }
    } catch (error) {
      console.error('일괄 수금확정 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">수금관리계약</h1>
          </div>
          <p className="text-gray-600">확정된 계약의 수금 관리</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="고객명, 계약번호, 회사명, 상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchContracts();
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={() => fetchContracts()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="검색"
            >
              <Search className="h-4 w-4" />
              검색
            </button>
            <select
              value={confirmedDateFilter}
              onChange={(e) => setConfirmedDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="확정일시 필터 (월별)"
            >
              <option value="">수금해당월</option>
              {getMonthlyConfirmedDates().map(({ month, count }) => (
                <option key={month} value={month}>
                  {month} ({count}건)
                </option>
              ))}
            </select>
            <button
              onClick={handleBulkConfirmCollection}
              disabled={selectedContracts.size === 0}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedContracts.size === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              title="선택된 계약들을 수금확정"
            >
              <span>선택수금확정</span>
              {selectedContracts.size > 0 && (
                <span className="bg-white text-green-600 rounded-full px-2 py-1 text-xs font-semibold">
                  {selectedContracts.size}
                </span>
              )}
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isIndeterminate;
                      }}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      aria-label="모든 계약 선택"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">고객명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">연락처</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">카테고리</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">증권번호</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">계약금액</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">최종결정포인트</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">납입기간</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">계약일</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">확정일시</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">상태값</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">관리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                      <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium">수금관리계약이 없습니다</p>
                      <p className="text-sm">계약목록에서 계약을 확정하면 여기에 표시됩니다.</p>
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((contract) => {
                    let dynamicFields: Record<string, unknown> = {};
                    try {
                      dynamicFields = contract.dynamicFields ? JSON.parse(contract.dynamicFields) : {};
                    } catch (error) {
                      console.error('dynamicFields 파싱 오류:', error);
                      dynamicFields = {};
                    }
                    return (
                      <tr key={contract.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap w-8">
                          <input
                            type="checkbox"
                            checked={selectedContracts.has(contract.id)}
                            onChange={(e) => handleSelectContract(contract.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            aria-label={`${contract.customerName} 계약 선택`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-28">
                          {contract.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                          {contract.customerPhone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            contract.itemCategory === 'INSURANCE' ? 'bg-blue-100 text-blue-800' :
                            contract.itemCategory === 'RENTAL' ? 'bg-green-100 text-green-800' :
                            contract.itemCategory === 'INTERNET_TV' ? 'bg-purple-100 text-purple-800' :
                            contract.itemCategory === 'FUNERAL' ? 'bg-gray-100 text-gray-800' :
                            contract.itemCategory === 'RENTAL_MALL' ? 'bg-orange-100 text-orange-800' :
                            contract.itemCategory === 'INSTANT_PARTNER' ? 'bg-pink-100 text-pink-800' :
                            contract.itemCategory === 'SHOPPING_MALL' ? 'bg-indigo-100 text-indigo-800' :
                            contract.itemCategory === 'IMMEDIATE_JOIN' ? 'bg-cyan-100 text-cyan-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contract.itemCategory === 'INSURANCE' ? '보험' :
                             contract.itemCategory === 'RENTAL' ? '렌탈' :
                             contract.itemCategory === 'INTERNET_TV' ? '인터넷/방송' :
                             contract.itemCategory === 'FUNERAL' ? '상조' :
                             contract.itemCategory === 'RENTAL_MALL' ? '렌탈몰' :
                             contract.itemCategory === 'INSTANT_PARTNER' ? '즉시파트너' :
                             contract.itemCategory === 'SHOPPING_MALL' ? '쇼핑몰' :
                             contract.itemCategory === 'IMMEDIATE_JOIN' ? '즉시가입' :
                             contract.itemCategory}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-28">
                          {(dynamicFields.policyNumber as string) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-28">
                          {contract.contractAmount?.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                          {contract.finalPoints?.toLocaleString() || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                          {(dynamicFields.paymentTerm as string) || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                          {new Date(contract.contractDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-24">
                          {formatDate(contract.confirmedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap w-20">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            contract.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                            contract.status === 'COLLECTION' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contract.status === 'CONFIRMED' ? '수금완료' : 
                             contract.status === 'COLLECTION' ? '수금확인중' : contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleConfirmCollection(contract.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="수금확정"
                            >
                              수금확정
                            </button>
                            <button
                              onClick={() => handleRevertContract(contract.id)}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="계약목록으로 되돌리기"
                            >
                              되돌리기
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  페이지 {currentPage} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    이전
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 text-sm rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    다음
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}