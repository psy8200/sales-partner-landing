'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';

const ProfitTablePage = () => {
  const profitData = [
    { level: 0, members: 1, rate: 30, description: '본인' },
    { level: 1, members: 3, rate: 20, description: '직접 추천' },
    { level: 2, members: 9, rate: 10, description: '2차 추천' },
    { level: 3, members: 27, rate: 10, description: '3차 추천' },
    { level: 4, members: 81, rate: 10, description: '4차 추천' },
    { level: 5, members: 243, rate: 10, description: '5차 추천' },
    { level: 6, members: 729, rate: 5, description: '6차 추천' },
    { level: 7, members: 2187, rate: 5, description: '7차 추천' },
    { level: 8, members: 6561, rate: 5, description: '8차 추천' },
    { level: 9, members: 19683, rate: 3, description: '9차 추천' },
    { level: 10, members: 59049, rate: 2, description: '10차 추천' }
  ];

  const totalMembers = profitData.reduce((sum, item) => sum + item.members, 0);
  const totalRate = profitData.reduce((sum, item) => sum + item.rate, 0);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 헤더 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                수익 배분 구조
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              3트리 11단계 시스템으로 <span className="text-yellow-400 font-bold">110% 수익률</span> 달성
            </p>
          </motion.div>

          {/* 통계 카드들 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16"
          >
            <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-xl p-6 border border-yellow-400/30 text-center">
              <div className="text-3xl font-black text-yellow-400 mb-2">{totalMembers.toLocaleString()}명</div>
              <div className="text-gray-300 text-sm">전체 네트워크</div>
            </div>
            <div className="bg-gradient-to-br from-purple-400/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-6 border border-purple-400/30 text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">{totalRate}%</div>
              <div className="text-gray-300 text-sm">총 수익률</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400/20 to-cyan-500/20 backdrop-blur-sm rounded-xl p-6 border border-blue-400/30 text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">11단계</div>
              <div className="text-gray-300 text-sm">수익 배분</div>
            </div>
            <div className="bg-gradient-to-br from-green-400/20 to-emerald-500/20 backdrop-blur-sm rounded-xl p-6 border border-green-400/30 text-center">
              <div className="text-3xl font-black text-green-400 mb-2">3배</div>
              <div className="text-gray-300 text-sm">단계별 확장</div>
            </div>
          </motion.div>

          {/* 메인 테이블 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16"
          >
            <h2 className="text-3xl font-black text-white text-center mb-8">
              📊 단계별 수익 구조 상세
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-4 px-6 text-yellow-400 font-bold text-left">단계</th>
                    <th className="py-4 px-6 text-purple-400 font-bold text-left">설명</th>
                    <th className="py-4 px-6 text-blue-400 font-bold text-right">인원수</th>
                    <th className="py-4 px-6 text-green-400 font-bold text-right">수익률</th>
                    <th className="py-4 px-6 text-yellow-400 font-bold text-right">예상 수익</th>
                    <th className="py-4 px-6 text-cyan-400 font-bold text-right">누적 수익</th>
                  </tr>
                </thead>
                <tbody>
                  {profitData.map((item, index) => {
                    const expectedProfit = item.members * 100000 * item.rate / 100;
                    const cumulativeProfit = profitData
                      .slice(0, index + 1)
                      .reduce((sum, data) => sum + (data.members * 100000 * data.rate / 100), 0);
                    
                    return (
                      <motion.tr
                        key={item.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-black font-bold text-sm mr-3">
                              {item.level}
                            </div>
                            <span className="text-white font-bold">{item.level}단계</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-300">{item.description}</td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-blue-400 font-bold">{item.members.toLocaleString()}명</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-green-400 font-bold">{item.rate}%</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-yellow-300 font-bold">₩{expectedProfit.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="text-cyan-300 font-bold">₩{cumulativeProfit.toLocaleString()}</span>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* 수익률 차트 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16"
          >
            <h2 className="text-3xl font-black text-white text-center mb-8">
              📈 단계별 수익률 분포
            </h2>
            <div className="space-y-4">
              {profitData.map((item, index) => (
                <div key={item.level} className="flex items-center">
                  <div className="w-16 text-white font-bold text-sm">{item.level}단계</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white/10 rounded-full h-4 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.rate / 30) * 100}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.1 }}
                        className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                  <div className="w-20 text-right text-green-400 font-bold">{item.rate}%</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 하단 요약 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-center"
          >
            <div className="bg-gradient-to-br from-yellow-400/20 to-amber-500/20 backdrop-blur-sm rounded-2xl p-8 border border-yellow-400/30">
              <h2 className="text-3xl font-black text-white mb-4">
                💰 총 예상 수익
              </h2>
              <div className="text-5xl font-black text-yellow-400 mb-4">
                ₩{(totalMembers * 100000 * totalRate / 100).toLocaleString()}
              </div>
              <p className="text-gray-300 text-lg">
                88,572명 네트워크 × 10만원 × 110% 수익률
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ProfitTablePage; 