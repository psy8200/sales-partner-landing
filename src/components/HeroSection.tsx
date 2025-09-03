import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const handleSignup = () => {
    window.open('/signup', '_blank', 'width=520,height=800,scrollbars=yes,resizable=yes');
  };
  const handleOpenCalc = () => {
    window.open('/profit-structure', '_blank', 'width=1100,height=800,scrollbars=yes,resizable=yes');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* 깔끔한 배경 효과 */}
      <div className="absolute inset-0">
        {/* 미묘한 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50"></div>
        
        {/* 섬세한 애니메이션 요소들 */}
        <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-r from-green-50 to-emerald-50 rounded-full blur-3xl animate-pulse animation-delay-2s"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-full blur-3xl animate-pulse animation-delay-4s"></div>
        
        {/* 미묘한 패턴 */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.03)_1px,_transparent_1px)] bg-[length:24px_24px]"></div>
        </div>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                 {/* 프리미엄 배지 - 더 간결하게 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="mb-16"
         >
           <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full shadow-sm">
             <span className="text-blue-600 font-semibold text-base tracking-wide">⭐ 국내 최초 수익이 누적되는 자동화 플랫폼</span>
           </div>
         </motion.div>

         {/* 메인 헤드라인 - 크기 조정 및 간격 개선 */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="mb-16"
         >
                       <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-relaxed tracking-tight">
              <span className="block mb-8">매월 내는 돈을</span>
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent">
                수익으로 바꾸세요
              </span>
            </h1>
         </motion.div>

         {/* 서브 헤드라인 - 더 구체적이고 간결하게 */}
         <motion.p
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.4 }}
           className="text-xl sm:text-2xl text-gray-600 mb-20 max-w-4xl mx-auto leading-relaxed font-light space-y-4"
         >
           <span className="block">보험료 • 통신료 • 렌탈료 • 상조 • 쇼핑몰</span>
           <span className="block font-semibold text-blue-600">이미 내는 돈으로 매월 수익 창출</span>
           <span className="block">전국 <span className="text-blue-600 font-bold">800+ 성공 파트너</span>와 함께하는 안전한 네트워크</span>
         </motion.p>

         {/* CTA 버튼들 - 더 간결하고 명확하게 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.6 }}
           className="space-y-6 md:space-y-0 md:space-x-6 md:flex md:justify-center mb-24"
         >
                     <button
             onClick={handleSignup}
             className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-lg font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 border border-blue-500/40"
           >
             <span className="relative z-10">🎯 지금 시작하기</span>
             <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
           </button>
          
          <button onClick={handleOpenCalc} className="group px-10 py-5 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-500 transition-all duration-300 shadow-lg inline-flex items-center border border-blue-500/50">
            💰 수익 계산해보기
          </button>
                 </motion.div>

         {/* 럭셔리 보증 배지 - 더 간결하게 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.8 }}
           className="mt-12 flex flex-wrap justify-center gap-3"
         >
           <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
             <span className="text-blue-600 mr-1.5 text-sm">🛡️</span>
             <span className="text-blue-700 text-xs font-medium">법적 보호</span>
           </div>
           <div className="flex items-center px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
             <span className="text-green-600 mr-1.5 text-sm">💰</span>
             <span className="text-green-700 text-xs font-medium">즉시 수익</span>
           </div>
           <div className="flex items-center px-3 py-1.5 bg-purple-50 rounded-full border border-purple-200">
             <span className="text-purple-600 mr-1.5 text-sm">⚡</span>
             <span className="text-purple-700 text-xs font-medium">5분 가입</span>
           </div>
           <div className="flex items-center px-3 py-1.5 bg-orange-50 rounded-full border border-orange-200">
             <span className="text-orange-600 mr-1.5 text-sm">🎯</span>
             <span className="text-orange-700 text-xs font-medium">무료 시작</span>
           </div>
         </motion.div>

       </div>

      
    </section>
  );
};

export default HeroSection; 