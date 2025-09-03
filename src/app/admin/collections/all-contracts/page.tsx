'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download } from 'lucide-react';

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

export default function AllContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('CONFIRMED');
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

      const response = await fetch(`/api/admin/collections/all-contracts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('계약 목록 조회 오류:', error);
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
        const data = await response.json();
        alert(data.message);
        // 계약 목록 새로고침
        fetchContracts();
        // 선택 상태 초기화
        setSelectedContracts(new Set());
      } else {
        const error = await response.json();
        alert(error.error || '계약 되돌리기에 실패했습니다.');
      }
    } catch (error) {
      console.error('계약 되돌리기 오류:', error);
      alert('계약 되돌리기 중 오류가 발생했습니다.');
    }
  };

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">계약 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* 헤더 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
                         <div>
               <h1 className="text-2xl font-bold text-gray-900">수금관리 전체계약</h1>
               <p className="mt-1 text-sm text-gray-600">
                 확정된 계약 목록 ({total}건)
                 {selectedContracts.size > 0 && (
                   <span className="ml-2 text-blue-600 font-medium">
                     • {selectedContracts.size}개 선택됨
                   </span>
                 )}
               </p>
             </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                내보내기
              </button>
            </div>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="고객명, 계약번호, 회사명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="상태 필터"
              >
                <option value="CONFIRMED">확정된 계약</option>
              </select>
            </div>
          </div>
        </div>

        {/* 계약 목록 테이블 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
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
                                 {contracts.length === 0 ? (
                   <tr>
                     <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                       <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                       <p className="text-lg font-medium">확정된 계약이 없습니다</p>
                       <p className="text-sm">계약목록에서 계약을 확정하면 여기에 표시됩니다.</p>
                     </td>
                   </tr>
                ) : (
                  contracts.map((contract) => {
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
                             'bg-yellow-100 text-yellow-800'
                           }`}>
                             {contract.itemCategory === 'INSURANCE' ? '보험' :
                              contract.itemCategory === 'RENTAL' ? '렌탈' :
                              contract.itemCategory === 'INTERNET_TV' ? '인터넷/방송' :
                              contract.itemCategory === 'FUNERAL' ? '상조' :
                              contract.itemCategory === 'RENTAL_MALL' ? '렌탈몰' : contract.itemCategory}
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
                             contract.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                           }`}>
                             {contract.status === 'CONFIRMED' ? '확정' : contract.status}
                           </span>
                         </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">
                           <button
                             onClick={() => handleRevertContract(contract.id)}
                             className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                             title="계약목록으로 되돌리기"
                           >
                             수정하기
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
