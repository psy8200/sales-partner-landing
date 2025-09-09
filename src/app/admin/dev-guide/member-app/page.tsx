'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DeviceFrame } from '@/components/DeviceFrame';
import { ResponsiveTestTool } from '@/components/ResponsiveTestTool';
import { DevelopmentControls } from '@/components/DevelopmentControls';
import { PwaAppManagement } from '@/components/PwaAppManagement';

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

export default function MemberAppPage() {
  const [selectedDevice, setSelectedDevice] = useState<keyof typeof DEVICE_FRAMES>('iPhone 15 Pro');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [customUrl, setCustomUrl] = useState('/login');
  const [isUrlChanging, setIsUrlChanging] = useState(false); // URL 변경 중 플래그
  const [pwaCurrentPath, setPwaCurrentPath] = useState('/login'); // PWA 현재 경로
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activeTab, setActiveTab] = useState<'preview' | 'pwa'>('preview');
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  // iframe으로부터 URL 변경 메시지 수신 (강화된 버전)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // 보안: origin 검증 (필요시)
      // if (event.origin !== window.location.origin) return;
      
      console.log('메시지 수신:', event.data); // 모든 메시지 로깅
      
      if (event.data && event.data.type === 'URL_CHANGE') {
        const newUrl = event.data.url;
        console.log('iframe에서 URL 변경 알림 받음:', newUrl, '현재 URL:', customUrl, 'isUrlChanging:', isUrlChanging);
        
        // URL 유효성 검증
        if (typeof newUrl === 'string' && newUrl.startsWith('/')) {
          // PWA 현재 경로 업데이트 (항상 업데이트)
          setPwaCurrentPath(newUrl);
          
          // URL 필드 업데이트 (중복 방지, isUrlChanging 체크)
          if (!isUrlChanging) {
            setCustomUrl(prevUrl => {
              if (prevUrl !== newUrl) {
                console.log('URL 필드 업데이트:', prevUrl, '->', newUrl);
                return newUrl;
              }
              return prevUrl;
            });
          }
          
          // iframe src도 동기화 (필요시)
          if (iframeRef.current && iframeRef.current.src !== newUrl) {
            // iframe src는 전체 URL이므로 현재 origin과 결합
            const fullUrl = window.location.origin + newUrl;
            if (iframeRef.current.src !== fullUrl) {
              console.log('iframe src 동기화:', iframeRef.current.src, '->', fullUrl);
              // iframe src는 자동으로 업데이트되므로 수동 변경 불필요
            }
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // 실시간 새로고침 (로그인 상태 유지)
  const handleRefresh = () => {
    setIsLoading(true);
    
    // iframe 내부에서 새로고침하도록 메시지 전송
    if (iframeRef.current?.contentWindow) {
      try {
        // iframe 내부에서 새로고침하도록 메시지 전송
        iframeRef.current.contentWindow.postMessage({ type: 'REFRESH' }, '*');
        
        // 메시지 전송 후 잠시 대기 후 로딩 완료
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.log('iframe 새로고침 메시지 전송 실패, 일반 새로고침으로 대체');
        // 메시지 전송 실패 시 일반 새로고침
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    } else {
      // iframe이 없는 경우 일반 새로고침
      setRefreshKey(prev => prev + 1);
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  };

  // 디바이스 회전
  const handleRotate = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  // URL 변경 핸들러 (양방향 동기화)
  const handleUrlChange = (newUrl: string) => {
    if (newUrl !== customUrl && !isUrlChanging) {
      console.log('수동 URL 변경:', customUrl, '->', newUrl);
      setIsUrlChanging(true);
      setCustomUrl(newUrl);
      
      // iframe에 URL 변경 알림 (필요시)
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage({ 
            type: 'URL_SYNC', 
            url: newUrl 
          }, '*');
        } catch (error) {
          console.log('iframe URL 동기화 메시지 전송 실패:', error);
        }
      }
      
      // 플래그 리셋
      setTimeout(() => setIsUrlChanging(false), 1000);
    }
  };

  // PWA 경로 적용 함수
  const handleApplyPwaPath = () => {
    if (pwaCurrentPath !== customUrl) {
      console.log('PWA 경로 적용:', pwaCurrentPath);
      setCustomUrl(pwaCurrentPath);
      setIsUrlChanging(true);
      
      // 플래그 리셋
      setTimeout(() => setIsUrlChanging(false), 1000);
    }
  };

  // iframe 로드 완료
  const handleIframeLoad = () => {
    setIsLoading(false);
    
    // iframe 내부에 새로고침 메시지 리스너 추가
    if (iframeRef.current?.contentWindow) {
      try {
        // iframe 내부에 스크립트 주입하여 새로고침 메시지 처리
        const script = `
          console.log('개발도구 스크립트 주입 시작');
          
          // 기존 스크립트 중복 실행 방지
          if (window.devToolsScriptLoaded) {
            console.log('개발도구 스크립트 이미 로드됨');
            return;
          }
          window.devToolsScriptLoaded = true;
          // URL 변경 알림 함수 (중복 방지)
          let lastNotifiedUrl = window.location.pathname;
          function notifyUrlChange() {
            const currentUrl = window.location.pathname;
            if (currentUrl !== lastNotifiedUrl) {
              lastNotifiedUrl = currentUrl;
              window.parent.postMessage({ 
                type: 'URL_CHANGE', 
                url: currentUrl 
              }, '*');
              console.log('URL 변경 알림:', currentUrl);
            }
          }
          
          // 새로고침 메시지 리스너 등록
          window.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'REFRESH') {
              console.log('개발도구에서 새로고침 요청 받음');
              // 현재 페이지를 새로고침 (로그인 상태 유지)
              window.location.reload();
            }
          });
          
          // History API 오버라이드 (기존 기능 유지)
          const originalPushState = history.pushState;
          const originalReplaceState = history.replaceState;
          
          history.pushState = function(...args) {
            originalPushState.apply(history, args);
            setTimeout(notifyUrlChange, 0); // 비동기로 알림
          };
          
          history.replaceState = function(...args) {
            originalReplaceState.apply(history, args);
            setTimeout(notifyUrlChange, 0); // 비동기로 알림
          };
          
          // popstate 이벤트 감지 (뒤로가기/앞으로가기)
          window.addEventListener('popstate', function(event) {
            setTimeout(notifyUrlChange, 0);
          });
          
          // window.location 변경 감지 (MutationObserver 사용)
          let currentLocation = window.location.href;
          const locationObserver = new MutationObserver(function(mutations) {
            if (window.location.href !== currentLocation) {
              currentLocation = window.location.href;
              setTimeout(notifyUrlChange, 0);
            }
          });
          
          // DOM 변경 감지 시작
          locationObserver.observe(document, { 
            subtree: true, 
            childList: true 
          });
          
          // Next.js Router 감지 (Next.js가 로드된 후)
          if (window.next && window.next.router) {
            const originalPush = window.next.router.push;
            const originalReplace = window.next.router.replace;
            
            window.next.router.push = function(...args) {
              const result = originalPush.apply(this, args);
              setTimeout(notifyUrlChange, 100); // Next.js 라우팅 완료 대기
              return result;
            };
            
            window.next.router.replace = function(...args) {
              const result = originalReplace.apply(this, args);
              setTimeout(notifyUrlChange, 100); // Next.js 라우팅 완료 대기
              return result;
            };
          }
          
          // 초기 URL 알림 (여러 번 시도)
          setTimeout(notifyUrlChange, 100);
          setTimeout(notifyUrlChange, 500);
          setTimeout(notifyUrlChange, 1000);
          
          // DOM 로드 완료 후에도 URL 알림
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
              setTimeout(notifyUrlChange, 100);
            });
          }
          
          // window 로드 완료 후에도 URL 알림
          window.addEventListener('load', function() {
            setTimeout(notifyUrlChange, 100);
          });
          
          console.log('개발도구 강화된 URL 동기화 스크립트 로드됨, 현재 URL:', window.location.pathname);
        `;
        
        // iframe 내부에 스크립트 실행
        iframeRef.current.contentWindow.eval(script);
        
        // 주기적으로 iframe URL 확인 (백업 방법)
        const urlCheckInterval = setInterval(() => {
          if (iframeRef.current?.contentWindow) {
            try {
              const iframeUrl = iframeRef.current.contentWindow.location.pathname;
              if (iframeUrl) {
                // PWA 현재 경로 업데이트 (항상 업데이트)
                setPwaCurrentPath(iframeUrl);
                
                // URL 필드 업데이트 (조건부)
                if (iframeUrl !== customUrl && !isUrlChanging) {
                  console.log('주기적 URL 확인으로 변경 감지:', customUrl, '->', iframeUrl);
                  setCustomUrl(iframeUrl);
                }
              }
            } catch (error) {
              // cross-origin 에러는 무시 (정상적인 동작)
            }
          }
        }, 2000); // 2초마다 확인
        
        // 30초 후 주기적 확인 중단
        setTimeout(() => {
          clearInterval(urlCheckInterval);
        }, 30000);
        
      } catch (error) {
        console.log('iframe 스크립트 주입 실패:', error);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">📱 회원페이지 앱 개발 도구</h1>
            <p className="text-gray-600 mt-2">웹 앱 개발을 위한 실시간 미리보기 및 테스트 도구</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'preview', label: '웹 미리보기', icon: '🖥️' },
              { id: 'pwa', label: 'PWA 앱 관리', icon: '⚡' }
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* 웹 미리보기 탭 */}
        {activeTab === 'preview' && (
          <>
            {/* 반응형 테스트 도구 */}
            <ResponsiveTestTool 
              onUrlChange={handleUrlChange}
              currentUrl={customUrl}
            />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 컨트롤 패널 */}
          <div className="xl:col-span-1">
            <DevelopmentControls
              isLoading={isLoading}
              isOnline={isOnline}
              orientation={orientation}
              onRefresh={handleRefresh}
              onRotate={handleRotate}
              onUrlChange={handleUrlChange}
              currentUrl={customUrl}
              pwaCurrentPath={pwaCurrentPath}
              onApplyPwaPath={handleApplyPwaPath}
            />
            
            {/* 디바이스 선택 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
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

          {/* 모바일 미리보기 */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">실시간 미리보기</h2>
                <div className="flex items-center space-x-4">
                  {/* 로그인 상태 유지 표시 */}
                  <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium">로그인 상태 유지</span>
                  </div>
                  
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
                    title="회원페이지 미리보기"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation allow-modals"
                  />
                </DeviceFrame>
              </div>

              {/* 디바이스 정보 */}
              <div className="mt-6 text-center text-sm text-gray-600">
                <p>{selectedDevice} - {orientation === 'portrait' ? '세로' : '가로'} 모드</p>
                <p>해상도: {orientation === 'portrait' ? `${currentDevice.screenWidth} × ${currentDevice.screenHeight}` : `${currentDevice.screenHeight} × ${currentDevice.screenWidth}`}</p>
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* PWA 앱 관리 탭 */}
        {activeTab === 'pwa' && (
          <PwaAppManagement />
        )}
      </div>
    </div>
  );
}
