'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  CheckCircle, 
  Clock, 
  DollarSign,
  User,
  Phone,
  Package,
  Calendar,
  CheckSquare,
  Square
} from 'lucide-react';

// 목업 데이터 타입 정의
interface SettlementContract {
  id: string;
  customerName: string;
  customerPhone: string;
  itemCategory: string;
  contractAmount: number;
  finalPoints: number;
  confirmedAt: string;
  status: string;
  settlementStatus: 'PENDING' | 'COMPLETED' | 'PROCESSING';
}

// 목업 데이터
const mockData: SettlementContract[] = [
  {
    id: '1',
    customerName: '김철수',
    customerPhone: '010-1234-5678',
    itemCategory: '렌탈몰분양',
    contractAmount: 170000,
    finalPoints: 50050,
    confirmedAt: '2025-01-10',
    status: 'COMPLETED_COLLECTION',
    settlementStatus: 'PENDING'
  },
  {
    id: '2',
    customerName: '이영희',
    customerPhone: '010-2345-6789',
    itemCategory: '일시납상품',
    contractAmount: 250000,
    finalPoints: 75000,
    confirmedAt: '2025-01-09',
    status: 'LUMP_SUM',
    settlementStatus: 'COMPLETED'
  },
  {
    id: '3',
    customerName: '박민수',
    customerPhone: '010-3456-7890',
    itemCategory: '렌탈몰분양',
    contractAmount: 300000,
    finalPoints: 90000,
    confirmedAt: '2025-01-08',
    status: 'COMPLETED_COLLECTION',
    settlementStatus: 'PROCESSING'
  }
];

export default function SettlementsListPage() {
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

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
      setSelectedContracts(new Set(mockData.map(contract => contract.id)));
    } else {
      setSelectedContracts(new Set());
    }
  };

  const isAllSelected = mockData.length > 0 && mockData.every(contract => selectedContracts.has(contract.id));
  const isIndeterminate = selectedContracts.size > 0 && selectedContracts.size < mockData.length;

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

  // 정산여부 표시 함수
  const getSettlementBadge = (settlementStatus: string) => {
    switch (settlementStatus) {
      case 'PENDING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">대기</span>;
      case 'PROCESSING':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">진행중</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">완료</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{settlementStatus}</span>;
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="고객명, 계약번호, 상품명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                필터
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
                      <Package className="h-4 w-4" />
                      카테고리
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
                      <Clock className="h-4 w-4" />
                      상태값
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4" />
                      정산여부
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockData.map((contract) => (
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
                      <div className="text-sm text-gray-900">{contract.itemCategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₩{formatAmount(contract.contractAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{formatAmount(contract.finalPoints)}P</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(contract.confirmedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contract.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSettlementBadge(contract.settlementStatus)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 선택된 항목 정보 */}
        {selectedContracts.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedContracts.size}개 항목이 선택되었습니다.
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  선택 항목 정산 처리
                </button>
                <button className="px-4 py-2 border border-blue-600 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50">
                  선택 해제
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
