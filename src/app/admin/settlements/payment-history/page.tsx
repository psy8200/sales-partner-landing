'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  RefreshCw, 
  Gift,
  Trash2,
  Download
} from 'lucide-react';

// 지급완료 내역 인터페이스
interface PaymentHistoryItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  myCode: string;
  referralCode?: string;
  previousLevel: number;
  currentLevel: number;
  totalReferrals: number;
  directReferrals: number;
  indirectReferrals: number;
  promotionDate: string;
  giftContent: string;
  giftAmount?: number;
  giftType: 'GIFT_CARD' | 'TRAVEL' | 'CAR' | 'LEGEND';
  paymentDate: string;
  processedBy: string;
  memo?: string;
  createdAt: string;
}

export default function PaymentHistoryPage() {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [giftTypeFilter, setGiftTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [memoInputs, setMemoInputs] = useState<{[key: string]: string}>({});
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // 데이터 조회 함수
  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settlements/payment-history');
      
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data.data || []);
      } else {
        console.error('Failed to fetch payment history');
        setPaymentHistory([]);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setPaymentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // 메모 저장 함수
  const handleSaveMemo = async (itemId: string, memo: string) => {
    try {
      const response = await fetch('/api/admin/settlements/payment-history', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: itemId,
          memo: memo
        }),
      });

      if (response.ok) {
        alert('메모가 저장되었습니다.');
        // 데이터 새로고침
        fetchPaymentHistory();
      } else {
        const error = await response.json();
        alert(`메모 저장 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving memo:', error);
      alert('메모 저장 중 오류가 발생했습니다.');
    }
  };

  // 전체 선택/해제 함수
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(filteredHistory.map(item => item.id));
      setSelectedItems(allIds);
    } else {
      setSelectedItems(new Set());
    }
  };

  // 개별 선택 함수
  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  // 선택된 항목 삭제 함수
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) {
      alert('삭제할 항목을 선택해주세요.');
      return;
    }

    if (!confirm(`선택된 ${selectedItems.size}개 항목을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/settlements/payment-history', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedItems)
        }),
      });

      if (response.ok) {
        alert('선택된 항목이 삭제되었습니다.');
        setSelectedItems(new Set());
        fetchPaymentHistory(); // 데이터 새로고침
      } else {
        const error = await response.json();
        alert(`삭제 실패: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting items:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // 선택된 항목 엑셀 다운로드 함수
  const handleExportSelected = async () => {
    if (selectedItems.size === 0) {
      alert('다운로드할 항목을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/admin/settlements/payment-history/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ids: Array.from(selectedItems)
        }),
      });

      if (response.ok) {
        // Content-Disposition 헤더에서 파일명 추출
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = `승급회원지급완료리스트_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
          if (fileNameMatch) {
            fileName = decodeURIComponent(fileNameMatch[1]);
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        
        // 정리
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
        
        alert('엑셀 파일이 다운로드되었습니다.');
      } else {
        const errorText = await response.text();
        let errorMessage = '다운로드 실패';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        alert(`다운로드 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    }
  };

  // 필터링된 데이터
  const filteredHistory = paymentHistory.filter(item => {
    const matchesSearch = !searchTerm || 
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userPhone.includes(searchTerm) ||
      item.myCode.includes(searchTerm) ||
      item.processedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || 
      item.currentLevel.toString() === levelFilter;
    
    const matchesGiftType = giftTypeFilter === 'all' || 
      item.giftType === giftTypeFilter;
    
    const matchesDate = dateFilter === 'all' || 
      (() => {
        const paymentDate = new Date(item.paymentDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today': return diffDays === 1;
          case 'week': return diffDays <= 7;
          case 'month': return diffDays <= 30;
          default: return true;
        }
      })();
    
    return matchesSearch && matchesLevel && matchesGiftType && matchesDate;
  });

  // 선물 타입별 색상
  const getGiftTypeColor = (giftType: string) => {
    switch (giftType) {
      case 'GIFT_CARD': return 'bg-blue-100 text-blue-800';
      case 'TRAVEL': return 'bg-green-100 text-green-800';
      case 'CAR': return 'bg-purple-100 text-purple-800';
      case 'LEGEND': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 선물 타입 한글명
  const getGiftTypeName = (giftType: string) => {
    switch (giftType) {
      case 'GIFT_CARD': return '상품권';
      case 'TRAVEL': return '여행권';
      case 'CAR': return '차량';
      case 'LEGEND': return 'LEGEND';
      default: return giftType;
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-full mx-auto"
      >
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            승급회원지급완료리스트
          </h1>
          <p className="text-lg text-gray-600">
            승급회원의 선물 지급 완료 내역을 조회하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 검색 및 필터 영역 */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 검색바 */}
            <div className="flex-1 min-w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="회원명, 연락처, 내코드, 처리자로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 필터들 */}
            <div className="flex gap-4">
              {/* 등급 필터 */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 등급</option>
                <option value="0">🥚 0등급 (알)</option>
                <option value="1">🐣 1등급 (병아리)</option>
                <option value="2">🐤 2등급 (작은 병아리)</option>
                <option value="3">🦜 3등급 (앵무새)</option>
                <option value="4">🦢 4등급 (백조)</option>
                <option value="5">🦚 5등급 (공작새)</option>
                <option value="6">🦅 6등급 (독수리)</option>
                <option value="7">💎 7등급 (다이아몬드)</option>
                <option value="8">⭐ 8등급 (빛나는별)</option>
                <option value="9">👑 9등급 (왕관)</option>
                <option value="10">🏆 10등급 (트로피)</option>
                <option value="LEGEND">🏢 LEGEND (레전드)</option>
              </select>

              {/* 선물 타입 필터 */}
              <select
                value={giftTypeFilter}
                onChange={(e) => setGiftTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 선물</option>
                <option value="GIFT_CARD">상품권</option>
                <option value="TRAVEL">여행권</option>
                <option value="CAR">차량</option>
                <option value="LEGEND">LEGEND</option>
              </select>

              {/* 기간 필터 */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 1주일</option>
                <option value="month">최근 1개월</option>
              </select>

              {/* 삭제 버튼 */}
              <button
                onClick={handleDeleteSelected}
                disabled={selectedItems.size === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                삭제하기 ({selectedItems.size})
              </button>

              {/* 엑셀 다운로드 버튼 */}
              <button
                onClick={handleExportSelected}
                disabled={selectedItems.size === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                엑셀다운로드 ({selectedItems.size})
              </button>

              {/* 새로고침 버튼 */}
              <button
                onClick={fetchPaymentHistory}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                새로고침
              </button>
            </div>
          </div>
        </div>


        {/* 지급완료 내역 테이블 */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                지급완료 내역 ({filteredHistory.length}건)
              </h2>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">총 지급액:</span> 
                  <span className="ml-1 text-blue-600 font-semibold">
                    {filteredHistory.reduce((sum, item) => sum + (item.giftAmount || 0), 0).toLocaleString('ko-KR')}원
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">이번 달 지급:</span> 
                  <span className="ml-1 text-green-600 font-semibold">
                    {filteredHistory.filter(item => {
                      const paymentDate = new Date(item.paymentDate);
                      const now = new Date();
                      return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
                    }).length}건
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={filteredHistory.length > 0 && selectedItems.size === filteredHistory.length}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          이름
                        </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    연락처
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    현재등급
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지급한선물
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지급일
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
                        <span className="ml-2 text-gray-500">데이터를 불러오는 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">지급완료 내역이 없습니다.</p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      {/* 선택박스 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        />
                      </td>
                      {/* 이름 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.userName}
                        </div>
                      </td>

                      {/* 연락처 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.userPhone}
                        </div>
                      </td>

                      {/* 현재등급 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">
                            {item.currentLevel === 0 ? '🥚' :
                             item.currentLevel === 1 ? '🐣' :
                             item.currentLevel === 2 ? '🐤' :
                             item.currentLevel === 3 ? '🦜' :
                             item.currentLevel === 4 ? '🦢' :
                             item.currentLevel === 5 ? '🦚' :
                             item.currentLevel === 6 ? '🦅' :
                             item.currentLevel === 7 ? '💎' :
                             item.currentLevel === 8 ? '⭐' :
                             item.currentLevel === 9 ? '👑' :
                             item.currentLevel === 10 ? '🏆' : '🏢'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {item.totalReferrals}명
                          </span>
                        </div>
                      </td>

                      {/* 지급한선물 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.giftContent}
                        </div>
                      </td>

                      {/* 지급일 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(item.paymentDate)}
                        </div>
                      </td>

                      {/* 관리 */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="메모 입력"
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-96"
                            value={memoInputs[item.id] !== undefined ? memoInputs[item.id] : (item.memo || '')}
                            onChange={(e) => {
                              setMemoInputs(prev => ({
                                ...prev,
                                [item.id]: e.target.value
                              }));
                            }}
                          />
                          <button
                            onClick={() => {
                              const memo = memoInputs[item.id] !== undefined ? memoInputs[item.id] : (item.memo || '');
                              handleSaveMemo(item.id, memo);
                            }}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            저장
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
