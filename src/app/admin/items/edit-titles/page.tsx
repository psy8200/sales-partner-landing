'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface CustomItem {
  name: string;
  href: string;
  icon: string;
}

const EditTitlesPage = () => {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<CustomItem[]>([]);
  const [editedItems, setEditedItems] = useState<CustomItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // URL에서 아이템 데이터 로드
  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(itemsParam));
        setItems(parsedItems);
        setEditedItems(parsedItems);
      } catch (error) {
        console.error('아이템 데이터 파싱 오류:', error);
        alert('아이템 데이터를 불러오는데 실패했습니다.');
      }
    }
  }, [searchParams]);

  // 제목 변경 핸들러
  const handleTitleChange = (index: number, newTitle: string) => {
    const updatedItems = editedItems.map((item, i) => 
      i === index ? { ...item, name: newTitle } : item
    );
    setEditedItems(updatedItems);
  };

  // 수정 반영하기
  const handleSaveChanges = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // 서버에 저장
      const response = await fetch('/api/admin/sidebar-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: editedItems }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '서버 저장에 실패했습니다.');
      }

      // localStorage도 업데이트 (백업용)
      localStorage.setItem('allItemProducts', JSON.stringify(editedItems));
      
      // 부모 창에 변경사항 알림
      if (window.opener) {
        window.opener.postMessage({
          type: 'ALL_ITEMS_UPDATED',
          items: editedItems
        }, '*');
      }
      
      alert('제목이 성공적으로 수정되었습니다!');
      window.close();
    } catch (error) {
      console.error('제목 수정 오류:', error);
      alert(`제목 수정 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 창 닫기
  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">✏️ 사이드바 제목 수정</h1>
            <p className="mt-2 text-sm text-gray-600">
              아래 목록에서 제목을 수정하고 "수정반영하기" 버튼을 클릭하세요.
            </p>
          </div>
        </div>

        {/* 제목 목록 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              커스텀 상품 목록 ({items.length}개)
            </h2>
          </div>
          
          <div className="p-6">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">수정할 커스텀 상품이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {editedItems.map((item, index) => (
                  <div key={item.href} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        상품 {index + 1}
                      </label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleTitleChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="상품 제목을 입력하세요"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? '수정 중...' : '수정반영하기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTitlesPage;
