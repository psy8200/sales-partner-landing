'use client';

import React, { useState, useEffect } from 'react';

interface ItemSetting {
  id: string;
  category: 'INSURANCE' | 'RENTAL' | 'INTERNET_TV' | 'FUNERAL' | 'RENTAL_MALL' | 'SHOPPING_MALL' | 'INSTANT_PARTNER' | null;
  itemName?: string;
  provider: string;
  productName: string;
  paymentTerm: string;
  baseAmount: number;
  expectedRate: number;
  pointRate: number;
  pointAmount: number;
  createdAt: string;
}

const ItemsPage = () => {
  const [items, setItems] = useState<ItemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [migrating, setMigrating] = useState(false);

  // 아이템 목록 조회
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/items/list');
      if (!response.ok) {
        throw new Error('아이템 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 아이템 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('정말로 이 아이템을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('아이템 삭제에 실패했습니다.');
      }

      // 삭제 후 목록 새로고침
      await fetchItems();
      alert('아이템이 삭제되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // 개별 아이템 선택/해제
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // 엑셀 다운로드
  const handleDownload = async () => {
    if (selectedItems.length === 0) {
      alert('다운로드할 아이템을 선택해주세요.');
      return;
    }

    try {
      setDownloading(true);
      const response = await fetch('/api/admin/items/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemIds: selectedItems }),
      });

      if (!response.ok) {
        throw new Error('다운로드에 실패했습니다.');
      }

      // 파일 다운로드
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('다운로드가 완료되었습니다.');
    } catch (err) {
      alert(err instanceof Error ? err.message : '다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  // CUSTOM을 RENTAL_MALL로 마이그레이션
  const handleMigrateCustom = async () => {
    if (!confirm('CUSTOM 카테고리를 RENTAL_MALL로 변경하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }

    try {
      setMigrating(true);
      const response = await fetch('/api/admin/items/migrate-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '마이그레이션에 실패했습니다.');
      }

      const result = await response.json();
      
      // 목록 새로고침
      await fetchItems();
      
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : '마이그레이션 중 오류가 발생했습니다.');
    } finally {
      setMigrating(false);
    }
  };

  // 선택된 아이템 일괄 삭제
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      alert('삭제할 아이템을 선택해주세요.');
      return;
    }

    const confirmMessage = `선택된 ${selectedItems.length}개 아이템을 정말로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch('/api/admin/items/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemIds: selectedItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '삭제에 실패했습니다.');
      }

      const result = await response.json();
      
      // 삭제 후 선택 상태 초기화 및 목록 새로고침
      setSelectedItems([]);
      await fetchItems();
      
      alert(result.message);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
    }
  };

  // 카테고리 한글명 변환
  const getCategoryName = (item: ItemSetting) => {
    // itemName 기반 아이템들 처리
    if (item.itemName) {
      if (item.itemName === 'instantpartnerjoinapply') return '즉시가입';
      if (item.itemName === 'shoppingmallpurchaseapply') return '쇼핑구매';
      return item.itemName;
    }
    
    // 기존 category 기반 아이템들 처리
    const categoryMap: Record<string, string> = {
      'INSURANCE': '보험',
      'RENTAL': '렌탈',
      'INTERNET_TV': '인터넷/방송',
      'FUNERAL': '상조',
      'RENTAL_MALL': '렌탈몰',
      'SHOPPING_MALL': '쇼핑몰',
      'INSTANT_PARTNER': '즉시파트너',
    };
    return categoryMap[item.category || ''] || item.category || '기타';
  };

  // 필터링된 아이템
  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => {
      if (filter === 'instantpartnerjoinapply') return item.itemName === 'instantpartnerjoinapply';
      if (filter === 'shoppingmallpurchaseapply') return item.itemName === 'shoppingmallpurchaseapply';
      return item.category === filter;
    });

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">📦 아이템 관리</h1>
          <p className="mt-2 text-lg text-gray-600">판매 아이템을 관리하세요.</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">📦 아이템 관리</h1>
          <p className="mt-2 text-lg text-gray-600">판매 아이템을 관리하세요.</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">오류: {error}</div>
          <button 
            onClick={fetchItems}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">📦 아이템 관리</h1>
        <p className="mt-2 text-lg text-gray-600">판매 아이템을 관리하세요.</p>
      </div>

      {/* 필터 및 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              아이템 목록 ({items.length}개)
              {selectedItems.length > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({selectedItems.length}개 선택됨)
                </span>
              )}
            </h2>
            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="카테고리 필터"
                >
                  <option value="all">전체</option>
                  <option value="INSURANCE">보험</option>
                  <option value="RENTAL">렌탈</option>
                  <option value="INTERNET_TV">인터넷/방송</option>
                  <option value="FUNERAL">상조</option>
                  <option value="RENTAL_MALL">렌탈몰</option>
                  <option value="instantpartnerjoinapply">즉시가입</option>
                  <option value="shoppingmallpurchaseapply">쇼핑구매</option>
                </select>
                <button 
                  onClick={handleMigrateCustom}
                  disabled={migrating}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    migrating
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {migrating ? '변경 중...' : 'CUSTOM→렌탈몰 변경'}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={selectedItems.length === 0 || downloading}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedItems.length === 0 || downloading
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {downloading ? '다운로드 중...' : '다운로드'}
                </button>
                <button 
                  onClick={handleBulkDelete}
                  disabled={selectedItems.length === 0 || deleting}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedItems.length === 0 || deleting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 아이템 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={filteredItems.length > 0 && selectedItems.length === filteredItems.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-label="전체 선택"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제공사</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">납입기간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기본금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예상수익률</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트율</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트금액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    {filter === 'all' ? '등록된 아이템이 없습니다.' : '해당 카테고리의 아이템이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        aria-label={`${item.productName} 선택`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.itemName === 'instantpartnerjoinapply' ? 'bg-pink-100 text-pink-800' :
                        item.itemName === 'shoppingmallpurchaseapply' ? 'bg-indigo-100 text-indigo-800' :
                        item.category === 'INSURANCE' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'RENTAL' ? 'bg-green-100 text-green-800' :
                        item.category === 'INTERNET_TV' ? 'bg-purple-100 text-purple-800' :
                        item.category === 'FUNERAL' ? 'bg-gray-100 text-gray-800' :
                        item.category === 'RENTAL_MALL' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getCategoryName(item)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.provider || <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.productName || <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.paymentTerm || <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.baseAmount ? `₩${item.baseAmount.toLocaleString()}` : <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.expectedRate ? `${item.expectedRate}%` : <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.pointRate ? `${item.pointRate}%` : <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.pointAmount ? `₩${item.pointAmount.toLocaleString()}` : <span className="text-gray-400 italic">미입력</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => window.location.href = `/admin/items/${item.id}/edit`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          수정
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
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
    </div>
  );
};

export default ItemsPage;

