import React from 'react';
import { motion } from 'framer-motion';

const CTASection = () => {


  const handleLogin = () => {
    window.open('/signup', '_blank', 'width=520,height=800,scrollbars=yes,resizable=yes');
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* 깔끔한 배경 효과 */}
      <div className="absolute inset-0">
        {/* 미묘한 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        
        {/* 섬세한 애니메이션 요소들 */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full blur-3xl animate-pulse [animation-delay:2s]"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-full blur-3xl animate-pulse [animation-delay:4s]"></div>
        
        {/* 미묘한 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.03)_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 프리미엄 배지 - 더 간결하게 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full shadow-sm">
            <span className="text-blue-600 font-medium text-sm tracking-wide">🚀 지금이 마지막 기회입니다!</span>
          </div>
        </motion.div>

        {/* 메인 헤드라인 - 크기 조정 및 간격 개선 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
              프리미엄 파트너
            </span>가 되세요!
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
            보험료 • 통신료 • 렌탈료 • 상조 • 쇼핑몰<br />
            <span className="font-semibold text-blue-600">이미 내는 돈으로 매월 수익 창출</span><br />
            전국 <span className="text-blue-600 font-bold">800+ 성공 파트너</span>와 함께하는 안전한 네트워크
          </p>
        </motion.div>

        {/* CTA 버튼들 - 더 간결하고 명확하게 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="space-y-6 mb-16"
        >
                     <button
             onClick={handleLogin}
             className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-14 py-5 rounded-xl text-xl font-black hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 border border-blue-500/40"
           >
             🎯 지금 프리미엄 파트너 가입하기
           </button>
        </motion.div>

        
      </div>
    </section>
  );
};

export default CTASection; 