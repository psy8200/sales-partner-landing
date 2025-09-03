import React from 'react';
import { motion } from 'framer-motion';
import LevelIcon from '@/components/LevelIcon';

const RewardSection = () => {
  const stageRewards = [
    {
      stage: 3,
      people: "3(27명)",
      icon: "🎫",
      title: "롯데/신세계/현대 상품권 지급",
      description: "10만원 상품권 5장 지급함",
      image: "롯데/신세계/현대 상품권 10만원권 5장",
      color: "from-teal-400 to-cyan-500"
    },
    {
      stage: 4,
      people: "4(81명)",
      icon: "🎫",
      title: "상품권 200만원 지급",
      description: "10만원 상품권 20장 지급함",
      image: "롯데/신세계/현대 상품권 10만원권 20장",
      color: "from-green-400 to-emerald-500"
    },
    {
      stage: 5,
      people: "5(243명)",
      icon: "💰",
      title: "상품권 500만원 지급",
      description: "50만원 상품권 10장 지급함",
      image: "롯데/신세계/현대 상품권 50만원권 10장",
      color: "from-yellow-400 to-orange-500"
    },
    {
      stage: 6,
      people: "6(729명)",
      icon: "✈️",
      title: "최고급동남아 3박4일 여행권 2인권 + 여행경비 500만원",
      description: "발리/몰디브/태국/등 원하는 여행지로 선택가능함",
      image: "왕복 비즈니스석으로 편한여행",
      color: "from-blue-400 to-cyan-500"
    },
    {
      stage: 7,
      people: "7(2,187명)",
      icon: "🛳️",
      title: "비즈니스석 + 유럽크루즈 2인 + 여행경비 1,000만원",
      description: "지중해 / 북유렵 / 카리브해 / 동남아4인 선택가능함",
      image: "리무진 공항 픽업서비스제공",
      color: "from-purple-400 to-pink-500"
    },
    {
      stage: 8,
      people: "8(6,561명)",
      icon: "🚗",
      title: "고급세단 벤츠 또는 동급 + 주유상품권 500만원추가지급",
      description: "(BMW5시리즈,제네시스G80, 아우디A6등 선택가능)",
      image: "주유상품권 5만원권 100장추가지급",
      color: "from-gray-400 to-gray-600"
    },
    {
      stage: 9,
      people: "9(19,683명)",
      icon: "🏎️",
      title: "최고급세단 벤츠 S-Class 또는 동급 + 전용기사제공",
      description: "S-클래스, BMW 7시리즈, 제네시스 G90 동급 선택",
      image: "회사에서 전용기사를 제공해드립니다.",
      color: "from-indigo-400 to-purple-500"
    },
    {
      stage: 10,
      people: "10(59,049명)",
      icon: "🏆",
      title: "드림카 + 전용기사 + 법인카드 + 부사장급 임원대우",
      description: "드림카 선택 벤틀리 / 마이바흐 / 마세라티 / 람보르기니 / 포르쉐 등 선택가능",
      image: "1년 2회 해외여행제공 및 경비지원",
      color: "from-red-400 to-pink-500"
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            🎁 <span className="text-blue-400">회원님의 성공을 축하하는 특별 혜택 보너스</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-4xl mx-auto px-4">
            추천단계별 승급혜택 - 각 추천단계를 달성할 때마다 지급되는 특별 보너스<br />
            승급 즉시 지급됩니다.
          </p>
        </motion.div>

        {/* 단계별 보상 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {stageRewards.map((reward, index) => (
            <motion.div
              key={`reward-stage-${index}-${reward.stage}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* 레벨 아이콘 */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-blue-500">
                <LevelIcon level={reward.stage} size="lg" className="text-blue-600" />
              </div>

              {/* 아이콘과 인원수 */}
              <div className="text-center mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl mb-2">{reward.icon}</div>
                <div className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {reward.people}
                </div>
              </div>

              {/* 제목 */}
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                {reward.title}
              </h3>

              {/* 설명 */}
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                {reward.description}
              </p>

              {/* 이미지 설명 */}
              <div className="text-xs text-gray-500 italic">
                📸 {reward.image}
              </div>

              {/* 하단 그라데이션 */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${reward.color} rounded-b-xl sm:rounded-b-2xl`}></div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </div>

        {/* 특별 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center"
        >
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
            🎯 단계별 승급 조건
          </h3>
          <p className="text-base sm:text-lg md:text-xl opacity-90 mb-4 sm:mb-6">
            각 단계별로 필요한 인원수를 달성하면 즉시 해당 단계의 혜택이 지급됩니다.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 text-sm sm:text-base">
            {stageRewards.map((reward, index) => (
              <div key={`reward-info-${index}-${reward.stage}`} className="bg-white/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <LevelIcon level={reward.stage} size="sm" className="text-white" />
                  <span className="font-bold text-lg sm:text-xl">{reward.stage}단계</span>
                </div>
                <div className="text-xs sm:text-sm opacity-90">{reward.people}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 추가 혜택 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">즉시 지급</h4>
            <p className="text-sm sm:text-base text-gray-300">단계 달성 즉시 혜택 지급</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🎁</div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">실물 혜택</h4>
            <p className="text-sm sm:text-base text-gray-300">상품권, 여행, 고급차량 등</p>
          </div>
          
          <div className="bg-white/10 rounded-xl p-6 text-center">
            <div className="text-3xl mb-3">🏆</div>
            <h4 className="text-lg sm:text-xl font-bold text-white mb-2">단계별 증가</h4>
            <p className="text-sm sm:text-base text-gray-300">단계가 올라갈수록 더 큰 혜택</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default RewardSection; 