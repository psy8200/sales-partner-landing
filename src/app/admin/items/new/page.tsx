'use client';

import React, { useState } from 'react';

const AddSidebarItemPage = () => {
  const [name, setName] = useState('');
  const [done, setDone] = useState(false);

  const handleApply = () => {
    const v = name.trim();
    if (!v) { alert('상품명을 입력하세요.'); return; }
    try {
      const raw = localStorage.getItem('customItems');
      const list: string[] = raw ? JSON.parse(raw) : [];
      if (!list.includes(v)) list.push(v);
      localStorage.setItem('customItems', JSON.stringify(list));
      setDone(true);
      // 부모 사이드바 반영 유도
      if (window.opener) {
        try { window.opener.localStorage.setItem('customItems', JSON.stringify(list)); } catch {}
      }
      setTimeout(()=>{
        window.close();
      }, 600);
    } catch {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-[180px] p-4">
      <h1 className="text-lg font-semibold text-gray-900 mb-3">사이드바 상품 추가</h1>
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">상품명</label>
        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="예: 특화 패키지"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          onClick={handleApply}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          반영하기
        </button>
        {done && <div className="text-green-600 text-sm mt-2">반영되었습니다. 창이 곧 닫힙니다…</div>}
      </div>
    </div>
  );
};

export default AddSidebarItemPage;






