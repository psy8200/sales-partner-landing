'use client';

import React, { useState } from 'react';

const GeneralLogin = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || '로그인 실패');
      alert('로그인되었습니다.');
      window.location.href = '/mypage';
    } catch (e: unknown) {
              alert(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">일반회원 로그인(임시)</h1>
        <p className="text-sm text-gray-600 mb-6">아이디는 전화번호 8자리입니다.</p>
        <div className="space-y-4">
          <input value={id} onChange={(e)=>setId(e.target.value)} placeholder="아이디(전화번호 8자리)" maxLength={8} inputMode="numeric" className="w-full border px-3 py-2 rounded" />
          <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="비밀번호" type="password" className="w-full border px-3 py-2 rounded" />
          <button onClick={handleLogin} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">{loading?'로그인 중...':'로그인'}</button>
        </div>
      </div>
    </div>
  );
};

export default GeneralLogin;





