'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const MemberPWAInstaller = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    // Service Worker 등록 (회원페이지 전용)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/member-sw.js')
          .then((registration) => {
            console.log('✅ Member PWA Service Worker 등록 성공:', registration);
          })
          .catch((registrationError) => {
            console.log('❌ Member PWA Service Worker 등록 실패:', registrationError);
          });
      });
    }

    // PWA 설치 프롬프트 감지
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 앱이 이미 설치되었는지 확인
    const checkIfInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInApp = (window.navigator as any).standalone;
      setIsInstalled(isStandalone || isInApp);
      
      if (isStandalone || isInApp) {
        setIsInstallable(false);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    checkIfInstalled();

    // 주기적으로 설치 상태 확인
    const interval = setInterval(checkIfInstalled, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearInterval(interval);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        (deferredPrompt as any).prompt();
        const { outcome } = await (deferredPrompt as any).userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ PWA 설치 성공');
          setIsInstallable(false);
          setIsInstalled(true);
          
          // 설치 성공 메시지
          alert('🎉 앱 설치가 완료되었습니다!\n\n이제 홈 화면에서 더 빠르게 접근할 수 있습니다.');
        } else {
          console.log('❌ PWA 설치 거부');
        }
      } catch (error) {
        console.error('PWA 설치 중 오류:', error);
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // 24시간 동안 다시 보이지 않도록 설정
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // 이미 거부했는지 확인
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const now = Date.now();
      const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);
      
      if (hoursPassed < 24) {
        setShowBanner(false);
      } else {
        localStorage.removeItem('pwa-banner-dismissed');
      }
    }
  }, []);

  // 설치 가능하고 배너를 보여야 하는 경우에만 표시
  if (!isInstallable || !showBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 shadow-2xl border border-blue-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-white text-lg">파트너센터 앱 설치</div>
              <div className="text-blue-100 text-sm mt-1">
                홈 화면에 추가하여 더 빠르게 접근하세요
              </div>
              <div className="text-blue-200 text-xs mt-1">
                📱 빠른 접근 • 🔔 알림 수신 • ⚡ 빠른 로딩
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleInstallClick}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>설치</span>
            </button>
            <button
              onClick={handleDismiss}
              className="text-white hover:text-blue-200 transition-colors p-1"
              title="24시간 동안 보지 않기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberPWAInstaller;
