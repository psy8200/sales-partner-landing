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
  userName: string;
  userPhone: string;
  finalPoints: number; // 결정포인트
  basicSalary: number; // 기본수당
  recruitmentBonus: number; // 모집수당
  indirectBonus: number; // 간접수당
  basicDividend: number; // 기본배당
  gradeDividend: number; // 배당등급별
  totalAmount: number; // 총지급액
  settlementMonth: string; // 정산월
  requestInfo: string; // 요청정보
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
}

// 목업 데이터 (실제 데이터로 교체 예정)
const mockWithdrawalRequests: WithdrawalRequest[] = [];

export default function WithdrawalRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // 검색 필터링
  const filteredRequests = mockWithdrawalRequests.filter(request =>
    request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.userPhone.includes(searchTerm) ||
    request.settlementMonth.includes(searchTerm)
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
                  placeholder="회원명, 연락처, 정산월로 검색..."
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
                      <AlertCircle className="h-4 w-4" />
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
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
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
                          aria-label={`${request.userName} 선택`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.userPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{formatAmount(request.finalPoints)}P</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{formatAmount(request.basicSalary)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{formatAmount(request.recruitmentBonus)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{formatAmount(request.indirectBonus)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{formatAmount(request.basicDividend)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{formatAmount(request.gradeDividend)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">₩{formatAmount(request.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.settlementMonth}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.requestInfo}</div>
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
