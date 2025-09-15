import React from 'react';
import { motion } from 'framer-motion';

const ProfitTableSection = () => {
  // 고정 예시 데이터 (가정: 매월 3명씩 추천, 인당 10만원 결정포인트)
  const profitData = [
    { month: 1, people: 3, decisionPoints: 300000, basicCommission: 90000, recruitmentCommission: 60000, indirectCommission: 30000, dividendPayment: 90000, total: 270000 },
    { month: 2, people: 9, decisionPoints: 900000, basicCommission: 270000, recruitmentCommission: 180000, indirectCommission: 90000, dividendPayment: 270000, total: 810000 },
    { month: 3, people: 27, decisionPoints: 2700000, basicCommission: 810000, recruitmentCommission: 540000, indirectCommission: 270000, dividendPayment: 810000, total: 2430000 },
    { month: 4, people: 81, decisionPoints: 8100000, basicCommission: 2430000, recruitmentCommission: 1620000, indirectCommission: 810000, dividendPayment: 2430000, total: 7290000 },
    { month: 5, people: 243, decisionPoints: 24300000, basicCommission: 7290000, recruitmentCommission: 4860000, indirectCommission: 2430000, dividendPayment: 7290000, total: 21870000 },
    { month: 6, people: 729, decisionPoints: 72900000, basicCommission: 21870000, recruitmentCommission: 14580000, indirectCommission: 7290000, dividendPayment: 21870000, total: 65610000 },
    { month: 7, people: 2187, decisionPoints: 218700000, basicCommission: 65610000, recruitmentCommission: 43740000, indirectCommission: 21870000, dividendPayment: 65610000, total: 196830000 },
    { month: 8, people: 6561, decisionPoints: 656100000, basicCommission: 196830000, recruitmentCommission: 131220000, indirectCommission: 65610000, dividendPayment: 196830000, total: 590490000 },
    { month: 9, people: 19683, decisionPoints: 1968300000, basicCommission: 590490000, recruitmentCommission: 393660000, indirectCommission: 196830000, dividendPayment: 590490000, total: 1771470000 },
    { month: 10, people: 59049, decisionPoints: 5904900000, basicCommission: 1771470000, recruitmentCommission: 1180980000, indirectCommission: 590490000, dividendPayment: 1771470000, total: 5314410000 }
  ];

  const currency = (n: number) => n.toLocaleString('ko-KR') + 'P';
  const formatNumber = (n: number) => n.toLocaleString('ko-KR');

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* 모바일용 카드 뷰 */}
        <div className="block lg:hidden">
          {/* 가정 설명 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl shadow-lg p-4 mb-6"
          >
            <div className="text-sm">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium">매월 3명 신규 파트너 추천+추천인도 3명씩 신규파트너 추천</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium">인당 평균 10만원 결정포인트</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium">10개월 연속으로 달성시</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <span className="text-gray-700 font-medium">총 {formatNumber(profitData.reduce((sum, row) => sum + row.people, 0))}명</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 모바일용 카드들 */}
          {profitData.slice(0, 5).map((row, index) => (
            <motion.div
              key={row.month}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl shadow-lg p-4 mb-4"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg sm:text-xl font-bold text-blue-600">
                  {row.month}개월차
                </h3>
                <span className="text-sm sm:text-base font-semibold text-gray-600">
                  {formatNumber(row.people)}명
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">결정포인트:</span>
                  <span className="font-semibold text-gray-800">{currency(row.decisionPoints)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기본수당:</span>
                  <span className="font-semibold text-green-600">{currency(row.basicCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">모집수당:</span>
                  <span className="font-semibold text-blue-600">{currency(row.recruitmentCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">간접수당:</span>
                  <span className="font-semibold text-purple-600">{currency(row.indirectCommission)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">배당지급:</span>
                  <span className="font-semibold text-orange-600">{currency(row.dividendPayment)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold text-gray-900">총 월수익:</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">
                    {currency(row.total)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
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
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 text-center">
                💰 월별 수익 구조 시뮬레이션
              </h3>
            </div>
            
            {/* 가정 설명 */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="text-center">
                <div className="text-sm">
                  <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">매월 3명 신규 파트너 추천+추천인도 3명씩 신규파트너 추천</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">인당 평균 10만원 결정포인트</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">10개월 연속으로 달성시</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                      <span className="text-gray-700 font-medium">총 {formatNumber(profitData.reduce((sum, row) => sum + row.people, 0))}명</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      월
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      인원수
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      결정포인트
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      기본수당
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      모집수당
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      간접수당
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      배당지급
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-left font-bold text-gray-900 whitespace-nowrap">
                      총 월수익
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.map((row, index) => (
                    <motion.tr
                      key={row.month}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 lg:px-6 py-4 font-bold text-blue-600">
                        {row.month}
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-semibold text-gray-700">
                        {formatNumber(row.people)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-gray-800 font-semibold">
                        {currency(row.decisionPoints)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-green-600 font-semibold">
                        {currency(row.basicCommission)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-blue-600 font-semibold">
                        {currency(row.recruitmentCommission)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-purple-600 font-semibold">
                        {currency(row.indirectCommission)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-orange-600 font-semibold">
                        {currency(row.dividendPayment)}
                      </td>
                      <td className="px-4 lg:px-6 py-4 font-bold text-xl text-gray-900">
                        {currency(row.total)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* 수수료 설명 카드들 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">💰</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">기본수당</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">결정포인트의 30% 지급</p>
            <div className="text-lg sm:text-xl font-bold text-green-600 mt-2">30%</div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📈</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">모집수당</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">내 추천으로 가입한 파트너의 결정포인트 20%</p>
            <div className="text-lg sm:text-xl font-bold text-blue-600 mt-2">20%</div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🎯</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">간접수당</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">내가 추천한 회원의 추천으로 가입한 파트너의 결정포인트 10%</p>
            <div className="text-lg sm:text-xl font-bold text-purple-600 mt-2">10%</div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg text-center">
            <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🏆</div>
            <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2">배당지급</h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">기본배당(10%) + 배당등급별(20%) 통합 지급</p>
            <div className="text-lg sm:text-xl font-bold text-orange-600 mt-2">30%</div>
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
            {currency(profitData.reduce((sum, row) => sum + row.total, 0))}
          </div>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90">
            총 {formatNumber(profitData.reduce((sum, row) => sum + row.people, 0))}명의 네트워크로 구성
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default ProfitTableSection;