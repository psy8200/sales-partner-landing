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
  FileText,
  Eye,
  CreditCard
} from 'lucide-react';

// 정산 완료 데이터 타입 정의
interface CompletedSettlement {
  id: string;
  requestNumber: string;
  userId: string;
  userName: string;
  userPhone: string;
  paidAmount: number;
  requestDate: string;
  completedDate: string;
  processedBy: string;
  accountNumber: string;
  receiptUrl?: string;
  transactionId?: string;
  memo?: string;
  createdAt: string;
}

// 목업 데이터
const mockCompletedSettlements: CompletedSettlement[] = [
  {
    id: '1',
    requestNumber: 'WR001',
    userId: 'user1',
    userName: '김철수',
    userPhone: '010-1111-1234',
    paidAmount: 500000,
    requestDate: '2025-01-10',
    completedDate: '2025-01-12',
    processedBy: '관리자A',
    accountNumber: '123-456-789012',
    receiptUrl: '/receipts/WR001.pdf',
    transactionId: 'TXN20250112001',
    memo: '정상 처리 완료',
    createdAt: '2025-01-12T09:15:00Z'
  },
  {
    id: '2',
    requestNumber: 'WR002',
    userId: 'user2',
    userName: '이영희',
    userPhone: '010-2222-5678',
    paidAmount: 300000,
    requestDate: '2025-01-09',
    completedDate: '2025-01-11',
    processedBy: '관리자B',
    accountNumber: '987-654-321098',
    receiptUrl: '/receipts/WR002.pdf',
    transactionId: 'TXN20250111002',
    memo: '정상 처리 완료',
    createdAt: '2025-01-11T14:30:00Z'
  },
  {
    id: '3',
    requestNumber: 'WR003',
    userId: 'user3',
    userName: '박민수',
    userPhone: '010-3333-9012',
    paidAmount: 800000,
    requestDate: '2025-01-08',
    completedDate: '2025-01-10',
    processedBy: '관리자A',
    accountNumber: '456-789-123456',
    receiptUrl: '/receipts/WR003.pdf',
    transactionId: 'TXN20250110003',
    memo: '정상 처리 완료',
    createdAt: '2025-01-10T11:45:00Z'
  },
  {
    id: '4',
    requestNumber: 'WR004',
    userId: 'user4',
    userName: '최지영',
    userPhone: '010-4444-3456',
    paidAmount: 200000,
    requestDate: '2025-01-07',
    completedDate: '2025-01-09',
    processedBy: '관리자C',
    accountNumber: '789-123-456789',
    receiptUrl: '/receipts/WR004.pdf',
    transactionId: 'TXN20250109004',
    memo: '정상 처리 완료',
    createdAt: '2025-01-09T16:20:00Z'
  },
  {
    id: '5',
    requestNumber: 'WR005',
    userId: 'user5',
    userName: '정수현',
    userPhone: '010-5555-7890',
    paidAmount: 650000,
    requestDate: '2025-01-06',
    completedDate: '2025-01-08',
    processedBy: '관리자B',
    accountNumber: '321-654-987321',
    receiptUrl: '/receipts/WR005.pdf',
    transactionId: 'TXN20250108005',
    memo: '정상 처리 완료',
    createdAt: '2025-01-08T13:10:00Z'
  }
];

export default function CompletedSettlementsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // 검색 필터링
  const filteredSettlements = mockCompletedSettlements.filter(settlement =>
    settlement.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    settlement.userPhone.includes(searchTerm) ||
    settlement.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    settlement.accountNumber.includes(searchTerm)
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
      setSelectedItems(new Set(filteredSettlements.map(settlement => settlement.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const isAllSelected = filteredSettlements.length > 0 && filteredSettlements.every(settlement => selectedItems.has(settlement.id));
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredSettlements.length;

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 날짜시간 포맷팅
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  // 영수증 다운로드
  const handleDownloadReceipt = (settlement: CompletedSettlement) => {
    // 실제로는 서버에서 영수증 파일을 다운로드
    console.log('영수증 다운로드:', settlement.receiptUrl);
    alert(`${settlement.requestNumber} 영수증을 다운로드합니다.`);
  };

  // 상세보기
  const handleViewDetails = (settlement: CompletedSettlement) => {
    // 실제로는 모달이나 상세 페이지로 이동
    console.log('상세보기:', settlement);
    alert(`${settlement.requestNumber} 상세 정보를 확인합니다.`);
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
              <h1 className="text-3xl font-bold text-gray-900">정산 완료 리스트</h1>
              <p className="text-gray-600 mt-2">완료된 정산 목록을 조회하고 관리합니다. (영구보존)</p>
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
                  placeholder="출금번호, 회원명, 연락처, 계좌번호로 검색..."
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
                      지급금액
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
                      <CheckCircle className="h-4 w-4" />
                      완료일
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      처리자
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      계좌번호
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      영수증
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      액션
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSettlements.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="h-8 w-8 text-gray-400" />
                        <span>검색 결과가 없습니다.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSettlements.map((settlement) => (
                    <tr key={settlement.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(settlement.id)}
                          onChange={(e) => handleSelectItem(settlement.id, e.target.checked)}
                          aria-label={`항목 ${settlement.id} 선택`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{settlement.requestNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{settlement.userName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{settlement.userPhone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-green-600">₩{formatAmount(settlement.paidAmount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(settlement.requestDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(settlement.completedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{settlement.processedBy}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">{settlement.accountNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDownloadReceipt(settlement)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          다운로드
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(settlement)}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          상세
                        </button>
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
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                  선택 항목 Excel 다운로드
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
