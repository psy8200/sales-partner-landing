import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProfitCalculatorModal from './ProfitCalculatorModal';

const HeroSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const handleSignup = () => {
    window.open('/signup', '_blank', 'width=520,height=800,scrollbars=yes,resizable=yes');
  };
  
  const handleOpenCalc = () => {
    setIsModalOpen(true);
  };

  // PWA 설치 가능 여부 감지
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // PWA 설치 가능한 경우
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA 설치됨');
      }
      
      setDeferredPrompt(null);
      setShowInstallButton(false);
    } else {
      // PWA 설치 불가능한 경우 - 모바일 앱 스토어로 안내
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('iOS에서는 Safari 브라우저에서 "공유" 버튼을 눌러 "홈 화면에 추가"를 선택하세요!');
      } else if (isAndroid) {
        alert('Android에서는 Chrome 브라우저에서 "메뉴" 버튼을 눌러 "홈 화면에 추가"를 선택하세요!');
      } else {
        alert('모바일 브라우저에서 접속하시면 앱을 설치할 수 있습니다!');
      }
    }
  };

  return (
    <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 flex items-center justify-center overflow-hidden bg-white">
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
           className="mb-8 sm:mb-12"
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
           className="mb-8 sm:mb-12"
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
           className="text-xl sm:text-2xl text-gray-600 mb-16 sm:mb-20 lg:mb-24 max-w-4xl mx-auto leading-relaxed font-light space-y-4"
         >
           <span className="block">보험료 • 통신료 • 렌탈료 • 상조 • 쇼핑몰</span>
           <span className="block font-semibold text-blue-600">이미 내는 돈으로 매월 수익 창출</span>
           <span className="block">전국 <span className="text-blue-600 font-bold">800+ 성공 파트너</span>와 함께하는 안전한 네트워크</span>
         </motion.p>

         {/* CTA 버튼들 - 반응형 최적화 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.6 }}
           className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 justify-center mb-12 sm:mb-16"
         >
           {/* 지금 시작하기 버튼 - 반응형 패딩 및 텍스트 크기 */}
           <button
             onClick={handleSignup}
             className="group relative px-4 py-3.5 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 shadow-xl hover:shadow-blue-500/20 transform hover:scale-105 border border-blue-500/40 flex-1 sm:flex-none"
           >
             <span className="relative z-10">🎯 지금 시작하기</span>
             <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
           </button>
          
           {/* 수익 계산해보기 버튼 - 반응형 패딩 및 텍스트 크기 */}
           <button 
             onClick={handleOpenCalc} 
             className="group px-4 py-3.5 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-blue-600 text-white rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg lg:text-xl font-semibold hover:bg-blue-500 transition-all duration-300 shadow-lg inline-flex items-center justify-center border border-blue-500/50 flex-1 sm:flex-none"
           >
             💰 수익 계산해보기
           </button>

           {/* PWA 앱 다운로드 버튼 - 항상 표시 */}
           <button
             onClick={handleInstallClick}
             className="group px-4 py-3.5 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white hover:from-green-500 hover:to-emerald-500 transition-all duration-300 shadow-xl hover:shadow-green-500/20 transform hover:scale-105 border border-green-500/40 flex-1 sm:flex-none"
           >
             <span className="relative z-10">📱 파트너스앱</span>
             <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-15 transition-opacity duration-300"></div>
           </button>
         </motion.div>

         {/* 럭셔리 보증 배지 - 더 간결하게 */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.8 }}
           className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-3"
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

      {/* 수익 계산 모달 */}
      <ProfitCalculatorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </section>
  );
};

export default HeroSection; 