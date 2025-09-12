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
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

// 출금 요청 데이터 타입 정의
interface WithdrawalRequest {
  id: string;
  requestNumber: string;
  userName: string;
  userPhone: string;
  requestAmount: number;
  requestDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
}

// 목업 데이터
const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: '1',
    requestNumber: 'WR001',
    userName: '김철수',
    userPhone: '010-1111-1234',
    requestAmount: 500000,
    requestDate: '2025-01-10',
    status: 'PENDING'
  },
  {
    id: '2',
    requestNumber: 'WR002',
    userName: '이영희',
    userPhone: '010-2222-5678',
    requestAmount: 300000,
    requestDate: '2025-01-09',
    status: 'PROCESSING'
  },
  {
    id: '3',
    requestNumber: 'WR003',
    userName: '박민수',
    userPhone: '010-3333-9012',
    requestAmount: 800000,
    requestDate: '2025-01-08',
    status: 'COMPLETED'
  },
  {
    id: '4',
    requestNumber: 'WR004',
    userName: '최지영',
    userPhone: '010-4444-3456',
    requestAmount: 200000,
    requestDate: '2025-01-07',
    status: 'REJECTED'
  },
  {
    id: '5',
    requestNumber: 'WR005',
    userName: '정수현',
    userPhone: '010-5555-7890',
    requestAmount: 650000,
    requestDate: '2025-01-06',
    status: 'PENDING'
  }
];

export default function WithdrawalRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // 검색 필터링
  const filteredRequests = mockWithdrawalRequests.filter(request =>
    request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.userPhone.includes(searchTerm) ||
    request.requestNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택 관련 함수들
  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredRequests.map(request => request.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const isAllSelected = filteredRequests.length > 0 && filteredRequests.every(request => selectedItems.has(request.id));
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredRequests.length;

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            대기
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            진행중
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            완료
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            거절
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // 액션 버튼들
  const getActionButtons = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
              승인
            </button>
            <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
              거절
            </button>
          </div>
        );
      case 'PROCESSING':
        return (
          <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
            입금완료
          </button>
        );
      case 'COMPLETED':
        return (
          <span className="text-xs text-gray-500">완료</span>
        );
      case 'REJECTED':
        return (
          <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
            재검토
          </button>
        );
      default:
        return null;
    }
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
              <h1 className="text-3xl font-bold text-gray-900">출금 요청 리스트</h1>
              <p className="text-gray-600 mt-2">회원들의 출금 요청을 관리하고 처리합니다.</p>
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
                  placeholder="출금번호, 회원명, 연락처로 검색..."
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
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                새로고침
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
                      <DollarSign className="h-4 w-4" />
                      출금번호
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
                      요청금액
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      요청일
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      상태
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MoreHorizontal className="h-4 w-4" />
                      액션
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                        <span>검색 결과가 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(request.id)}
                          onChange={(e) => handleSelectItem(request.id, e.target.checked)}
                          aria-label={`항목 ${request.id} 선택`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.requestNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.userPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">₩{formatAmount(request.requestAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(request.requestDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionButtons(request.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 선택된 항목 정보 */}
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedItems.size}개 항목이 선택되었습니다.
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">
                  선택 항목 승인
                </button>
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700">
                  선택 항목 거절
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
