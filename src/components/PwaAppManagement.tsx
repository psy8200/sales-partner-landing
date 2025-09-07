'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [customUrl, setCustomUrl] = useState('/login');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [pwaStatus, setPwaStatus] = useState<'installed' | 'available' | 'not-supported'>('available');
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

  // 실시간 새로고침 (해당 화면만)
  const handleRefreshPreview = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
    
    // 로딩 애니메이션을 위한 딜레이
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // 디바이스 회전
  const handleRotate = () => {
    setOrientation(prev => prev === 'portrait' ? 'landscape' : 'portrait');
  };

  // iframe 로드 완료
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // PWA 설치
  const handleInstallPwa = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('PWA 설치 완료:', registration);
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
                  placeholder="/login"
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
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
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
    </div>
  );
};
