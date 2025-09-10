'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Download, 
  CheckCircle, 
  Clock, 
  DollarSign,
  User,
  Phone,
  Package,
  Calendar,
  Square,
  RefreshCw
} from 'lucide-react';

// 실제 데이터베이스 스키마에 맞는 타입 정의
interface SettlementContract {
  id: string;
  customerName: string;
  customerPhone: string;
  contractAmount: number;
  contractCount: number; // 계약건수 필드 추가
  finalPoints: number;
  confirmedAt: string;
  status: string;
  referralCode: string | null; // 추천인코드 필드 추가
  contractNumbers: string[]; // 계약번호 배열 추가
}

export default function SettlementsListPage() {
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSearchTerm, setFilteredSearchTerm] = useState(''); // 실제 필터링에 사용되는 검색어
  const [contracts, setContracts] = useState<SettlementContract[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 조회 함수 (공통)
  const fetchSettlementContracts = async () => {
    try {
      setLoading(true);
      
      // 새로운 정산리스트 전용 API 호출 (기존 수금관리 API와 완전 분리)
      const response = await fetch('/api/admin/settlements/data?page=1&limit=1000');
      
      if (response.ok) {
        const data = await response.json();
        setContracts(data.data || []);
      } else {
        console.error('Failed to fetch settlement contracts');
        setContracts([]);
      }
    } catch (error) {
      console.error('Error fetching settlement contracts:', error);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  // 새로고침 함수 (데이터만 갱신)
  const handleRefresh = async () => {
    await fetchSettlementContracts();
  };

  // 검색 함수
  const handleSearch = () => {
    setFilteredSearchTerm(searchTerm);
  };

  // 엔터키로 검색
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  // API 호출을 위한 useEffect
  useEffect(() => {
    fetchSettlementContracts();
  }, []);

  // 검색어에 따른 데이터 필터링
  const filteredData = contracts.filter(contract => {
    if (!filteredSearchTerm) return true;
    const searchLower = filteredSearchTerm.toLowerCase();
    return (
      contract.customerName.toLowerCase().includes(searchLower) ||
      contract.customerPhone.includes(filteredSearchTerm) ||
      contract.contractCount.toString().includes(filteredSearchTerm)
    );
  });

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
      setSelectedContracts(new Set(filteredData.map(contract => contract.id)));
    } else {
      setSelectedContracts(new Set());
    }
  };

  const isAllSelected = filteredData.length > 0 && filteredData.every(contract => selectedContracts.has(contract.id));
  const isIndeterminate = selectedContracts.size > 0 && selectedContracts.size < filteredData.length;


  // Excel 다운로드 함수
  const handleExcelDownload = async () => {
    try {
      const response = await fetch('/api/admin/settlements/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: filteredData,
          fields: [
            'customerName', 
            'customerPhone',
            'contractCount',
            'contractAmount',
            'finalPoints',
            'confirmedAt',
            'contractNumbers'
          ],
          filename: `정산리스트_${new Date().toISOString().split('T')[0]}.xlsx`
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settlements_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Excel 다운로드 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Excel 다운로드 중 오류가 발생했습니다.');
    }
  };


  // 상태값 표시 함수
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED_COLLECTION':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">수금완료</span>;
      case 'LUMP_SUM':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">일시납</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };


  // 금액 포맷팅 함수
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
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
              <h1 className="text-3xl font-bold text-gray-900">정산리스트</h1>
              <p className="text-gray-600 mt-2">수금완료계약과 일시납계약 데이터를 통합하여 정산 대상 계약을 관리합니다.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleExcelDownload}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="고객명, 연락처, 계약건수로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Search className="h-4 w-4 mr-2" />
                검색
              </button>
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>
        </motion.div>

        {/* 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">데이터를 불러오는 중...</p>
              </div>
            </div>
          ) : (
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
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      고객명
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
                      계약금액
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      계약건수
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      최종결정포인트
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      확정일시
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      추천인코드
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      상태값
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((contract) => (
                    <tr key={contract.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedContracts.has(contract.id)}
                          onChange={(e) => handleSelectContract(contract.id, e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contract.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{contract.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{formatAmount(contract.contractAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{contract.contractCount}건</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{formatAmount(contract.finalPoints)}P</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(contract.confirmedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {contract.referralCode || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(contract.status)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">
                          {searchTerm ? '검색 결과가 없습니다' : '정산 대상 계약이 없습니다'}
                        </p>
                        <p className="text-sm">
                          {searchTerm ? '다른 검색어를 시도해보세요' : '수금완료 또는 일시납 계약이 없습니다'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </motion.div>


        {/* 검색 결과 요약 */}
        {searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                "{searchTerm}" 검색 결과: {filteredData.length}개 항목
              </span>
            </div>
          </motion.div>
        )}

        {/* 데이터 통계 */}
        {!loading && !searchTerm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                전체 정산 대상: {contracts.length}개 계약
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}