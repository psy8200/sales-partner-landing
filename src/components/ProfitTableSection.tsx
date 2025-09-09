import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const ProfitTableSection = () => {
  const [monthlyReferrals, setMonthlyReferrals] = useState(3);
  const [monthlyRecruits, setMonthlyRecruits] = useState(3);

  // 동적으로 수익 데이터 계산
  const profitData = useMemo(() => {
    const data = [];
    
    for (let month = 1; month <= 10; month++) {
      const people = monthlyRecruits * Math.pow(monthlyReferrals, month - 1);
      
      const cashback = 33000;
      const downline = people * 22000; // 인당 22,000원
      const matching = downline * 0.1; // 10%
      const referral = monthlyReferrals * 22000; // 추천인원 * 22,000원
      const total = cashback + downline + matching + referral;
      
      data.push({
        month,
        people,
        cashback,
        downline,
        matching,
        referral,
        total
      });
    }
    
    return data;
  }, [monthlyReferrals, monthlyRecruits]);

  const currency = (n: number) => n.toLocaleString('ko-KR');

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">




        {/* 모바일용 카드 뷰 */}
        <div className="block lg:hidden">
          {/* 모바일용 입력폼 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg p-4 mb-6"
          >
            <h3 className="text-lg font-bold text-gray-900 text-center mb-4">
              월별 수익 구조 예시표
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  추천인원 매월
                </label>
                <select
                  value={monthlyReferrals}
                  onChange={(e) => setMonthlyReferrals(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  aria-label="추천인원 매월 선택"
                >
                  <option value={1}>1명</option>
                  <option value={2}>2명</option>
                  <option value={3}>3명</option>
                  <option value={4}>4명</option>
                  <option value={5}>5명</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  추천한사람이 매월
                </label>
                <select
                  value={monthlyRecruits}
                  onChange={(e) => setMonthlyRecruits(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  aria-label="추천한사람이 매월 선택"
                >
                  <option value={1}>1명</option>
                  <option value={2}>2명</option>
                  <option value={3}>3명</option>
                  <option value={4}>4명</option>
                  <option value={5}>5명</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  내가추천한 총인원
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-center">
                  <span className="text-sm font-bold text-green-600">
                    {currency(monthlyReferrals * 10)}명
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  10개월간 총 인원
                </label>
                <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-center">
                  <span className="text-sm font-bold text-blue-600">
                    {currency(profitData.reduce((sum, row) => sum + row.people, 0))}명
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {profitData.map((row, index) => (
              <motion.div
                key={`profit-row-${index}-${row.month}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg sm:text-xl font-bold text-blue-600">
                    {row.month}개월차
                  </h3>
                  <span className="text-sm sm:text-base font-semibold text-gray-600">
                    {currency(row.people)}명
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">캐시백:</span>
                    <span className="font-semibold text-green-600">₩{currency(row.cashback)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">포인트수익:</span>
                    <span className="font-semibold text-blue-600">₩{currency(row.downline)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">매칭(10%):</span>
                    <span className="font-semibold text-purple-600">₩{currency(row.matching)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">추천수당:</span>
                    <span className="font-semibold text-orange-600">₩{currency(row.referral)}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-900">총 월수익:</span>
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      ₩{currency(row.total)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* 데스크톱용 테이블 뷰 */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8"
          >
            <div className="p-6 lg:p-8 bg-blue-50 border-b border-blue-200">
              <h3 className="text-xl lg:text-2xl font-bold text-gray-900 text-center">
                월별 수익 구조 예시표
              </h3>
            </div>
            
            {/* 입력폼 */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    추천인원 매월
                  </label>
                  <select
                    value={monthlyReferrals}
                    onChange={(e) => setMonthlyReferrals(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="추천인원 매월 선택"
                  >
                    <option value={1}>1명</option>
                    <option value={2}>2명</option>
                    <option value={3}>3명</option>
                    <option value={4}>4명</option>
                    <option value={5}>5명</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    추천한사람이 매월
                  </label>
                  <select
                    value={monthlyRecruits}
                    onChange={(e) => setMonthlyRecruits(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    aria-label="추천한사람이 매월 선택"
                  >
                    <option value={1}>1명</option>
                    <option value={2}>2명</option>
                    <option value={3}>3명</option>
                    <option value={4}>4명</option>
                    <option value={5}>5명</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    내가추천한 총인원
                  </label>
                  <div className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-center">
                    <span className="text-lg font-bold text-green-600">
                      {currency(monthlyReferrals * 10)}명
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    10개월간 총 인원
                  </label>
                  <div className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-center">
                    <span className="text-lg font-bold text-blue-600">
                      {currency(profitData.reduce((sum, row) => sum + row.people, 0))}명
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm lg:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      월
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      인원수
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      캐시백
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      포인트수익<br />(다운라인)
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      매칭<br />(10%)
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      추천수당<br />(월)
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      총 월수익
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.map((row, index) => (
                    <motion.tr
                      key={`profit-table-row-${index}-${row.month}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      viewport={{ once: true }}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4 font-bold text-blue-600">
                        {row.month}
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-semibold text-gray-700">
                        {currency(row.people)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-green-600 font-semibold">
                        ₩ {currency(row.cashback)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-blue-600 font-semibold">
                        ₩ {currency(row.downline)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-purple-600 font-semibold">
                        ₩ {currency(row.matching)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-orange-600 font-semibold">
                        ₩ {currency(row.referral)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-bold text-xl text-gray-900">
                        ₩ {currency(row.total)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* 수익 구조 설명 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">💰</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">캐시백</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">매월 고정 지급되는 기본 수익</p>
            <div className="text-lg sm:text-xl font-bold text-green-600 mt-2">₩33,000</div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📈</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">포인트수익</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">다운라인 구성원들의 포인트 수익</p>
            <div className="text-lg sm:text-xl font-bold text-blue-600 mt-2">단계별 증가</div>
          </div>

                     <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
             <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🎯</div>
             <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">매칭보너스</h4>
             <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">내 추천으로 가입한 파트너 수익의 10% 매달 지급함</p>
             <div className="text-lg sm:text-xl font-bold text-purple-600 mt-2">10% 지급</div>
           </div>

                     <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
             <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">👥</div>
             <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">추천수당</h4>
             <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">매월 3명씩 신규 파트너 추천 수당</p>
             <div className="text-lg sm:text-xl font-bold text-orange-600 mt-2">₩66,000</div>
           </div>
        </motion.div>

        {/* 총 수익 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">🎉 10개월 총 수익</h3>
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            ₩{currency(profitData.reduce((sum, row) => sum + row.total, 0))}
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90">
            총 {currency(profitData.reduce((sum, row) => sum + row.people, 0))}명의 네트워크로 구성
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfitTableSection;
