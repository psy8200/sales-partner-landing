'use client';

import { useEffect } from 'react';

export default function LumpSumContractsPage() {
  useEffect(() => {
    // TODO: API에서 일시납 계약 데이터 로드
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">일시납계약</h1>
            <p className="text-gray-600">개발 준비 중입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
