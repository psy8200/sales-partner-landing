'use client';

import React, { useState, useEffect } from 'react';
import { sessionManager } from '@/lib/sessionManager';

interface SessionStatusIndicatorProps {
  className?: string;
}

const SessionStatusIndicator: React.FC<SessionStatusIndicatorProps> = ({ className = '' }) => {
  const [sessionStatus, setSessionStatus] = useState<{
    isValid: boolean;
    lastChecked: Date | null;
    isRefreshing: boolean;
  }>({
    isValid: true,
    lastChecked: null,
    isRefreshing: false,
  });

  const [showDetails, setShowDetails] = useState(false);

  // 세션 상태 주기적 확인
  useEffect(() => {
    const checkSession = async () => {
      const status = await sessionManager.checkSessionStatus();
      setSessionStatus(prev => ({
        ...prev,
        isValid: status.isValid,
        lastChecked: new Date(),
      }));
    };

    // 초기 확인
    checkSession();

    // 5분마다 상태 확인
    const interval = setInterval(checkSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // 수동 세션 갱신
  const handleManualRefresh = async () => {
    setSessionStatus(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      await sessionManager.manualRefresh();
      setSessionStatus(prev => ({
        ...prev,
        isValid: true,
        lastChecked: new Date(),
        isRefreshing: false,
      }));
    } catch {
      setSessionStatus(prev => ({ ...prev, isRefreshing: false }));
    }
  };

  // 상태에 따른 아이콘과 색상
  const getStatusIcon = () => {
    if (sessionStatus.isRefreshing) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
      );
    }
    
    if (sessionStatus.isValid) {
      return (
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      );
    }
    
    return (
      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
    );
  };

  const getStatusColor = () => {
    if (sessionStatus.isRefreshing) return 'text-blue-600';
    if (sessionStatus.isValid) return 'text-green-600';
    return 'text-red-600';
  };

  const getStatusText = () => {
    if (sessionStatus.isRefreshing) return '갱신 중...';
    if (sessionStatus.isValid) return '연결됨';
    return '연결 끊김';
  };

  return (
    <div className={`relative ${className}`}>
      {/* 세션 상태 표시 */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border
          ${sessionStatus.isValid 
            ? 'border-green-200 bg-green-50 hover:bg-green-100' 
            : 'border-red-200 bg-red-50 hover:bg-red-100'
          }
          transition-colors duration-200
        `}
        title="세션 상태 클릭하여 상세 정보 확인"
      >
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${getStatusColor()} ${
            showDetails ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 상세 정보 드롭다운 */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">세션 상태</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="닫기"
                aria-label="세션 상태 상세 정보 닫기"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 상태 정보 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">연결 상태:</span>
                <span className={`text-sm font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">마지막 확인:</span>
                <span className="text-sm text-gray-900">
                  {sessionStatus.lastChecked 
                    ? sessionStatus.lastChecked.toLocaleTimeString('ko-KR')
                    : '확인 중...'
                  }
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">자동 갱신:</span>
                <span className="text-sm text-green-600 font-medium">활성화</span>
              </div>
            </div>

            {/* 수동 갱신 버튼 */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={handleManualRefresh}
                disabled={sessionStatus.isRefreshing}
                className={`
                  w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${sessionStatus.isRefreshing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                  }
                `}
              >
                {sessionStatus.isRefreshing ? '갱신 중...' : '세션 수동 갱신'}
              </button>
            </div>

            {/* 정보 안내 */}
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                💡 세션은 사용자 활동 시 자동으로 갱신되며, 30분마다 주기적으로 확인됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 외부 클릭 시 드롭다운 닫기 */}
      {showDetails && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

export default SessionStatusIndicator;
