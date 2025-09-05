'use client';

import React from 'react';
import { RefreshCw, RotateCcw, Wifi, WifiOff, Settings, Code, Eye } from 'lucide-react';

interface DevelopmentControlsProps {
  isLoading: boolean;
  isOnline: boolean;
  orientation: 'portrait' | 'landscape';
  onRefresh: () => void;
  onRotate: () => void;
  onUrlChange: (url: string) => void;
  currentUrl: string;
}

export const DevelopmentControls: React.FC<DevelopmentControlsProps> = ({
  isLoading,
  isOnline,
  orientation,
  onRefresh,
  onRotate,
  onUrlChange,
  currentUrl,
}) => {
  const quickActions = [
    { name: '홈페이지', url: '/member', icon: Eye },
    { name: '로그인', url: '/login', icon: Settings },
    { name: '회원가입', url: '/signup', icon: Code },
    { name: '프로필', url: '/profile', icon: Settings },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">개발 도구</h2>
      
      {/* URL 설정 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          페이지 URL
        </label>
        <input
          type="text"
          value={currentUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="/member"
        />
      </div>

      {/* 빠른 액션 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          빠른 액션
        </label>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={() => onUrlChange(action.url)}
                className="flex items-center justify-center px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Icon className="w-4 h-4 mr-1" />
                {action.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="space-y-3">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </button>

        <button
          onClick={onRotate}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          회전 ({orientation === 'portrait' ? '세로' : '가로'})
        </button>

        {/* 연결 상태 */}
        <div className="flex items-center justify-center px-4 py-2 bg-gray-50 rounded-md">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 mr-2 text-green-600" />
              <span className="text-sm text-green-600">온라인</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 mr-2 text-red-600" />
              <span className="text-sm text-red-600">오프라인</span>
            </>
          )}
        </div>
      </div>

      {/* 개발 정보 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-medium text-gray-700 mb-2">개발 정보</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>상태: {isLoading ? '로딩 중' : '준비됨'}</div>
          <div>방향: {orientation === 'portrait' ? '세로' : '가로'}</div>
          <div>연결: {isOnline ? '온라인' : '오프라인'}</div>
        </div>
      </div>
    </div>
  );
};
