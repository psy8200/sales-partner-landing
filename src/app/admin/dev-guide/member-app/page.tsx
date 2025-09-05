'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DeviceFrame } from '@/components/DeviceFrame';
import { ResponsiveTestTool } from '@/components/ResponsiveTestTool';
import { DevelopmentControls } from '@/components/DevelopmentControls';
import { NativeAppDevTool } from '@/components/NativeAppDevTool';
import { FileWatcher } from '@/components/FileWatcher';
import { ApiMonitor } from '@/components/ApiMonitor';

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
  const [customUrl, setCustomUrl] = useState('/member');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [activeTab, setActiveTab] = useState<'preview' | 'native' | 'files' | 'api'>('preview');
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

  // 실시간 새로고침
  const handleRefresh = () => {
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


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">📱 회원페이지 앱 개발 도구</h1>
            <p className="text-gray-600 mt-2">네이티브 앱 개발을 위한 실시간 미리보기 및 테스트 도구</p>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'preview', label: '웹 미리보기', icon: '🖥️' },
              { id: 'native', label: '네이티브 앱', icon: '📱' },
              { id: 'files', label: '파일 감지', icon: '📁' },
              { id: 'api', label: 'API 모니터링', icon: '🌐' }
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
              onUrlChange={setCustomUrl}
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
              onUrlChange={setCustomUrl}
              currentUrl={customUrl}
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
                    title="회원페이지 미리보기"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
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

        {/* 네이티브 앱 탭 */}
        {activeTab === 'native' && (
          <NativeAppDevTool />
        )}

        {/* 파일 감지 탭 */}
        {activeTab === 'files' && (
          <FileWatcher />
        )}

        {/* API 모니터링 탭 */}
        {activeTab === 'api' && (
          <ApiMonitor />
        )}
      </div>
    </div>
  );
}
