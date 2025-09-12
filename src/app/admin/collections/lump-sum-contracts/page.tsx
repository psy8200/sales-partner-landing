'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Search, Download } from 'lucide-react';

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

export default function LumpSumContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('LUMP_SUM');
  const [confirmedDateFilter, setConfirmedDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());

  // 계약 목록 조회
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`/api/admin/collections/lump-sum-contracts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('일시납계약 목록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

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

  const isAllSelected = contracts.length > 0 && contracts.every(contract => selectedContracts.has(contract.id));
  const isIndeterminate = selectedContracts.size > 0 && selectedContracts.size < contracts.length;

  // 계약 되돌리기 함수
  const handleRevertContract = async (contractId: string) => {
    if (!confirm('이 계약을 계약목록으로 되돌리시겠습니까?\n계약 수정은 상담/계약관리 > 계약목록에서만 가능합니다.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/contracts/revert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contractIds: [contractId] }),
      });

      if (response.ok) {
        alert('계약이 계약목록으로 되돌려졌습니다.');
        fetchContracts(); // 목록 새로고침
      } else {
        alert('계약 되돌리기 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('계약 되돌리기 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  // 수금관리계약으로 이동 함수
  const handleMoveToCollection = async (contractId: string) => {
    if (!confirm('이 계약을 수금관리계약으로 이동시키시겠습니까?')) {
      return;
    }

    try {
      // TODO: 수금관리계약으로 이동하는 API 구현 필요
      alert('수금관리계약으로 이동 기능은 준비 중입니다.');
    } catch (error) {
      console.error('수금관리계약 이동 오류:', error);
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

  // 필터링된 계약 목록 (검색어 + 확정일시 필터링)
  const filteredContracts = contracts.filter(contract => {
    // 검색어 필터링
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        contract.customerName?.toLowerCase().includes(searchLower) ||
        contract.contractNumber?.toLowerCase().includes(searchLower) ||
        contract.companyName?.toLowerCase().includes(searchLower) ||
        contract.itemName?.toLowerCase().includes(searchLower)
      );
      if (!matchesSearch) return false;
    }

    // 확정일시 필터링
    if (confirmedDateFilter) {
      if (!contract.confirmedAt) return false;
      
      const contractDate = new Date(contract.confirmedAt);
      const year = contractDate.getFullYear();
      const month = contractDate.getMonth() + 1;
      const contractMonthKey = `${year}년 ${month}월`;
      
      if (contractMonthKey !== confirmedDateFilter) return false;
    }

    return true;
  });

  // 고유한 확정일시 목록 생성 (년+월별 그룹화)
  const getMonthlyConfirmedDates = () => {
    const monthlyGroups: { [key: string]: number } = {};

    contracts
      .map(contract => contract.confirmedAt)
      .filter(date => date) // null/undefined 제거
      .forEach(date => {
        const dateObj = new Date(date);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1; // 0-based이므로 +1
        const monthKey = `${year}년 ${month}월`;

        monthlyGroups[monthKey] = (monthlyGroups[monthKey] || 0) + 1;
      });

    // 월별 그룹을 배열로 변환하고 최신순 정렬
    return Object.entries(monthlyGroups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        // 년월을 파싱하여 최신순 정렬
        const [yearA, monthA] = a.month.split('년 ').map(s => parseInt(s.replace(/월/g, '')));
        const [yearB, monthB] = b.month.split('년 ').map(s => parseInt(s.replace(/월/g, '')));

        if (yearA !== yearB) return yearB - yearA;
        return monthB - monthA;
      });
  };

  // 엑셀 다운로드 함수
  const handleExcelDownload = () => {
    try {
      // CSV 헤더 생성
      const headers = [
        '계약번호',
        '고객명',
        '연락처',
        '주소',
        '카테고리',
        '회사명',
        '상품명',
        '계약금액',
        '수수료율',
        '수수료금액',
        '예상수익률',
        '포인트율',
        '지급율',
        '최종결정포인트',
        '계약일',
        '시작일',
        '종료일',
        '설치일',
        '확정일시',
        '상태값',
        '비고'
      ];

      // 데이터 행 생성
      const rows = filteredContracts.map(contract => {
        let dynamicFields: Record<string, unknown> = {};
        try {
          dynamicFields = contract.dynamicFields ? JSON.parse(contract.dynamicFields) : {};
        } catch (error) {
          console.error('dynamicFields 파싱 오류:', error);
          dynamicFields = {};
        }

        return [
          contract.contractNumber || '',
          contract.customerName || '',
          contract.customerPhone || '',
          contract.customerAddress || '',
          contract.itemCategory || '',
          contract.companyName || '',
          contract.itemName || '',
          contract.contractAmount?.toLocaleString() || '',
          `${contract.commissionRate}%` || '',
          contract.commissionAmount?.toLocaleString() || '',
          `${contract.expectedRate}%` || '',
          `${contract.pointRate}%` || '',
          `${contract.payoutRate}%` || '',
          contract.finalPoints?.toLocaleString() || '',
          contract.contractDate ? new Date(contract.contractDate).toLocaleDateString('ko-KR') : '',
          contract.startDate ? new Date(contract.startDate).toLocaleDateString('ko-KR') : '',
          contract.endDate ? new Date(contract.endDate).toLocaleDateString('ko-KR') : '',
          contract.installationDate ? new Date(contract.installationDate).toLocaleDateString('ko-KR') : '',
          contract.confirmedAt ? new Date(contract.confirmedAt).toLocaleDateString('ko-KR') : '',
          contract.status === 'CONFIRMED' || contract.status === 'LUMP_SUM' || contract.status === 'COMPLETED_COLLECTION' ? '수금완료' : contract.status,
          contract.notes || ''
        ];
      });

      // CSV 내용 생성
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // BOM 추가 (한글 깨짐 방지)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // 다운로드 실행
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `일시납계약_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert(`${filteredContracts.length}건의 일시납계약이 엑셀 파일로 다운로드되었습니다.`);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">일시납계약</h1>
          </div>
          <p className="text-gray-600">일시납 계약 관리</p>
        </div>

        {/* 검색 및 필터 */}
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={fetchContracts}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              검색
            </button>
            <select
              value={confirmedDateFilter}
              onChange={(e) => setConfirmedDateFilter(e.target.value)}
              title="확정일시 필터"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">전체 확정일시</option>
              {getMonthlyConfirmedDates().map(({ month, count }) => (
                <option key={month} value={month}>
                  {month} ({count}건)
                </option>
              ))}
            </select>
            <button
              onClick={handleExcelDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              엑셀다운로드
            </button>
          </div>
        </div>

        {/* 계약 목록 테이블 */}
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
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                      <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-lg font-medium">일시납계약이 없습니다</p>
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
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contract.itemCategory === 'INSURANCE' ? '보험' :
                             contract.itemCategory === 'RENTAL' ? '렌탈' :
                             contract.itemCategory === 'INTERNET_TV' ? '인터넷/방송' :
                             contract.itemCategory === 'FUNERAL' ? '상조' :
                             contract.itemCategory === 'RENTAL_MALL' ? '렌탈몰' :
                             contract.itemCategory === 'INSTANT_PARTNER' ? '즉시파트너' :
                             contract.itemCategory === 'SHOPPING_MALL' ? '쇼핑몰' : contract.itemCategory}
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
                            contract.status === 'CONFIRMED' || contract.status === 'LUMP_SUM' || contract.status === 'COMPLETED_COLLECTION' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {contract.status === 'CONFIRMED' || contract.status === 'LUMP_SUM' || contract.status === 'COMPLETED_COLLECTION' ? '수금완료' : contract.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                          <button
                            onClick={() => handleRevertContract(contract.id)}
                            className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            title="계약목록으로 되돌리기"
                          >
                            되돌리기
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
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
                        : 'bg-green-600 text-white hover:bg-green-700'
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
                        : 'bg-green-600 text-white hover:bg-green-700'
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
