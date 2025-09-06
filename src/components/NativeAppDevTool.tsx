'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Wifi, 
  WifiOff,
  Smartphone,
  Monitor,
  Activity,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';

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

interface ExpoStatus {
  status: 'running' | 'stopped' | 'error';
  metro: {
    port: number;
    status: string;
    data?: any;
    error?: string;
  };
  expo: {
    port: number;
    status: string;
    data?: any;
    error?: string;
  };
  timestamp: string;
}

interface BuildLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

interface DeviceInfo {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'web';
  status: 'connected' | 'disconnected';
  lastSeen: string;
}

interface PerformanceMetrics {
  bundleSize: number;
  buildTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export const NativeAppDevTool: React.FC = () => {
  const [expoStatus, setExpoStatus] = useState<ExpoStatus | null>(null);
  const [buildLogs, setBuildLogs] = useState<BuildLog[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'status' | 'logs' | 'devices' | 'performance' | 'editor'>('status');
  const [codeEditor, setCodeEditor] = useState('');
  const [selectedFile, setSelectedFile] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<keyof typeof DEVICE_FRAMES>('iPhone 15 Pro');
  const [isControlling, setIsControlling] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket 연결 (현재 비활성화 - HTTP API 사용)
  useEffect(() => {
    // WebSocket 연결은 현재 비활성화
    // 대신 HTTP API를 통한 폴링 방식 사용
    console.log('WebSocket 연결 비활성화됨 - HTTP API 사용');
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // 자동 새로고침
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchExpoStatus();
        fetchBuildLogs();
        fetchConnectedDevices();
        fetchPerformanceMetrics();
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh]);

  // 파일 목록 초기 로드
  useEffect(() => {
    if (selectedTab === 'editor') {
      loadFileList();
    }
  }, [selectedTab]);

  // WebSocket 메시지 처리 (현재 비활성화)
  const handleWebSocketMessage = (data: any) => {
    // WebSocket 메시지 처리는 현재 비활성화
    // 대신 HTTP API를 통한 폴링으로 데이터 업데이트
    console.log('WebSocket 메시지 처리 비활성화됨:', data);
  };

  // Expo 상태 확인
  const fetchExpoStatus = async () => {
    try {
      const response = await fetch('/api/expo/status?action=status');
      const data = await response.json();
      setExpoStatus(data);
    } catch (error) {
      console.error('Expo 상태 확인 실패:', error);
    }
  };

  // 빌드 로그 가져오기
  const fetchBuildLogs = async () => {
    try {
      const response = await fetch('/api/expo/status?action=logs');
      const data = await response.json();
      if (data.success) {
        setBuildLogs(data.logs);
      }
    } catch (error) {
      console.error('빌드 로그 가져오기 실패:', error);
    }
  };

  // 연결된 디바이스 정보
  const fetchConnectedDevices = async () => {
    try {
      const response = await fetch('/api/expo/status?action=devices');
      const data = await response.json();
      if (data.success) {
        setConnectedDevices(data.devices);
      }
    } catch (error) {
      console.error('디바이스 정보 가져오기 실패:', error);
    }
  };

  // 성능 메트릭
  const fetchPerformanceMetrics = async () => {
    try {
      const response = await fetch('/api/expo/status?action=performance');
      const data = await response.json();
      if (data.success) {
        setPerformanceMetrics(data.metrics);
      }
    } catch (error) {
      console.error('성능 메트릭 가져오기 실패:', error);
    }
  };

  // Hot Reload 트리거
  const triggerHotReload = async () => {
    setIsLoading(true);
    try {
      // WebSocket 대신 HTTP API를 통한 Hot Reload 트리거
      const response = await fetch('/api/expo/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hot-reload' })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('Hot Reload 트리거됨');
        // 상태 새로고침
        setTimeout(() => {
          fetchExpoStatus();
        }, 1000);
      }
    } catch (error) {
      console.error('Hot Reload 트리거 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 파일 목록 가져오기
  const loadFileList = async () => {
    try {
      const response = await fetch('/api/expo/files?action=list');
      const data = await response.json();
      if (data.success) {
        setFileList(data.files);
      }
    } catch (error) {
      console.error('파일 목록 가져오기 실패:', error);
    }
  };

  // 파일 내용 로드
  const loadFileContent = async (filePath: string) => {
    try {
      const response = await fetch(`/api/expo/files?action=read&path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      if (data.success) {
        setCodeEditor(data.content);
        setSelectedFile(filePath);
      }
    } catch (error) {
      console.error('파일 내용 로드 실패:', error);
    }
  };

  // 파일 저장
  const saveFile = async () => {
    if (!selectedFile) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/expo/files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'write',
          path: selectedFile,
          content: codeEditor
        })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('파일 저장 완료');
        // Hot Reload 트리거
        await triggerHotReload();
      }
    } catch (error) {
      console.error('파일 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Expo 서버 제어
  const controlExpoServer = async (action: string) => {
    setIsControlling(true);
    try {
      const response = await fetch('/api/expo/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      
      const data = await response.json();
      if (data.success) {
        console.log(`${action} 완료:`, data.message);
        
        // 새 창에서 열기 액션의 경우 추가 처리
        if (action === 'open-browser' && data.url) {
          window.open(data.url, '_blank');
        }
        
        // 상태 업데이트가 필요한 액션들
        if (['start', 'stop', 'restart'].includes(action)) {
          setTimeout(() => {
            fetchExpoStatus();
          }, 1000);
        }
      } else {
        console.error(`${action} 실패:`, data.message);
      }
    } catch (error) {
      console.error(`${action} 실패:`, error);
    } finally {
      setIsControlling(false);
    }
  };

  // 수동 새로고침
  const handleRefresh = () => {
    fetchExpoStatus();
    fetchBuildLogs();
    fetchConnectedDevices();
    fetchPerformanceMetrics();
  };

  // 상태 아이콘 반환
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'stopped':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    fetchExpoStatus();
    fetchBuildLogs();
    fetchConnectedDevices();
    fetchPerformanceMetrics();
  }, []);


  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'warn':
        return 'text-yellow-600 bg-yellow-50';
      case 'info':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">🚀 네이티브 앱 개발 도구</h2>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'status', label: '상태', icon: Monitor },
          { id: 'logs', label: '로그', icon: FileText },
          { id: 'devices', label: '디바이스', icon: Smartphone },
          { id: 'performance', label: '성능', icon: BarChart3 },
          { id: 'editor', label: '코드 편집', icon: FileText }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedTab(id as any)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              selectedTab === id
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* 상태 탭 */}
      {selectedTab === 'status' && (
        <div className="space-y-6">
          {/* 상태 정보 섹션 */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* 왼쪽 컨트롤 패널 */}
            <div className="xl:col-span-1">
              {/* Expo 서버 상태 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Expo 서버 상태</h3>
                  <button
                    onClick={handleRefresh}
                    className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="새로고침"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                {expoStatus ? (
                  <div className="space-y-4">
                    {/* Metro Bundler 상태 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Metro Bundler</h4>
                        {getStatusIcon(expoStatus.metro.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>포트:</span>
                          <span className="font-mono">{expoStatus.metro.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>상태:</span>
                          <span className={`font-medium ${
                            expoStatus.metro.status === 'running' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {expoStatus.metro.status}
                          </span>
                        </div>
                        {expoStatus.metro.error && (
                          <div className="text-red-600 mt-2 p-2 bg-red-50 rounded text-xs">
                            {expoStatus.metro.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expo 서버 상태 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Expo 서버</h4>
                        {getStatusIcon(expoStatus.expo.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>포트:</span>
                          <span className="font-mono">{expoStatus.expo.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>상태:</span>
                          <span className={`font-medium ${
                            expoStatus.expo.status === 'running' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {expoStatus.expo.status}
                          </span>
                        </div>
                        {expoStatus.expo.error && (
                          <div className="text-red-600 mt-2 p-2 bg-red-50 rounded text-xs">
                            {expoStatus.expo.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 전체 상태 요약 */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900">전체 상태</span>
                        <div className="flex items-center space-x-2">
                          {expoStatus.metro.status === 'running' && expoStatus.expo.status === 'running' ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">정상</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span className="text-sm text-red-600 font-medium">오류</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
                    <p>Expo 상태를 확인하는 중...</p>
                  </div>
                )}
              </div>

              {/* 개발 컨트롤 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">개발 컨트롤</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => controlExpoServer('start')}
                    disabled={isControlling}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isControlling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Expo 시작
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => controlExpoServer('restart')}
                    disabled={isControlling}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isControlling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        서버 재시작
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => controlExpoServer('stop')}
                    disabled={isControlling}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isControlling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Square className="w-4 h-4 mr-2" />
                        서버 중지
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => controlExpoServer('open-browser')}
                    disabled={isControlling}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isControlling ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Monitor className="w-4 h-4 mr-2" />
                        새 창에서 열기
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 연결 정보 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">연결 정보</h3>
                <div className="text-sm text-gray-600 space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Metro Bundler:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">localhost:8081</span>
                      <button
                        onClick={() => window.open('http://localhost:8081', '_blank')}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Metro Bundler 열기"
                      >
                        <Monitor className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Expo 서버:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono">localhost:8081</span>
                      <button
                        onClick={() => window.open('http://localhost:8081', '_blank')}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Metro Bundler 열기"
                      >
                        <Monitor className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>QR 코드:</span>
                    <span className="font-mono text-blue-600">Expo Go</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>📱 모바일: Expo Go 앱 사용</div>
                      <div>🌐 웹: 브라우저에서 직접 접속</div>
                      <div>🔧 개발: Metro Bundler 모니터링</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 미리보기 영역 */}
            <div className="xl:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">네이티브 앱 실시간 미리보기</h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setIsPreviewLoading(true);
                        setPreviewError(null);
                        // 미리보기 새로고침
                        setTimeout(() => {
                          setIsPreviewLoading(false);
                        }, 1000);
                      }}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      [새로고침]
                    </button>
                    {isLoading && (
                      <div className="flex items-center text-blue-600">
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        <span className="text-sm">로딩 중...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 미리보기 영역 - 가로 레이아웃 */}
                <div className="flex gap-6">
                  {/* 미리보기 프레임 */}
                  <div className="flex-1 flex justify-center">
                    <div className="relative">
                      {/* 모바일 프레임 시뮬레이션 */}
                      <div className="bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
                        <div 
                          className="bg-white rounded-[2rem] overflow-hidden relative device-frame" 
                          data-device-width={DEVICE_FRAMES[selectedDevice].screenWidth * 0.8}
                          data-device-height={DEVICE_FRAMES[selectedDevice].screenHeight * 0.8}
                        >
                          {/* 상태 표시 오버레이 */}
                          <div className="absolute top-2 left-2 z-10">
                            {expoStatus?.expo.status === 'running' ? (
                              <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span>실행 중</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                <span>중지됨</span>
                              </div>
                            )}
                          </div>
                          
                          {isPreviewLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                              <div className="text-center">
                                <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
                                <p className="text-sm text-gray-600">네이티브 앱 로딩 중...</p>
                              </div>
                            </div>
                          )}
                          
                          {previewError && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                              <div className="text-center p-4">
                                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                                <p className="text-sm text-red-600 mb-2">미리보기 로드 실패</p>
                                <p className="text-xs text-gray-600">{previewError}</p>
                                <button
                                  onClick={() => {
                                    setPreviewError(null);
                                    setIsPreviewLoading(true);
                                  }}
                                  className="mt-2 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  다시 시도
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <iframe
                            src="http://localhost:8081"
                            className="w-full h-full border-0"
                            title="네이티브 앱 미리보기"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                            onLoad={() => {
                              console.log('네이티브 앱 미리보기 로드됨 - 실제 앱 화면 표시 중');
                              setIsPreviewLoading(false);
                              setPreviewError(null);
                            }}
                            onError={() => {
                              console.log('앱 번들 로드 실패');
                              setIsPreviewLoading(false);
                              setPreviewError('앱 번들을 로드할 수 없습니다. Metro Bundler가 실행 중인지 확인해주세요.');
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* 상태 표시 */}
                      <div className="absolute -top-2 -right-2">
                        {expoStatus?.expo.status === 'running' ? (
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                        ) : (
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 디바이스 프레임 선택기 */}
                  <div className="w-64">
                    <div className="bg-gray-50 rounded-lg p-4">
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
                      
                      {/* 현재 디바이스 정보 */}
                      <div className="mt-4 p-3 bg-white rounded-md border">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">현재 디바이스</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>해상도: {DEVICE_FRAMES[selectedDevice].screenWidth} × {DEVICE_FRAMES[selectedDevice].screenHeight}</div>
                          <div>프레임: {DEVICE_FRAMES[selectedDevice].frame}</div>
                          <div>노치: {DEVICE_FRAMES[selectedDevice].notch ? '있음' : '없음'}</div>
                          <div>홈 인디케이터: {DEVICE_FRAMES[selectedDevice].homeIndicator ? '있음' : '없음'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 미리보기 정보 */}
                <div className="mt-6 text-center text-sm text-gray-600">
                  <p>{selectedDevice} - 세로 모드</p>
                  <p>해상도: {DEVICE_FRAMES[selectedDevice].screenWidth} × {DEVICE_FRAMES[selectedDevice].screenHeight} (시뮬레이션)</p>
                  <p className="mt-2">
                    ✅ Metro Bundler가 실행 중입니다. 실제 네이티브 앱이 미리보기에 표시됩니다.
                  </p>
                  <p className="text-blue-600">
                    🚀 웹 번들에서 직접 앱을 실행합니다.
                  </p>
                  <p>📱 모바일에서 테스트하려면 Expo Go 앱을 사용하세요.</p>
                  <p className="mt-2 text-sm text-gray-500">
                    🔄 코드를 수정하면 실시간으로 미리보기가 업데이트됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로그 탭 */}
      {selectedTab === 'logs' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
            <div className="text-green-400 font-mono text-sm">
              {buildLogs.length > 0 ? (
                buildLogs.map((log, index) => (
                  <div key={index} className="mb-1">
                    <span className="text-gray-500">[{log.timestamp}]</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getLogLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="ml-2">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500">빌드 로그가 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 디바이스 탭 */}
      {selectedTab === 'devices' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedDevices.map((device) => (
              <div key={device.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{device.name}</h3>
                  <div className="flex items-center">
                    {device.status === 'connected' ? (
                      <Wifi className="w-4 h-4 text-green-500" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div>플랫폼: {device.platform}</div>
                  <div>상태: {device.status}</div>
                  <div>마지막 연결: {new Date(device.lastSeen).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
          {connectedDevices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="w-8 h-8 mx-auto mb-2" />
              <p>연결된 디바이스가 없습니다.</p>
            </div>
          )}
        </div>
      )}

      {/* 성능 탭 */}
      {selectedTab === 'performance' && (
        <div className="space-y-4">
          {performanceMetrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(performanceMetrics.bundleSize / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="text-sm text-blue-600">번들 크기</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {performanceMetrics.buildTime}ms
                </div>
                <div className="text-sm text-green-600">빌드 시간</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {(performanceMetrics.memoryUsage / 1024 / 1024).toFixed(1)}MB
                </div>
                <div className="text-sm text-yellow-600">메모리 사용량</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.cpuUsage}%
                </div>
                <div className="text-sm text-purple-600">CPU 사용률</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p>성능 메트릭을 로딩 중...</p>
            </div>
          )}
        </div>
      )}

      {/* 코드 편집기 탭 */}
      {selectedTab === 'editor' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 파일 탐색기 */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">파일 탐색기</h3>
                <div className="space-y-2">
                  {[
                    { name: 'App.tsx', path: 'App.tsx', type: 'file' },
                    { name: 'src/', path: 'src/', type: 'folder' },
                    { name: '  components/', path: 'src/components/', type: 'folder' },
                    { name: '    common/', path: 'src/components/common/', type: 'folder' },
                    { name: '      Button.tsx', path: 'src/components/common/Button.tsx', type: 'file' },
                    { name: '      Card.tsx', path: 'src/components/common/Card.tsx', type: 'file' },
                    { name: '    business/', path: 'src/components/business/', type: 'folder' },
                    { name: '      SummaryCard.tsx', path: 'src/components/business/SummaryCard.tsx', type: 'file' },
                    { name: '  screens/', path: 'src/screens/', type: 'folder' },
                    { name: '    auth/', path: 'src/screens/auth/', type: 'folder' },
                    { name: '      LoginScreen.tsx', path: 'src/screens/auth/LoginScreen.tsx', type: 'file' },
                    { name: '    main/', path: 'src/screens/main/', type: 'folder' },
                    { name: '      HomeScreen.tsx', path: 'src/screens/main/HomeScreen.tsx', type: 'file' },
                    { name: '  navigation/', path: 'src/navigation/', type: 'folder' },
                    { name: '    MainNavigator.tsx', path: 'src/navigation/MainNavigator.tsx', type: 'file' },
                  ].map((file, index) => (
                    <button
                      key={index}
                      onClick={() => file.type === 'file' ? loadFileContent(file.path) : setSelectedFile(file.path)}
                      className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                        selectedFile === file.path
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">
                        {file.type === 'folder' ? '📁' : '📄'}
                      </span>
                      {file.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 코드 편집기 */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-lg p-4 h-96">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">
                    {selectedFile || '파일을 선택하세요'}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={saveFile}
                      disabled={isSaving || !selectedFile}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {isSaving ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={() => controlExpoServer('restart')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      재시작
                    </button>
                    <button
                      onClick={() => controlExpoServer('start')}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      시작
                    </button>
                  </div>
                </div>
                <textarea
                  value={codeEditor}
                  onChange={(e) => setCodeEditor(e.target.value)}
                  className="w-full h-80 bg-gray-800 text-green-400 font-mono text-sm p-4 rounded border-0 resize-none focus:outline-none"
                  placeholder="코드를 입력하세요..."
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
