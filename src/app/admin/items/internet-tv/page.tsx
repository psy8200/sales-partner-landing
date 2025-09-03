'use client';

import React, { useMemo, useState } from 'react';
import { ItemSetting } from '@/types';

type InternetTvRow = {
  id: string;
  provider: string;
  productName: string;
  paymentTerm: string;
  baseAmount: number;
  expectedRate: number;
  pointRate: number;
  pointAmount: number;
};

const InternetTvItemsPage = () => {
  const [provider, setProvider] = useState('');
  const [productName, setProductName] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('');
  const [baseAmount, setBaseAmount] = useState<string>('');
  const [expectedRate, setExpectedRate] = useState<string>('');
  const [pointRate, setPointRate] = useState<string>('');

  const monthlyRate = useMemo(() => {
    const exp = parseFloat(expectedRate || '0');
    return (exp / 24).toFixed(2);
  }, [expectedRate]);

  const monthlyAmount = useMemo(() => {
    const base = parseFloat(baseAmount || '0');
    const exp = parseFloat(expectedRate || '0');
    return Math.max(0, Math.round(base * (exp / 24 / 100)));
  }, [baseAmount, expectedRate]);

  const calcPointAmount = useMemo(() => {
    const monthly = monthlyAmount;
    const pr = parseFloat(pointRate || '0');
    return Math.max(0, Math.round(monthly * (pr / 100)));
  }, [monthlyAmount, pointRate]);

  const [rows, setRows] = useState<InternetTvRow[]>([]);

  React.useEffect(() => {
    fetch('/api/admin/items/settings?category=INTERNET_TV')
      .then(r=>r.json())
      .then(d=>{
        if (d?.items) {
          setRows(d.items.map((x: ItemSetting)=>({
            id: x.id,
            provider: x.provider,
            productName: x.productName,
            paymentTerm: x.paymentTerm,
            baseAmount: x.baseAmount,
            expectedRate: x.expectedRate,
            pointRate: x.pointRate,
            pointAmount: x.pointAmount,
          })));
        }
      }).catch(()=>{});
  }, []);

  const handleAdd = () => {
    if (!provider.trim() || !productName.trim() || !paymentTerm.trim()) {
      alert('제공사, 상품명, 납입기간을 입력해주세요.');
      return;
    }
    if (!baseAmount || !expectedRate || !pointRate) {
      alert('기준금액, 예상지급율, 포인트전환율을 모두 입력해주세요.');
      return;
    }
    const payload = {
      category: 'INTERNET_TV',
      provider: provider.trim(),
      productName: productName.trim(),
      paymentTerm: paymentTerm.trim(),
      baseAmount: parseFloat(baseAmount),
      expectedRate: parseFloat(expectedRate),
      pointRate: parseFloat(pointRate),
      pointAmount: calcPointAmount,
    };
    fetch('/api/admin/items/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r=>r.json()).then(d=>{
      if (d?.item) {
        setRows(prev=>[{
          id: d.item.id,
          provider: d.item.provider,
          productName: d.item.productName,
          paymentTerm: d.item.paymentTerm,
          baseAmount: d.item.baseAmount,
          expectedRate: d.item.expectedRate,
          pointRate: d.item.pointRate,
          pointAmount: d.item.pointAmount,
        }, ...prev]);
      }
    });

    setBaseAmount('');
    setExpectedRate('');
    setPointRate('');
  };

  // 삭제/수정 불가 정책: UI에서 삭제 기능을 제공하지 않습니다.

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">인터넷+TV 결합상품신청 설정</h1>
        <p className="mt-1 text-sm text-gray-600">상단에서 상품을 설정 후 추가하기 클릭 시 하단 테이블에 반영됩니다.</p>
      </div>

      {/* 설정바 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 space-y-4">
          {/* 1줄: 제공사 / 상품명 / 납입기간 / 기준금액 / 지급율 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">제공사</label>
              <input value={provider} onChange={(e)=>setProvider(e.target.value)} placeholder="예: KT" title="제공사" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">상품명</label>
              <input value={productName} onChange={(e)=>setProductName(e.target.value)} placeholder="예: 인터넷+TV 결합상품" title="상품명" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">납입기간</label>
              <select 
                value={paymentTerm} 
                onChange={(e)=>setPaymentTerm(e.target.value)} 
                title="납입기간" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                                 <option key="default-payment-term" value="">납입기간을 선택하세요</option>
                <option key="internet-tv-일시납" value="일시납">일시납</option>
                <option key="internet-tv-1년납" value="1년납">1년납</option>
                <option key="internet-tv-2년납" value="2년납">2년납</option>
                <option key="internet-tv-3년납" value="3년납">3년납</option>
                <option key="internet-tv-5년납" value="5년납">5년납</option>
                <option key="internet-tv-7년납" value="7년납">7년납</option>
                <option key="internet-tv-10년납" value="10년납">10년납</option>
                <option key="internet-tv-15년납" value="15년납">15년납</option>
                <option key="internet-tv-20년납" value="20년납">20년납</option>
                <option key="internet-tv-25년납" value="25년납">25년납</option>
                <option key="internet-tv-30년납" value="30년납">30년납</option>
                <option key="internet-tv-전기납" value="전기납">전기납</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">기준금액</label>
              <input type="number" min="0" value={baseAmount} onChange={(e)=>setBaseAmount(e.target.value)} placeholder="원 단위" title="기준금액" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">지급율(%)</label>
              <input type="number" min="0" max="100" step="0.01" value={expectedRate} onChange={(e)=>setExpectedRate(e.target.value)} placeholder="예: 30" title="예상지급율(%)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          {/* 2줄: 월별지급율 / 월별기준금액 / 포인트전환율 / 결정포인트 / 추가하기버튼 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">월별지급율(%)</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-900 flex items-center">{monthlyRate}%</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">월별기준금액</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-900 flex items-center">{monthlyAmount.toLocaleString()}원</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">포인트전환율(%)</label>
              <input type="number" min="0" max="100" step="0.01" value={pointRate} onChange={(e)=>setPointRate(e.target.value)} placeholder="예: 100" title="포인트전환율(%)" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">결정포인트</label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-900 flex items-center">{calcPointAmount.toLocaleString()} P</div>
            </div>
            <div className="flex items-end">
              <button onClick={handleAdd} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">추가하기</button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <p>지급율 ÷ 24 = 월별지급율 | 월별기준금액 × 포인트전환율 = 결정포인트</p>
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
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제공사</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">납입기간</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">기준금액</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예상지급율(%)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월별지급율(%)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">월결정금액</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트전환율(%)</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포인트결정금액</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-center text-sm text-gray-500">등록된 항목이 없습니다.</td>
                </tr>
              ) : (
                rows.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.provider}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.productName}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.paymentTerm}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.baseAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.expectedRate}%</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{(r.expectedRate / 24).toFixed(2)}%</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{Math.round(r.baseAmount * (r.expectedRate / 24 / 100)).toLocaleString()}원</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.pointRate}%</td>
                    <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap">{r.pointAmount.toLocaleString()} P</td>
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

export default InternetTvItemsPage;
