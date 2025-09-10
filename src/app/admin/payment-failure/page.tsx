'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XCircle, Edit, CheckCircle, Pause, Download, Search, AlertTriangle } from 'lucide-react';

interface PaymentFailureData {
  id: string;
  name: string;
  policyNumber: string;
  referrer: string;
  manager: string;
  paymentAmount: number;
  paymentMonth: string;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'ON_HOLD';
  createdAt: string;
  updatedAt: string;
}

interface EditModalData {
  id: string;
  name: string;
  policyNumber: string;
  referrer: string;
  manager: string;
  paymentAmount: number;
  paymentMonth: string;
}

export default function PaymentFailurePage() {
  const [failureData, setFailureData] = useState<PaymentFailureData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditModalData | null>(null);
  const [editFormData, setEditFormData] = useState<EditModalData>({
    id: '',
    name: '',
    policyNumber: '',
    referrer: '',
    manager: '',
    paymentAmount: 0,
    paymentMonth: '',
  });

  // 수금실패 데이터 조회
  const fetchFailureData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/admin/payment-failure');
      if (!response.ok) {
        throw new Error('수금실패 데이터를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setFailureData(data.failures || []);
    } catch (err) {
      console.error('수금실패 데이터 조회 오류:', err);
      setError(err instanceof Error ? err.message : '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    fetchFailureData();
  }, []);

  // 필터링된 데이터
  const filteredData = failureData.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manager.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesMonth = !monthFilter || item.paymentMonth === monthFilter;

    return matchesSearch && matchesStatus && matchesMonth;
  });

  // 통계 계산
  const totalAmount = filteredData.reduce((sum, item) => sum + item.paymentAmount, 0);
  const pendingCount = filteredData.filter(item => item.status === 'PENDING').length;
  const completedCount = filteredData.filter(item => item.status === 'COMPLETED').length;
  const onHoldCount = filteredData.filter(item => item.status === 'ON_HOLD').length;
  const uniqueMonths = Array.from(new Set(failureData.map(item => item.paymentMonth))).sort();

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  // 개별 선택/해제
  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  // 수정 모달 열기
  const handleEditItem = (item: PaymentFailureData) => {
    setEditingItem({
      id: item.id,
      name: item.name,
      policyNumber: item.policyNumber,
      referrer: item.referrer,
      manager: item.manager,
      paymentAmount: item.paymentAmount,
      paymentMonth: item.paymentMonth,
    });
    setEditFormData({
      id: item.id,
      name: item.name,
      policyNumber: item.policyNumber,
      referrer: item.referrer,
      manager: item.manager,
      paymentAmount: item.paymentAmount,
      paymentMonth: item.paymentMonth,
    });
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setEditFormData({
      id: '',
      name: '',
      policyNumber: '',
      referrer: '',
      manager: '',
      paymentAmount: 0,
      paymentMonth: '',
    });
  };

  // 수정 폼 데이터 변경
  const handleEditFormChange = (field: keyof EditModalData, value: string | number) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // 데이터 수정 저장
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`/api/admin/payment-failure/${editFormData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('데이터 수정에 실패했습니다.');
      }

      alert('데이터가 성공적으로 수정되었습니다.');
      handleCloseEditModal();
      fetchFailureData(); // 데이터 새로고침
    } catch (err) {
      console.error('데이터 수정 오류:', err);
      alert(err instanceof Error ? err.message : '데이터 수정 중 오류가 발생했습니다.');
    }
  };

  // 수금완료 처리
  const handleCompletePayment = async (id: string) => {
    if (!confirm('이 데이터를 수금완료로 처리하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payment-failure/${id}/complete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('수금완료 처리에 실패했습니다.');
      }

      alert('수금완료로 처리되었습니다.');
      fetchFailureData(); // 데이터 새로고침
    } catch (err) {
      console.error('수금완료 처리 오류:', err);
      alert(err instanceof Error ? err.message : '수금완료 처리 중 오류가 발생했습니다.');
    }
  };

  // 지급보류 처리
  const handleHoldPayment = async (id: string) => {
    if (!confirm('이 데이터를 지급보류로 처리하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/payment-failure/${id}/hold`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('지급보류 처리에 실패했습니다.');
      }

      alert('지급보류로 처리되었습니다.');
      fetchFailureData(); // 데이터 새로고침
    } catch (err) {
      console.error('지급보류 처리 오류:', err);
      alert(err instanceof Error ? err.message : '지급보류 처리 중 오류가 발생했습니다.');
    }
  };

  // 엑셀 다운로드
  const handleExport = async () => {
    try {
      const response = await fetch('/api/admin/payment-failure/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIds: selectedItems.size > 0 ? Array.from(selectedItems) : null,
          filters: {
            search: searchTerm,
            status: statusFilter,
            month: monthFilter,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `수금실패_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('다운로드 오류:', err);
      alert(err instanceof Error ? err.message : '다운로드 중 오류가 발생했습니다.');
    }
  };

  const isAllSelected = filteredData.length > 0 && selectedItems.size === filteredData.length;
  const isIndeterminate = selectedItems.size > 0 && selectedItems.size < filteredData.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* 헤더 */}
          <div className="border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-red-600">❌</span>
              수금실패페이지
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              수금이 실패한 데이터를 관리하고 3가지 처리 옵션을 제공합니다.
            </p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">수금실패 건수</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{filteredData.length}건</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <Pause className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">처리대기</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{pendingCount}건</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">수금완료</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{completedCount}건</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-medium">⏸️</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">지급보류</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{onHoldCount}건</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">검색 및 필터</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 검색 */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검색
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="고객명, 증권번호, 담당자로 검색..."
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="검색어 입력"
                      title="고객명, 증권번호, 담당자로 검색하세요"
                    />
                  </div>
                </div>

                {/* 상태 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="결제 상태 필터"
                    title="결제 상태를 선택하세요"
                  >
                    <option value="all">전체</option>
                    <option value="PENDING">처리대기</option>
                    <option value="COMPLETED">수금완료</option>
                    <option value="ON_HOLD">지급보류</option>
                  </select>
                </div>

                {/* 수금월 필터 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    수금월
                  </label>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="수금월 필터"
                    title="수금월을 선택하세요"
                  >
                    <option value="">전체</option>
                    {uniqueMonths.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 데이터 테이블 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">수금실패 데이터</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExport}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    엑셀 다운로드
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">데이터를 불러오는 중...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-600">
                  <p>{error}</p>
                  <button
                    onClick={fetchFailureData}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>수금실패 데이터가 없습니다.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = isIndeterminate;
                          }}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          aria-label="전체 선택"
                          title="모든 항목을 선택/해제합니다"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">증권번호</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">추천인</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">납입금액</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수금월</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">실패사유</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">처리</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            aria-label={`${item.name} 항목 선택`}
                            title={`${item.name} 항목을 선택/해제합니다`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.policyNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.referrer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.manager}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {item.paymentAmount.toLocaleString()}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.paymentMonth}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-xs truncate" title={item.reason}>
                            {item.reason}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            item.status === 'ON_HOLD' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status === 'PENDING' ? '처리대기' :
                             item.status === 'COMPLETED' ? '수금완료' :
                             item.status === 'ON_HOLD' ? '지급보류' : item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="데이터 수정"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleCompletePayment(item.id)}
                              className="text-green-600 hover:text-green-900"
                              title="수금완료"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleHoldPayment(item.id)}
                              className="text-gray-600 hover:text-gray-900"
                              title="지급보류"
                            >
                              <Pause className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">데이터 수정</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">고객명</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => handleEditFormChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="고객명 입력"
                    title="고객명을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">증권번호</label>
                  <input
                    type="text"
                    value={editFormData.policyNumber}
                    onChange={(e) => handleEditFormChange('policyNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="증권번호 입력"
                    title="증권번호를 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">추천인</label>
                  <input
                    type="text"
                    value={editFormData.referrer}
                    onChange={(e) => handleEditFormChange('referrer', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="추천인 입력"
                    title="추천인을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
                  <input
                    type="text"
                    value={editFormData.manager}
                    onChange={(e) => handleEditFormChange('manager', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="담당자 입력"
                    title="담당자를 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">납입금액</label>
                  <input
                    type="number"
                    value={editFormData.paymentAmount}
                    onChange={(e) => handleEditFormChange('paymentAmount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="납입금액 입력"
                    title="납입금액을 입력하세요"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수금월</label>
                  <input
                    type="text"
                    value={editFormData.paymentMonth}
                    onChange={(e) => handleEditFormChange('paymentMonth', e.target.value)}
                    placeholder="YYYY-MM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="수금월 입력"
                    title="수금월을 입력하세요"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

