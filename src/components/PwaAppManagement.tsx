'use client';

import React, { useState, useRef, useEffect } from 'react';
import ErrorModal from '@/components/modals/ErrorModal';
import { 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  Tablet,
  RotateCcw,
  Globe,
  Settings,
  Download,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';
import { DeviceFrame } from './DeviceFrame';
import { usePwa, PwaInstallButton } from './PwaProvider';
import { useMobileOptimization, MobileButton, MobileCard, MobileInput } from './MobileOptimized';

// 디바이스 프레임 정의
const DEVICE_FRAMES = {
  'iPhone 15 Pro': {
    width: 393,
    height: 852,
    frame: 'iphone-15-pro',
    screenWidth: 393,
    screenHeight: 852,
    notch: true,
    homeIndicator: true,
  },
  'iPhone 15': {
    width: 393,
    height: 852,
    frame: 'iphone-15',
    screenWidth: 393,
    screenHeight: 852,
    notch: true,
    homeIndicator: true,
  },
  'iPhone SE': {
    width: 375,
    height: 667,
    frame: 'iphone-se',
    screenWidth: 375,
    screenHeight: 667,
    notch: false,
    homeIndicator: false,
  },
  'Galaxy S24': {
    width: 384,
    height: 854,
    frame: 'galaxy-s24',
    screenWidth: 384,
    screenHeight: 854,
    notch: false,
    homeIndicator: false,
  },
  'Galaxy S24 Ultra': {
    width: 412,
    height: 915,
    frame: 'galaxy-s24-ultra',
    screenWidth: 412,
    screenHeight: 915,
    notch: false,
    homeIndicator: false,
  },
  'Galaxy A54': {
    width: 384,
    height: 854,
    frame: 'galaxy-a54',
    screenWidth: 384,
    screenHeight: 854,
    notch: false,
    homeIndicator: false,
  },
  'iPad': {
    width: 768,
    height: 1024,
    frame: 'ipad',
    screenWidth: 768,
    screenHeight: 1024,
    notch: false,
    homeIndicator: false,
  },
  'iPad Pro': {
    width: 834,
    height: 1194,
    frame: 'ipad-pro',
    screenWidth: 834,
    screenHeight: 1194,
    notch: false,
    homeIndicator: false,
  },
};

export const PwaAppManagement: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<keyof typeof DEVICE_FRAMES>('iPhone 15 Pro');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [customUrl, setCustomUrl] = useState('/pwa-login');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pwaStatus, setPwaStatus] = useState<'installed' | 'available' | 'not-supported'>('available');
  const [pwaCurrentPath, setPwaCurrentPath] = useState('/pwa-login'); // PWA 현재 경로
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 모달 상태
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(3000); // 3초마다 새로고침

  const currentDevice = DEVICE_FRAMES[selectedDevice];
  const isTablet = selectedDevice.includes('iPad');

  // 온라인 상태 확인
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 자동 새로고침 기능
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (autoRefresh && iframeRef.current) {
      intervalId = setInterval(() => {
        if (iframeRef.current) {
          // 현재 PWA 경로를 유지하면서 자동 새로고침
          const currentPath = pwaCurrentPath || '/pwa-login';
          const baseUrl = `${window.location.origin}${currentPath}`;
          const timestamp = Date.now();
          const randomParam = Math.random().toString(36).substring(7);
          const sessionId = Math.random().toString(36).substring(2, 15);
          
          iframeRef.current.src = '';
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.src = `${baseUrl}?t=${timestamp}&r=${randomParam}&s=${sessionId}&auto=true&nocache=${Date.now()}`;
              setRefreshKey(prev => prev + 1);
            }
          }, 200);
        }
      }, refreshInterval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, refreshInterval, pwaCurrentPath]);

  // PWA 상태 확인
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          setPwaStatus('installed');
        } else {
          setPwaStatus('available');
        }
      });
    } else {
      setPwaStatus('not-supported');
    }
  }, []);

  // PWA URL 변경 메시지 리스너 (강화된 버전)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('PWA 메시지 수신:', event.data);
      if (event.data && event.data.type === 'PWA_URL_CHANGE') {
        const newUrl = event.data.url;
        console.log('PWA iframe에서 URL 변경 알림 받음:', newUrl, '현재 PWA 경로:', pwaCurrentPath);
        if (typeof newUrl === 'string' && newUrl.startsWith('/')) {
          setPwaCurrentPath(prevPath => {
            if (prevPath !== newUrl) {
              console.log('PWA 경로 업데이트:', prevPath, '->', newUrl);
              return newUrl;
            }
            return prevPath;
          });
        }
      }
      
      // PWA 네비게이션 메시지 처리
      if (event.data && event.data.type === 'PWA_NAVIGATE') {
        const targetUrl = event.data.url;
        console.log('PWA iframe에서 네비게이션 요청 받음:', targetUrl);
        if (typeof targetUrl === 'string' && targetUrl.startsWith('/')) {
          setCustomUrl(targetUrl);
          setPwaCurrentPath(targetUrl);
          console.log('PWA URL 변경됨:', targetUrl);
        }
      }
      
      // PWA 네비게이션 메시지 처리 (웹과 동일한 방식)
      if (event.data && event.data.type === 'PWA_NAVIGATE') {
        const targetUrl = event.data.url;
        console.log('PWA iframe에서 네비게이션 요청 받음:', targetUrl);
        if (typeof targetUrl === 'string' && targetUrl.startsWith('/')) {
          setCustomUrl(targetUrl);
          setPwaCurrentPath(targetUrl);
          console.log('PWA URL 변경됨:', targetUrl);
        }
      }
      
      // PWA 에러 alert 메시지 처리
      if (event.data && event.data.type === 'PWA_ERROR_ALERT') {
        const message = event.data.message;
        console.log('PWA iframe에서 에러 alert 요청 받음:', message);
        
        // 부모 창에서 에러 모달 표시
        setErrorMessage(message);
        setShowErrorModal(true);
      }
      
      // PWA 창닫기 메시지 처리
      if (event.data && event.data.type === 'PWA_CLOSE_WINDOW') {
        console.log('PWA iframe에서 창닫기 요청 받음');
        // PWA 개발도구에서는 창을 닫을 수 없으므로 /member로 이동
        setCustomUrl('/member');
        setPwaCurrentPath('/member');
        console.log('창닫기 대신 /member로 이동');
      }
      
      // PWA 탭 변경 메시지 처리
      if (event.data && event.data.type === 'PWA_TAB_CHANGE') {
        const tabId = event.data.tabId;
        console.log('PWA iframe에서 탭 변경 요청 받음:', tabId);
        
        // 탭에 따른 페이지 이동
        let targetPath = '/member';
        switch (tabId) {
          case 'home':
            targetPath = '/member';
            break;
          case 'benefits':
            targetPath = '/benefits';
            break;
          case 'settlement':
            targetPath = '/settlement';
            break;
          case 'partner':
            targetPath = '/partner';
            break;
          case 'more':
            targetPath = '/more';
            break;
          default:
            targetPath = '/member';
        }
        
        setCustomUrl(targetPath);
        setPwaCurrentPath(targetPath);
        setRefreshKey(prev => prev + 1); // iframe 강제 리렌더링
        console.log('PWA 탭 변경으로 이동:', targetPath);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [pwaCurrentPath]);

  // 페이지 URL이 변경될 때마다 PWA 경로도 즉시 업데이트
  useEffect(() => {
    console.log('페이지 URL 변경됨:', customUrl);
    setPwaCurrentPath(customUrl);
  }, [customUrl]);

  // 현재 iframe URL을 즉시 확인하여 PWA 경로 업데이트
  useEffect(() => {
    const checkCurrentUrl = () => {
      if (iframeRef.current?.contentWindow) {
        try {
          const currentPath = iframeRef.current.contentWindow.location.pathname;
          if (currentPath && currentPath !== pwaCurrentPath) {
            console.log('현재 URL 즉시 확인:', currentPath);
            setPwaCurrentPath(currentPath);
          }
        } catch (error) {
          // cross-origin 에러는 무시
        }
      }
    };

    // 즉시 확인
    checkCurrentUrl();
    
    // 주기적으로 확인 (1초마다)
    const interval = setInterval(checkCurrentUrl, 1000);
    
    return () => clearInterval(interval);
  }, [pwaCurrentPath]);

  // 실시간 새로고침 (해당 화면만)
  const handleRefreshPreview = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    
    // 로딩 애니메이션을 위한 딜레이
    setTimeout(() => {
      setIsLoading(false);
      
      // 새로고침 후 현재 URL 확인하여 PWA 경로 업데이트
      setTimeout(() => {
        if (iframeRef.current?.contentWindow) {
          try {
            const currentPath = iframeRef.current.contentWindow.location.pathname;
            if (currentPath) {
              console.log('새로고침 후 URL 확인:', currentPath);
              setPwaCurrentPath(currentPath);
            }
          } catch (error) {
            // cross-origin 에러는 무시
          }
        }
      }, 500);
    }, 1000);
  };

  // 강제 새로고침 (캐시 무시)
  const handleForceRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      // 현재 PWA 경로를 유지하면서 새로고침
      const currentPath = pwaCurrentPath || '/pwa-login';
      const baseUrl = `${window.location.origin}${currentPath}`;
      
      // iframe src를 빈 문자열로 설정하고 속성 제거
      iframeRef.current.src = '';
      iframeRef.current.removeAttribute('src');
      
      // 완전히 새로운 URL로 로드 (캐시 무시)
      setTimeout(() => {
        if (iframeRef.current) {
          const timestamp = Date.now();
          const randomParam = Math.random().toString(36).substring(7);
          const sessionId = Math.random().toString(36).substring(2, 15);
          const cacheBuster = Math.random().toString(36).substring(2, 8);
          
          // 여러 캐시 무시 파라미터와 헤더 추가
          const newUrl = `${baseUrl}?t=${timestamp}&r=${randomParam}&s=${sessionId}&cb=${cacheBuster}&force=true&nocache=${Date.now()}&refresh=${Math.random()}`;
          
          // iframe에 새로운 src 설정
          iframeRef.current.src = newUrl;
          
          // customUrl도 현재 경로로 업데이트
          setCustomUrl(currentPath);
          
          // refreshKey 업데이트로 React 리렌더링 강제
          setRefreshKey(prev => prev + 1);
          
          // 로딩 상태 해제
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      }, 200);
    }
  };

  // 디바이스 회전
  const handleRotate = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  // iframe 로드 완료
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // iframe 로드 후 현재 URL 확인하여 PWA 경로 업데이트
    setTimeout(() => {
      if (iframeRef.current?.contentWindow) {
        try {
          const currentPath = iframeRef.current.contentWindow.location.pathname;
          if (currentPath && currentPath !== pwaCurrentPath) {
            console.log('iframe 로드 후 URL 확인:', currentPath);
            setPwaCurrentPath(currentPath);
          }
        } catch (error) {
          // cross-origin 에러는 무시
        }
      }
    }, 1000);
    
    // iframe 내부에 URL 변경 감지 스크립트 주입
    if (iframeRef.current?.contentWindow) {
      try {
        const script = `
          console.log('PWA 개발도구 스크립트 주입 시작');
          if (window.pwaDevToolsScriptLoaded) { console.log('PWA 개발도구 스크립트 이미 로드됨'); return; }
          window.pwaDevToolsScriptLoaded = true;
          
          let lastNotifiedUrl = window.location.pathname;
          
          function notifyUrlChange() {
            const currentUrl = window.location.pathname;
            if (currentUrl !== lastNotifiedUrl) {
              lastNotifiedUrl = currentUrl;
              window.parent.postMessage({ type: 'PWA_URL_CHANGE', url: currentUrl }, '*');
              console.log('PWA URL 변경 알림:', currentUrl);
            }
          }
          
          // History API 오버라이드
          const originalPushState = history.pushState;
          const originalReplaceState = history.replaceState;
          
          history.pushState = function(...args) {
            originalPushState.apply(this, args);
            setTimeout(notifyUrlChange, 100);
          };
          
          history.replaceState = function(...args) {
            originalReplaceState.apply(this, args);
            setTimeout(notifyUrlChange, 100);
          };
          
          // popstate 이벤트
          window.addEventListener('popstate', function() {
            setTimeout(notifyUrlChange, 100);
          });
          
          // MutationObserver로 window.location 변경 감지
          const observer = new MutationObserver(function() {
            setTimeout(notifyUrlChange, 100);
          });
          
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Next.js Router 오버라이드 (만약 존재한다면)
          if (window.next && window.next.router) {
            const originalPush = window.next.router.push;
            const originalReplace = window.next.router.replace;
            
            window.next.router.push = function(...args) {
              const result = originalPush.apply(this, args);
              setTimeout(notifyUrlChange, 100);
              return result;
            };
            
            window.next.router.replace = function(...args) {
              const result = originalReplace.apply(this, args);
              setTimeout(notifyUrlChange, 100);
              return result;
            };
          }
          
          // 초기 URL 알림 (더 자주 시도)
          setTimeout(notifyUrlChange, 100);
          setTimeout(notifyUrlChange, 300);
          setTimeout(notifyUrlChange, 500);
          setTimeout(notifyUrlChange, 1000);
          setTimeout(notifyUrlChange, 2000);
          setTimeout(notifyUrlChange, 3000);
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(notifyUrlChange, 100);
              setTimeout(notifyUrlChange, 500);
              setTimeout(notifyUrlChange, 1000);
            });
          }
          
          window.addEventListener('load', function() {
            setTimeout(notifyUrlChange, 100);
            setTimeout(notifyUrlChange, 500);
            setTimeout(notifyUrlChange, 1000);
          });
          
          // 주기적으로 URL 확인 (백업)
          setInterval(notifyUrlChange, 2000);
          
          console.log('PWA 개발도구 URL 동기화 스크립트 로드됨, 현재 URL:', window.location.pathname);
        `;
        
        iframeRef.current.contentWindow.eval(script);
        
        // 주기적으로 iframe URL 확인 (백업 방법)
        const urlCheckInterval = setInterval(() => {
          if (iframeRef.current?.contentWindow) {
            try {
              const iframeUrl = iframeRef.current.contentWindow.location.pathname;
              if (iframeUrl) {
                setPwaCurrentPath(prevPath => {
                  if (prevPath !== iframeUrl) {
                    console.log('주기적 URL 확인으로 PWA 경로 업데이트:', prevPath, '->', iframeUrl);
                    return iframeUrl;
                  }
                  return prevPath;
                });
              }
            } catch (error) {
              // cross-origin 에러는 무시
            }
          }
        }, 1000); // 1초마다 확인 (더 빠른 반응)
        
        setTimeout(() => {
          clearInterval(urlCheckInterval);
        }, 60000); // 60초 후 중단 (더 오래 확인)
        
      } catch (error) {
        console.log('PWA iframe 스크립트 주입 실패:', error);
      }
    }
  };

  // PWA 경로 적용 함수
  const handleApplyPwaPath = () => {
    if (pwaCurrentPath !== customUrl) {
      console.log('PWA 경로 적용:', pwaCurrentPath);
      setCustomUrl(pwaCurrentPath);
    }
  };

  // PWA 설치
  const handleInstallPwa = async () => {
    if ('serviceWorker' in navigator) {
      try {
        // const registration = await navigator.serviceWorker.register('/sw.js');
        // console.log('PWA 설치 완료:', registration);
        console.log('PWA 설치 완료 (Service Worker 비활성화됨)');
        setPwaStatus('installed');
      } catch (error) {
        console.error('PWA 설치 실패:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* PWA 상태 및 컨트롤 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">PWA 앱 관리</h2>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-4 h-4 mr-1" />
                <span className="text-sm">온라인</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="w-4 h-4 mr-1" />
                <span className="text-sm">오프라인</span>
              </div>
            )}
          </div>
        </div>

        {/* PWA 상태 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">PWA 상태</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {pwaStatus === 'installed' && '설치됨'}
                  {pwaStatus === 'available' && '설치 가능'}
                  {pwaStatus === 'not-supported' && '지원 안됨'}
                </p>
              </div>
              {pwaStatus === 'installed' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {pwaStatus === 'available' && <AlertCircle className="w-5 h-5 text-yellow-500" />}
              {pwaStatus === 'not-supported' && <AlertCircle className="w-5 h-5 text-red-500" />}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">서비스 워커</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {pwaStatus !== 'not-supported' ? '활성화됨' : '비활성화됨'}
                </p>
              </div>
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-700">오프라인 지원</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {pwaStatus === 'installed' ? '지원됨' : '미지원'}
                </p>
              </div>
              <Download className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>

        {/* PWA 설치 버튼 */}
        {pwaStatus === 'available' && (
          <div className="flex justify-center">
            <button
              onClick={handleInstallPwa}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              PWA 설치
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 컨트롤 패널 */}
        <div className="xl:col-span-1">
          {/* 개발 도구 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">개발 도구</h3>
            
            {/* 페이지 URL 설정 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                페이지 URL
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="/pwa-login"
                />
                <button
                  onClick={handleRefreshPreview}
                  className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                  title="URL 새로고침"
                >
                  <Globe className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 자동 새로고침 설정 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                자동 새로고침
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-600">활성화</span>
                </label>
                {autoRefresh && (
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={1000}>1초</option>
                    <option value={2000}>2초</option>
                    <option value={3000}>3초</option>
                    <option value={5000}>5초</option>
                    <option value={10000}>10초</option>
                  </select>
                )}
              </div>
            </div>

            {/* 강제 새로고침 버튼 */}
            <div className="mb-4">
              <button
                onClick={handleForceRefresh}
                disabled={isLoading}
                className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                title="캐시 무시하고 강제 새로고침"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? '새로고침 중...' : '강제 새로고침'}
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                캐시를 완전히 무시하고 최신 버전을 로드합니다
              </p>
            </div>

            {/* PWA 경로 표시 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PWA 경로
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pwaCurrentPath}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                  placeholder="/pwa-login"
                />
                <button
                  onClick={handleApplyPwaPath}
                  disabled={pwaCurrentPath === customUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  title="PWA 경로를 페이지 URL에 적용"
                >
                  적용하기
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                미리보기에서 실제로 보이는 페이지 경로
              </p>
            </div>

            {/* 컨트롤 버튼들 */}
            <div className="space-y-2">
              <button
                onClick={handleRefreshPreview}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                미리보기 새로고침
              </button>

              <button
                onClick={handleRotate}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                화면 회전
              </button>
            </div>
          </div>
          
          {/* 디바이스 선택 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">디바이스 프레임</h3>
            <div className="space-y-2">
              {Object.keys(DEVICE_FRAMES).map((device) => (
                <button
                  key={device}
                  onClick={() => setSelectedDevice(device as keyof typeof DEVICE_FRAMES)}
                  className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedDevice === device
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {device}
                </button>
              ))}
            </div>
            
            {/* 디바이스 정보 */}
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">현재 디바이스</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>해상도: {currentDevice.screenWidth} × {currentDevice.screenHeight}</div>
                <div>프레임: {currentDevice.frame}</div>
                <div>노치: {currentDevice.notch ? '있음' : '없음'}</div>
                <div>홈 인디케이터: {currentDevice.homeIndicator ? '있음' : '없음'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 실시간 미리보기 */}
        <div className="xl:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">PWA 실시간 미리보기</h2>
              <div className="flex items-center space-x-2">
                {isLoading && (
                  <div className="flex items-center text-blue-600">
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm">로딩 중...</span>
                  </div>
                )}
              </div>
            </div>

            {/* 디바이스 프레임 */}
            <div className="flex justify-center">
              <DeviceFrame
                device={currentDevice}
                orientation={orientation}
                isTablet={isTablet}
              >
                {/* iframe */}
                <iframe
                  ref={iframeRef}
                  key={refreshKey}
                  src={customUrl}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  title="PWA 미리보기"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-modals"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </DeviceFrame>
            </div>

            {/* 디바이스 정보 */}
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>{selectedDevice} - {orientation === 'portrait' ? '세로' : '가로'} 모드</p>
              <p>해상도: {orientation === 'portrait' ? `${currentDevice.screenWidth} × ${currentDevice.screenHeight}` : `${currentDevice.screenHeight} × ${currentDevice.screenWidth}`}</p>
              <p>PWA 상태: {pwaStatus === 'installed' ? '설치됨' : pwaStatus === 'available' ? '설치 가능' : '지원 안됨'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 에러 모달 */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
};
