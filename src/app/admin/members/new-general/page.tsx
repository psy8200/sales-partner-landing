'use client';

import React, { useState } from 'react';

const GeneralMemberNewPage = () => {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'STAFF', status: 'ACTIVE' }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || '생성 실패');
      alert('일반 회원이 생성되었습니다.');
      window.location.href = '/admin/members';
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '알 수 없는 오류');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">일반회원 등록</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input 
              name="name" 
              value={form.name} 
              onChange={handleChange} 
              className="w-full border px-3 py-2 rounded" 
              aria-label="이름 입력"
              title="이름을 입력하세요"
              placeholder="이름을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input 
              name="phone" 
              value={form.phone} 
              onChange={handleChange} 
              className="w-full border px-3 py-2 rounded" 
              aria-label="연락처 입력"
              title="연락처를 입력하세요"
              placeholder="연락처를 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input 
              name="email" 
              value={form.email} 
              onChange={handleChange} 
              className="w-full border px-3 py-2 rounded" 
              aria-label="이메일 입력"
              title="이메일을 입력하세요"
              placeholder="이메일을 입력하세요"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => history.back()} className="px-4 py-2 border rounded">취소</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralMemberNewPage;





