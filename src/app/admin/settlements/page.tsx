'use client';

import React, { useState } from 'react';

const SettlementsPage = () => {
  const [filter, setFilter] = useState('all');
  
  // 샘플 정산 데이터
  const settlements = [
    { id: 1, partner: '김철수', period: '2024-01', amount: '500만원', commission: '50만원', status: '완료', date: '2024-01-31' },
    { id: 2, partner: '박민수', period: '2024-01', amount: '1,000만원', commission: '100만원', status: '진행중', date: '2024-01-31' },
    { id: 3, partner: '최지영', period: '2024-01', amount: '300만원', commission: '30만원', status: '대기', date: '2024-01-31' },
    { id: 4, partner: '이영희', period: '2024-01', amount: '800만원', commission: '80만원', status: '완료', date: '2024-01-31' },
  ];

  const filteredSettlements = filter === 'all' 
    ? settlements 
    : settlements.filter(settlement => settlement.status === filter);

  return (
    <div className="space-y-6">
      {/* 페이지 제목 */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">📊 정산 관리</h1>
        <p className="mt-2 text-lg text-gray-600">파트너 정산 현황을 관리하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">수금완료금액</dt>
                  <dd className="text-2xl font-semibold text-gray-900">₩2.6억</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">✅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">정산요청금액</dt>
                  <dd className="text-2xl font-semibold text-gray-900">₩1.2억</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">⏳</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">정산완료금액</dt>
                  <dd className="text-2xl font-semibold text-gray-900">₩8,500만원</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">정산미요청금액</dt>
                  <dd className="text-2xl font-semibold text-gray-900">₩5,500만원</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 액션 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">정산 미요청리스트</h2>
            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-3">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  aria-label="정산 상태 필터"
                  title="정산 상태 필터"
                >
                                  <option key="settlements-all" value="all">전체</option>
                <option key="settlements-완료" value="완료">완료</option>
                <option key="settlements-진행중" value="진행중">진행중</option>
                <option key="settlements-대기" value="대기">대기</option>
                </select>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  + 새 정산
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  정산 완료
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 정산 테이블 */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">파트너</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정산기간</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">매출액</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">커미션</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">정산일</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSettlements.map((settlement) => (
                <tr key={settlement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{settlement.partner}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{settlement.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{settlement.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{settlement.commission}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      settlement.status === '완료' ? 'bg-green-100 text-green-800' :
                      settlement.status === '진행중' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {settlement.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{settlement.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">상세</button>
                      <button className="text-green-600 hover:text-green-900">수정</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SettlementsPage;

