'use client';

import React, { useEffect, useState } from 'react';

// PWA 설치 프롬프트 타입 정의
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// PWA 상태 타입 정의
interface PwaState {
  isInstallable: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  hasServiceWorker: boolean;
  serviceWorkerStatus: 'active' | 'inactive' | 'installing' | 'error';
}

// PWA 컨텍스트 타입 정의
interface PwaContextType {
  pwaState: PwaState;
  installPwa: () => Promise<void>;
  updateServiceWorker: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

// PWA 컨텍스트 생성
const PwaContext = React.createContext<PwaContextType | null>(null);

// PWA Provider 컴포넌트
export const PwaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pwaState, setPwaState] = useState<PwaState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    hasServiceWorker: false,
    serviceWorkerStatus: 'inactive'
  });

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // PWA 설치 가능 여부 확인
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setPwaState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      setDeferredPrompt(null);
      console.log('PWA가 설치되었습니다.');
    };

    // PWA 설치 이벤트 리스너 등록
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 이미 설치된 PWA인지 확인
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setPwaState(prev => ({ ...prev, isInstalled: true }));
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // 온라인/오프라인 상태 확인
  useEffect(() => {
    const handleOnline = () => setPwaState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setPwaState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Service Worker 등록 및 상태 확인
  useEffect(() => {
    /*
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker 등록 성공:', registration);
          setPwaState(prev => ({ 
            ...prev, 
            hasServiceWorker: true,
            serviceWorkerStatus: 'active'
          }));

          // 업데이트 확인
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              setPwaState(prev => ({ ...prev, serviceWorkerStatus: 'installing' }));
              
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // 새 버전이 설치됨
                    setPwaState(prev => ({ ...prev, serviceWorkerStatus: 'active' }));
                    console.log('새 버전이 설치되었습니다. 페이지를 새로고침하세요.');
                  } else {
                    // 첫 설치
                    setPwaState(prev => ({ ...prev, serviceWorkerStatus: 'active' }));
                    console.log('Service Worker가 설치되었습니다.');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error);
          setPwaState(prev => ({ ...prev, serviceWorkerStatus: 'error' }));
        });
    }
    */
  }, []);

  // PWA 설치 함수
  const installPwa = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('PWA 설치가 불가능합니다.');
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 승인했습니다.');
        setPwaState(prev => ({ ...prev, isInstalled: true, isInstallable: false }));
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다.');
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('PWA 설치 실패:', error);
      throw error;
    }
  };

  // Service Worker 업데이트 함수
  const updateServiceWorker = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('Service Worker 업데이트 완료');
        }
      } catch (error) {
        console.error('Service Worker 업데이트 실패:', error);
        throw error;
      }
    }
  };

  // 업데이트 확인 함수
  const checkForUpdates = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
          console.log('업데이트 확인 완료');
        }
      } catch (error) {
        console.error('업데이트 확인 실패:', error);
        throw error;
      }
    }
  };

  const contextValue: PwaContextType = {
    pwaState,
    installPwa,
    updateServiceWorker,
    checkForUpdates
  };

  return (
    <PwaContext.Provider value={contextValue}>
      {children}
    </PwaContext.Provider>
  );
};

// PWA 훅
export const usePwa = (): PwaContextType => {
  const context = React.useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa는 PwaProvider 내에서 사용되어야 합니다.');
  }
  return context;
};

// PWA 설치 버튼 컴포넌트
export const PwaInstallButton: React.FC<{
  className?: string;
  children?: React.ReactNode;
}> = ({ className = '', children }) => {
  const { pwaState, installPwa } = usePwa();
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    if (!pwaState.isInstallable) return;

    setIsInstalling(true);
    try {
      await installPwa();
    } catch (error) {
      console.error('PWA 설치 실패:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!pwaState.isInstallable || pwaState.isInstalled) {
    return null;
  }

  return (
    <button
      onClick={handleInstall}
      disabled={isInstalling}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 ${className}`}
    >
      {isInstalling ? '설치 중...' : (children || '앱 설치')}
    </button>
  );
};

// PWA 상태 표시 컴포넌트
export const PwaStatus: React.FC = () => {
  const { pwaState } = usePwa();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex items-center space-x-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${
          pwaState.isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          {pwaState.isOnline ? '온라인' : '오프라인'}
        </span>
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <div>PWA 설치: {pwaState.isInstalled ? '✅' : '❌'}</div>
        <div>Service Worker: {pwaState.hasServiceWorker ? '✅' : '❌'}</div>
        <div>상태: {pwaState.serviceWorkerStatus}</div>
      </div>
    </div>
  );
};
