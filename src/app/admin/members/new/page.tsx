'use client';

import React, { useState } from 'react';

const PartnerMemberNewPage = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'MEMBER',
    status: 'ACTIVE',
    points: 0,
    bankName: '',
    bankAccount: '',
    accountHolder: '',
    settlementCycle: 'MONTHLY',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === 'points' ? Number(value) : value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || '생성 실패');
      alert('파트너 회원이 생성되었습니다.');
      window.location.href = '/admin/members';
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '알 수 없는 오류');
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">파트너 회원 등록</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="이름을 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="연락처를 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">이메일</label>
            <input name="email" value={form.email} onChange={handleChange} placeholder="이메일을 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">초기 포인트</label>
            <input type="number" name="points" value={form.points} onChange={handleChange} placeholder="초기 포인트를 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">은행명</label>
            <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="은행명을 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">계좌번호</label>
            <input name="bankAccount" value={form.bankAccount} onChange={handleChange} placeholder="계좌번호를 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">예금주</label>
            <input name="accountHolder" value={form.accountHolder} onChange={handleChange} placeholder="예금주를 입력하세요" className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">정산 주기</label>
            <select name="settlementCycle" value={form.settlementCycle} onChange={handleChange} className="w-full border px-3 py-2 rounded" aria-label="정산 주기 선택">
              <option value="MONTHLY">월 정산</option>
              <option value="QUARTERLY">분기 정산</option>
              <option value="YEARLY">연 정산</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={() => history.back()} className="px-4 py-2 border rounded">취소</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">저장</button>
        </div>
      </div>
    </div>
  );
};

export default PartnerMemberNewPage;





