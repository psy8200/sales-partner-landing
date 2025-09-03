'use client';

import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type InsuranceRow = {
  id: string;
  insurer: string; // 보험사
  productName: string; // 상품명
  paymentTerm: string; // 납입기간
  baseAmount: number; // 기준금액
  expectedRate: number; // 예상지급율(%)
  pointRate: number; // 포인트전환율(%)
  pointAmount: number; // 포인트지급액
};

const NewContractPage = () => {
  const params = useSearchParams();
  const type = params.get('type') || '';

  // 상단 설정바 입력 상태
  const [insurer, setInsurer] = useState('');
  const [productName, setProductName] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [expectedRate, setExpectedRate] = useState<string>('');
  const [pointRate, setPointRate] = useState<string>('');

  const calcPointAmount = useMemo(() => {
    const base = parseFloat(baseAmount || '0');
    const exp = parseFloat(expectedRate || '0');
    const pr = parseFloat(pointRate || '0');
    // 포인트지급액 = 기준금액 × (예상지급율/100) × (포인트전환율/100)
    const v = base * (exp / 100) * (pr / 100);
    return Number.isFinite(v) ? Math.max(0, Math.round(v)) : 0;
  }, [baseAmount, expectedRate, pointRate]);

  // 하단 테이블 데이터
  const [rows, setRows] = useState<InsuranceRow[]>([]);

  const handleAdd = () => {
    if (!insurer.trim() || !productName.trim() || !paymentTerm.trim()) {
      alert('보험사, 상품명, 납입기간을 입력해주세요.');
      return;
    }
    if (!baseAmount || !expectedRate || !pointRate) {
      alert('기준금액, 예상지급율, 포인트전환율을 모두 입력해주세요.');
      return;
    }

    const row: InsuranceRow = {
      id: crypto.randomUUID(),
      insurer: insurer.trim(),
      productName: productName.trim(),
      paymentTerm: paymentTerm.trim(),
      baseAmount: parseFloat(baseAmount),
      expectedRate: parseFloat(expectedRate),
      pointRate: parseFloat(pointRate),
      pointAmount: calcPointAmount,
    };
    setRows((prev) => [row, ...prev]);

    // 입력값 유지 여부: 보험사/상품명/납입기간은 유지, 금액/율은 초기화
    setBaseAmount('');
    setExpectedRate('');
    setPointRate('');
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  if (type !== 'insurance') {
    return (
      <div className="p-4">
        <h1 className="text-xl font-semibold text-gray-900">새 계약</h1>
        <p className="text-gray-600 mt-2">type=insurance 파라미터로 접근해주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 타이틀 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">보험상담신청 설정</h1>
        <p className="mt-1 text-sm text-gray-600">상단에서 상품을 설정 후 추가하기를 누르면 하단 테이블에 반영됩니다.</p>
      </div>

      {/* 설정바 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">보험사</label>
            <input
              value={insurer}
              onChange={(e) => setInsurer(e.target.value)}
              placeholder="예: 삼성생명"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">상품명</label>
            <input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="예: 종신보험 패키지"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">납입기간</label>
            <input
              value={paymentTerm}
              onChange={(e) => setPaymentTerm(e.target.value)}
              placeholder="예: 20년 납"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">기준금액</label>
            <input
              type="number"
              min="0"
              value={baseAmount}
              onChange={(e) => setBaseAmount(e.target.value)}
              placeholder="원 단위"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">예상지급율(%)</label>
            <input
              type="number"
              min="0" max="100" step="0.01"
              value={expectedRate}
              onChange={(e) => setExpectedRate(e.target.value)}
              placeholder="예: 30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">포인트전환율(%)</label>
            <input
              type="number"
              min="0" max="100" step="0.01"
              value={pointRate}
              onChange={(e) => setPointRate(e.target.value)}
              placeholder="예: 100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">포인트지급액</label>
            <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-900">
              {calcPointAmount.toLocaleString()} P
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              추가하기
            </button>
          </div>
        </div>
      </div>

      {/* 하단 테이블 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">설정된 상품</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">보험사</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">납입기간</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기준금액</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예상지급율(%)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트전환율(%)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트지급액</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-4 text-center text-sm text-gray-500">등록된 항목이 없습니다.</td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.insurer}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.productName}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.paymentTerm}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.baseAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.expectedRate}%</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.pointRate}%</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.pointAmount.toLocaleString()} P</td>
                    <td className="px-3 py-2 text-sm whitespace-nowrap">
                      <button onClick={() => removeRow(r.id)} className="text-red-600 hover:text-red-800">삭제</button>
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

export default NewContractPage;












