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
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  FileSpreadsheet,
  Archive
} from 'lucide-react';

// 출금 요청 데이터 타입 정의
interface WithdrawalRequest {
  id: string;
  userName: string;
  userPhone: string;
  finalPoints: number; // 결정포인트
  withdrawablePoints: number; // 출금가능포인트 (신청 시점의 정확한 값)
  totalAmount: number; // 출금요청금액
  requestInfo: string; // 요청정보
  settlementMonth: string; // 정산월
  bankName: string; // 은행명
  accountNumber: string; // 계좌번호
  idCardFile: string; // 신분증정보 첨부파일
  status: 'REQUESTED' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'PAID';
}

// 정산완료 데이터 타입 정의
interface SettlementRecord {
  id: string;
  userName: string;
  userPhone: string;
  totalCommission: number; // 총지급액
  settlementYearMonth: string;
  paymentStatus: string;
  requestStatus: string;
}

// 실제 데이터를 가져오는 함수
const fetchWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  try {
    const response = await fetch('/api/admin/withdrawal-requests');
    if (response.ok) {
      const result = await response.json();
      return result.data?.requests || [];
    }
    return [];
  } catch (error) {
    console.error('출금신청 목록 조회 오류:', error);
    return [];
  }
};

// 정산완료 데이터를 가져오는 함수
const fetchSettlementRecords = async (): Promise<SettlementRecord[]> => {
  try {
    const response = await fetch('/api/admin/settlements/completed');
    if (response.ok) {
      const result = await response.json();
      return result.data || [];
    }
    return [];
  } catch (error) {
    console.error('정산완료 데이터 조회 오류:', error);
    return [];
  }
};

export default function WithdrawalRequestsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [settlementRecords, setSettlementRecords] = useState<SettlementRecord[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedIdCard, setSelectedIdCard] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setInitialLoading(true);
      try {
        // 출금신청 데이터와 정산완료 데이터를 병렬로 로드
        const [withdrawalData, settlementData] = await Promise.all([
          fetchWithdrawalRequests(),
          fetchSettlementRecords()
        ]);
        
        setWithdrawalRequests(withdrawalData);
        setSettlementRecords(settlementData);
        
        console.log('출금신청 목록 로드 완료:', withdrawalData.length, '건');
        console.log('정산완료 데이터 로드 완료:', settlementData.length, '건');
      } catch (error) {
        console.error('데이터 로드 오류:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, []);

  // 정산완료 데이터를 기반으로 테이블 데이터 구성 (11건 모두 표시)
  const tableData = settlementRecords.map(settlement => {
    // 해당 회원의 출금신청 데이터 찾기
    const withdrawalRequest = withdrawalRequests.find(wr => 
      wr.userName === settlement.userName && wr.userPhone === settlement.userPhone
    );

    return {
      id: withdrawalRequest?.id || settlement.id, // WithdrawalRequest ID가 있으면 사용, 없으면 SettlementRecord ID 사용
      userName: settlement.userName,
      userPhone: settlement.userPhone,
      finalPoints: withdrawalRequest?.finalPoints || 0,
      withdrawablePoints: settlement.totalCommission, // 총지급액을 출금가능포인트로 표시
      totalAmount: withdrawalRequest?.totalAmount || 0,
      requestInfo: withdrawalRequest ? '출금신청' : '정산완료',
      settlementMonth: settlement.settlementYearMonth,
      bankName: withdrawalRequest?.bankName || '',
      accountNumber: withdrawalRequest?.accountNumber || '',
      idCardFile: withdrawalRequest?.idCardFile || '',
      status: withdrawalRequest?.status || 'COMPLETED' as const,
      totalCommission: settlement.totalCommission
    };
  });

  // 검색 필터링
  const filteredRequests = tableData.filter(item =>
    item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userPhone.includes(searchTerm) ||
    item.settlementMonth.includes(searchTerm)
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

  // 새로고침 함수
  const handleRefresh = async () => {
    setLoading(true);
    try {
      // 출금신청 데이터와 정산완료 데이터를 병렬로 로드
      const [withdrawalData, settlementData] = await Promise.all([
        fetchWithdrawalRequests(),
        fetchSettlementRecords()
      ]);
      
      setWithdrawalRequests(withdrawalData);
      setSettlementRecords(settlementData);
      
      console.log('출금신청 목록 새로고침 완료:', withdrawalData.length, '건');
      console.log('정산완료 데이터 새로고침 완료:', settlementData.length, '건');
    } catch (error) {
      console.error('새로고침 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 삭제하기 함수
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    const confirmDelete = confirm(`선택된 ${selectedItems.size}개의 출금신청을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
    if (!confirmDelete) return;

    setLoading(true);
    try {
      const deletePromises = Array.from(selectedItems).map(id => 
        fetch(`/api/admin/withdrawal-requests/${id}`, {
          method: 'DELETE'
        })
      );

      const results = await Promise.all(deletePromises);
      const failed = results.filter(result => !result.ok);

      if (failed.length === 0) {
        alert(`${selectedItems.size}개의 출금신청이 삭제되었습니다.`);
        setSelectedItems(new Set());
        await handleRefresh();
      } else {
        alert(`${failed.length}개의 출금신청 삭제에 실패했습니다.`);
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 엑셀 다운로드 함수
  const handleExcelDownload = async () => {
    try {
      const response = await fetch('/api/admin/withdrawal-requests/export');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `출금신청목록_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('엑셀 다운로드 완료');
      } else {
        alert('엑셀 다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  // 백업하기 함수
  const handleBackup = async () => {
    try {
      const response = await fetch('/api/admin/withdrawal-requests/backup');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `출금신청백업_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        console.log('백업 완료');
        alert('출금신청 데이터 백업이 완료되었습니다.');
      } else {
        alert('백업에 실패했습니다.');
      }
    } catch (error) {
      console.error('백업 오류:', error);
      alert('백업 중 오류가 발생했습니다.');
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 첨부파일 보기 함수
  const handleViewIdCard = (idCardFile: string) => {
    if (idCardFile) {
      setSelectedIdCard(idCardFile);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };


  // 출금신청 상태 변경 함수
  const handleStatusChange = async (requestId: string, newStatus: string, rejectionReason?: string) => {
    try {
      setLoading(true);
      
      // WithdrawalRequest ID인지 확인 (SettlementRecord ID가 아닌지)
      const isWithdrawalRequestId = withdrawalRequests.some(wr => wr.id === requestId);
      
      if (!isWithdrawalRequestId) {
        alert('출금신청 데이터가 아닙니다. 정산완료 데이터는 승인/거절할 수 없습니다.');
        return;
      }
      
      const response = await fetch(`/api/admin/withdrawal-requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          processedBy: 'admin', // TODO: 실제 관리자 ID로 교체
          rejectionReason
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '상태 변경에 실패했습니다.');
      }

      console.log('출금신청 상태 변경 완료:', result);
      
      // 성공 메시지 표시
      const statusMessages = {
        'PAID': '출금신청이 승인되었습니다.',
        'REJECTED': '출금신청이 거절되었습니다.'
      };
      
      alert(statusMessages[newStatus as keyof typeof statusMessages] || '상태가 변경되었습니다.');
      
      // 목록 새로고침
      await handleRefresh();
      
    } catch (error) {
      console.error('출금신청 상태 변경 오류:', error);
      alert(`상태 변경 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // 상태 배지 표시 함수
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            신청됨
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            처리중
          </span>
        );
      case 'PAID':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            지급완료
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            거절됨
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            완료됨
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            알 수 없음
          </span>
        );
    }
  };

  // 액션 버튼들 (승인/거절만)
  const getActionButtons = (request: WithdrawalRequest) => {
    switch (request.status) {
      case 'REQUESTED':
        return (
          <div className="flex gap-1">
            <button 
              onClick={() => handleStatusChange(request.id, 'PAID')}
              disabled={loading}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
            >
              승인
            </button>
            <button 
              onClick={() => {
                const reason = prompt('거절 사유를 입력해주세요:');
                if (reason) {
                  handleStatusChange(request.id, 'REJECTED', reason);
                }
              }}
              disabled={loading}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              거절
            </button>
          </div>
        );
      case 'PENDING':
        return (
          <div className="flex gap-1">
            <button 
              onClick={() => handleStatusChange(request.id, 'PAID')}
              disabled={loading}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
            >
              승인
            </button>
            <button 
              onClick={() => {
                const reason = prompt('거절 사유를 입력해주세요:');
                if (reason) {
                  handleStatusChange(request.id, 'REJECTED', reason);
                }
              }}
              disabled={loading}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              거절
            </button>
          </div>
        );
      case 'PROCESSING':
        return (
          <div className="flex gap-1">
            <button 
              onClick={() => handleStatusChange(request.id, 'PAID')}
              disabled={loading}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
            >
              승인
            </button>
            <button 
              onClick={() => {
                const reason = prompt('거절 사유를 입력해주세요:');
                if (reason) {
                  handleStatusChange(request.id, 'REJECTED', reason);
                }
              }}
              disabled={loading}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              거절
            </button>
          </div>
        );
      case 'PAID':
        return (
          <span className="text-xs text-green-600 font-medium">승인완료</span>
        );
      case 'REJECTED':
        return (
          <span className="text-xs text-red-600 font-medium">거절됨</span>
        );
      case 'COMPLETED':
        return (
          <div className="flex gap-1">
            <button 
              onClick={() => handleStatusChange(request.id, 'PAID')}
              disabled={loading}
              className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
            >
              승인
            </button>
            <button 
              onClick={() => {
                const reason = prompt('거절 사유를 입력해주세요:');
                if (reason) {
                  handleStatusChange(request.id, 'REJECTED', reason);
                }
              }}
              disabled={loading}
              className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
            >
              거절
            </button>
          </div>
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
              <button 
                onClick={handleRefresh}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '새로고침 중...' : '새로고침'}
              </button>
              
              {/* 삭제하기 버튼 */}
              <button 
                onClick={handleDeleteSelected}
                disabled={selectedItems.size === 0 || loading}
                className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                삭제하기
              </button>
              
              {/* 엑셀 다운로드 버튼 */}
              <button 
                onClick={handleExcelDownload}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-white hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                엑셀다운로드
              </button>
              
              {/* 백업하기 버튼 */}
              <button 
                onClick={handleBackup}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Archive className="h-4 w-4 mr-2" />
                백업하기
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
                    회원명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총지급액
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    출금요청금액
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청정보
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정산월
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    은행명
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    계좌번호
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신분증정보
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정산관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initialLoading ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
                        <span>데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                        <span>출금신청 내역이 없습니다.</span>
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
                        <div className="text-sm font-medium text-purple-600">{formatAmount(request.totalCommission)}P</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">{request.totalAmount > 0 ? `₩${formatAmount(request.totalAmount)}` : '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.requestInfo}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.settlementMonth}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.bankName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.accountNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.idCardFile ? (
                            <button
                              onClick={() => handleViewIdCard(request.idCardFile)}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                            >
                              첨부파일 보기
                            </button>
                          ) : (
                            <span className="text-gray-400">없음</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getStatusBadge(request.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getActionButtons(request)}
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

        {/* 신분증 이미지 모달 */}
        {selectedIdCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">신분증 이미지</h3>
                <button
                  onClick={() => setSelectedIdCard(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-center">
                <img
                  src={selectedIdCard}
                  alt="신분증 이미지"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-image.png';
                    target.alt = '이미지를 불러올 수 없습니다';
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setSelectedIdCard(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
