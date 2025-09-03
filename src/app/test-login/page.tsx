'use client';

import React, { useState } from 'react';

const TestLoginPage = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogin = async (id: string, password: string, description: string) => {
    setLoading(true);
    addResult(`테스트 시작: ${description}`);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        addResult(`✅ 성공: ${description} - 역할: ${result.user?.role}`);
      } else {
        addResult(`❌ 실패: ${description} - ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ 오류: ${description} - ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testAuthMe = async () => {
    setLoading(true);
    addResult('테스트: /api/auth/me 호출');
    
    try {
      const res = await fetch('/api/auth/me');
      const result = await res.json();
      
      if (res.ok) {
        addResult(`✅ 인증 성공: ${result.user?.name} (${result.user?.role})`);
      } else {
        addResult(`❌ 인증 실패: ${result.error}`);
      }
    } catch (error) {
      addResult(`❌ 인증 오류: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 로그인 테스트 페이지</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 테스트 버튼들 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">테스트 케이스</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => testLogin('psy', '0130', '마스터 관리자 로그인')}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                마스터 관리자 (psy/0130)
              </button>
              
              <button
                onClick={() => testLogin('superadmin@system.com', 'superadmin1234', '슈퍼 관리자 로그인')}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                슈퍼 관리자 (superadmin@system.com/superadmin1234)
              </button>
              
              <button
                onClick={() => testLogin('psy777', '0130', '마스터 파트너 로그인')}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
              >
                마스터 파트너 (psy777/0130)
              </button>
              
              <button
                onClick={() => testLogin('wrong', 'wrong', '잘못된 로그인')}
                disabled={loading}
                className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                잘못된 로그인 테스트
              </button>
              
              <button
                onClick={testAuthMe}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                현재 인증 상태 확인
              </button>
              
              <button
                onClick={clearResults}
                className="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                결과 초기화
              </button>
            </div>
          </div>
          
          {/* 테스트 결과 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">테스트 결과</h2>
            
            <div className="bg-gray-100 rounded p-4 h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">테스트를 실행하면 결과가 여기에 표시됩니다.</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 사용 가능한 계정 정보 */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 사용 가능한 테스트 계정</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded p-4">
              <h3 className="font-semibold text-blue-600">마스터 관리자</h3>
              <p>아이디: <code>psy</code></p>
              <p>비밀번호: <code>0130</code></p>
              <p>역할: ADMIN</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-semibold text-green-600">슈퍼 관리자</h3>
              <p>아이디: <code>superadmin@system.com</code></p>
              <p>비밀번호: <code>superadmin1234</code></p>
              <p>역할: ADMIN</p>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="font-semibold text-purple-600">마스터 파트너</h3>
              <p>아이디: <code>psy777</code></p>
              <p>비밀번호: <code>0130</code></p>
              <p>역할: MEMBER</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLoginPage;
