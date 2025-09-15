'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfitCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfitCalculatorModal: React.FC<ProfitCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    referralCount: 3, // 월 추천 인원
    decisionPointsPerPerson: 100000, // 인당 결정포인트
    indirectReferralCount: 3, // 간접추천 인원
    months: 12 // 계산 기간
  });
  
  const [isCalculating, setIsCalculating] = useState(false);

  // 수익 계산 로직 (useMemo로 최적화) - 개인이 받는 금액만 계산
  const profitData = useMemo(() => {
    const { referralCount, indirectReferralCount, months } = formData;
    
    const results = [];
    let previousMonthTotalPeople = 0; // 이전 달 총인원
    let cumulativeDirectReferrals = 0; // 누적 직추천 인원
    let cumulativeIndirectReferrals = 0; // 누적 간접추천 인원
    
    for (let month = 1; month <= months; month++) {
      // 직추천과 간접추천 계산
      const directReferrals = referralCount; // 매월 내가 직접 추천하는 인원
      
      // 간접추천 계산 (누적 증가)
      let monthlyIndirectReferrals = 0;
      if (month > 1) {
        // 매달 직추천 인원 × 간접추천 설정값만큼 새로 추가
        monthlyIndirectReferrals = directReferrals * indirectReferralCount;
      }
      
      // 총인원 계산 (이전 달 총인원이 각각 3명씩 추천)
      let newPeopleFromPreviousMonth = 0;
      if (month > 1) {
        newPeopleFromPreviousMonth = previousMonthTotalPeople * indirectReferralCount;
      }
      
      const currentMonthTotalPeople = directReferrals + monthlyIndirectReferrals + newPeopleFromPreviousMonth; // 이번 달 총인원
      
      // 누적 계산
      cumulativeDirectReferrals += directReferrals; // 누적 직추천 인원
      cumulativeIndirectReferrals += monthlyIndirectReferrals; // 누적 간접추천 인원
      
      // 다음 달을 위해 현재 달 총인원 저장
      previousMonthTotalPeople = currentMonthTotalPeople;
      
      // 기준포인트 (표시용 - 총인원에 비례)
      const displayBasePoints = 100000 * currentMonthTotalPeople; // 100,000P × 총인원 (표시용)
      const basePoints = 100000; // 실제 계산용 기준포인트 (고정)
      
      // 내가 받는 수수료 계산
      const basicCommission = basePoints * 0.3; // 기본수당 30% = 30,000P (매월 고정)
      const recruitmentCommission = cumulativeDirectReferrals * basePoints * 0.2; // 모집수당 = 누적직추천 × 100,000P × 20%
      const indirectCommission = cumulativeIndirectReferrals * basePoints * 0.1; // 간접수당 = 누적간접추천 × 100,000P × 10%
      // 배당지급 계산 (기본배당 + 배당수당)
      const basicDividendTotal = displayBasePoints * 0.1; // 기본배당 10% = 기준포인트 × 10%
      const basicDividendPayment = basicDividendTotal / currentMonthTotalPeople; // 내가 받는 기본배당 = 전체 기본배당 ÷ 총인원
      
      // 단순화된 배당수당 계산
      // 1. 제원 = 총인원 × 기준포인트(100,000P) × 20%
      const dividendPool = currentMonthTotalPeople * 100000 * 0.2;
      
      // 2. 월별 배당수당 비율 (내가 최고등급이므로 고정 비율 적용)
      const dividendRates = {
        1: 0,    // 1월: 0% (아직 추천인 없음)
        2: 1.0,  // 2월: 100%
        3: 0.8,  // 3월: 80%
        4: 0.6,  // 4월: 60%
        5: 0.5,  // 5월: 50%
        6: 0.4,  // 6월: 40%
        7: 0.3,  // 7월: 30%
        8: 0.15, // 8월: 15%
        9: 0.08, // 9월: 8%
        10: 0.04, // 10월: 4%
        11: 0.02, // 11월: 2%
        12: 0.01  // 12월: 1%
      };
      
      // 3. 내가 받는 배당수당 = 제원 × 해당 월 비율
      const rate = dividendRates[month as keyof typeof dividendRates] || 0;
      const levelDividendPayment = dividendPool * rate;
      
      const dividendPayment = basicDividendPayment + levelDividendPayment; // 총 배당지급
      const total = basicCommission + recruitmentCommission + indirectCommission + dividendPayment;
      
      results.push({
        month,
        people: directReferrals, // 내가 직접 추천한 인원
        decisionPoints: displayBasePoints, // 기준포인트 (표시용)
        basicCommission,
        recruitmentCommission,
        indirectCommission,
        basicDividendPayment, // 기본배당
        levelDividendPayment, // 배당수당
        dividendPayment, // 총 배당지급
        total,
        cumulativeTotalPeople: currentMonthTotalPeople // 이번 달 총인원
      });
    }
    
    return results;
  }, [formData]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('ko-KR') + 'P';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">💰 개인 수익 계산기</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-200 transition-colors text-2xl"
                >
                  ×
                </button>
              </div>
              <p className="text-blue-100 mt-2">나만의 수익을 미리 계산해보세요</p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* 설정 섹션 */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">⚙️ 수익 계산 설정</h3>
                  <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    나의기준포인트 100,000P
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      월 추천 인원
                    </label>
                    <select
                      value={formData.referralCount}
                      onChange={(e) => setFormData({...formData, referralCount: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="월 추천 인원 선택"
                    >
                      <option value={0}>0명</option>
                      <option value={1}>1명</option>
                      <option value={2}>2명</option>
                      <option value={3}>3명</option>
                      <option value={4}>4명</option>
                      <option value={5}>5명</option>
                      <option value={6}>6명</option>
                      <option value={7}>7명</option>
                      <option value={8}>8명</option>
                      <option value={9}>9명</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      월내가추천한추천인이신규회원유치인원
                    </label>
                    <select
                      value={formData.indirectReferralCount}
                      onChange={(e) => setFormData({...formData, indirectReferralCount: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="월내가추천한추천인이신규회원유치인원 선택"
                    >
                      <option value={0}>0명</option>
                      <option value={1}>1명</option>
                      <option value={2}>2명</option>
                      <option value={3}>3명</option>
                      <option value={4}>4명</option>
                      <option value={5}>5명</option>
                      <option value={6}>6명</option>
                      <option value={7}>7명</option>
                      <option value={8}>8명</option>
                      <option value={9}>9명</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      계산 기간 (개월)
                    </label>
                    <select
                      value={formData.months}
                      onChange={(e) => setFormData({...formData, months: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      aria-label="계산 기간 선택"
                    >
                      <option value={6}>6개월</option>
                      <option value={10}>10개월</option>
                      <option value={12}>12개월</option>
                    </select>
                  </div>
                </div>
              </div>


              {/* 데스크톱용 테이블 뷰 */}
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                  <div className="p-6 bg-blue-50 border-b border-blue-200">
                    <h3 className="text-xl font-bold text-gray-900 text-center">
                      💰 월별 수익 구조 시뮬레이션
                    </h3>
                  </div>
                  
                  {/* 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">월</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">직추천</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">간접추천</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">총인원</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">기준포인트</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">기본수당</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">모집수당</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">간접수당</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">기본배당</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">배당수당</th>
                          <th className="px-1 py-1 text-right text-xs font-semibold text-gray-900">내가받는총액</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {profitData.map((row, index) => {
                          const directReferrals = formData.referralCount;
                          // 간접추천은 누적값 표시
                          const cumulativeIndirectReferrals = row.month > 1 ? 
                            directReferrals * formData.indirectReferralCount * (row.month - 1) : 0;
                          return (
                            <tr key={row.month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-1 py-1 text-xs font-medium text-gray-900">{row.month}월</td>
                              <td className="px-1 py-1 text-xs text-right text-gray-900">{formatNumber(directReferrals)}</td>
                              <td className="px-1 py-1 text-xs text-right text-gray-900">{formatNumber(cumulativeIndirectReferrals)}</td>
                              <td className="px-1 py-1 text-xs text-right text-gray-900 font-semibold">{formatNumber(row.cumulativeTotalPeople)}</td>
                              <td className="px-1 py-1 text-xs text-right text-gray-900">{formatCurrency(row.decisionPoints)}</td>
                              <td className="px-1 py-1 text-xs text-right text-blue-600 font-semibold">{formatCurrency(row.basicCommission)}</td>
                              <td className="px-1 py-1 text-xs text-right text-green-600 font-semibold">{formatCurrency(row.recruitmentCommission)}</td>
                              <td className="px-1 py-1 text-xs text-right text-purple-600 font-semibold">{formatCurrency(row.indirectCommission)}</td>
                              <td className="px-1 py-1 text-xs text-right text-orange-600 font-semibold">{formatCurrency(row.basicDividendPayment)}</td>
                              <td className="px-1 py-1 text-xs text-right text-red-600 font-semibold">{formatCurrency(row.levelDividendPayment)}</td>
                              <td className="px-1 py-1 text-xs text-right text-gray-900 font-bold">{formatCurrency(row.total)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 모바일용 카드들 */}
              <div className="lg:hidden space-y-4">
                {profitData.slice(0, 5).map((row, index) => (
                  <div key={row.month} className="bg-white rounded-xl shadow-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-bold text-gray-900">{row.month}개월</h4>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">인원수</div>
                        <div className="font-bold text-gray-900">{formatNumber(row.people)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-gray-600 font-semibold mb-1">결정포인트</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.decisionPoints)}</div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-blue-600 font-semibold mb-1">기본수당</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.basicCommission)}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-green-600 font-semibold mb-1">모집수당</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.recruitmentCommission)}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-purple-600 font-semibold mb-1">간접수당</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.indirectCommission)}</div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <div className="text-orange-600 font-semibold mb-1">기본배당</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.basicDividendPayment)}</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-3">
                        <div className="text-red-600 font-semibold mb-1">배당수당</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.levelDividendPayment)}</div>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="text-gray-600 font-semibold mb-1">총지급액</div>
                        <div className="text-gray-900 font-bold">{formatCurrency(row.total)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>


              {/* 닫기 버튼 */}
              <div className="mt-6">
                <button
                  onClick={onClose}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfitCalculatorModal;
