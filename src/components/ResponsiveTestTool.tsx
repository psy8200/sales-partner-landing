'use client';

import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface ResponsiveTestToolProps {
  onUrlChange: (url: string) => void;
  currentUrl: string;
}

export const ResponsiveTestTool: React.FC<ResponsiveTestToolProps> = ({
  onUrlChange,
  currentUrl,
}) => {
  const breakpoints = [
    { name: 'Small', size: '640px', icon: Smartphone, url: '/member?breakpoint=sm' },
    { name: 'Medium', size: '768px', icon: Tablet, url: '/member?breakpoint=md' },
    { name: 'Large', size: '1024px', icon: Monitor, url: '/member?breakpoint=lg' },
  ];

  const themes = [
    { name: '라이트 모드', url: '/member?theme=light', bgColor: 'bg-gray-50', textColor: 'text-gray-700' },
    { name: '다크 모드', url: '/member?theme=dark', bgColor: 'bg-gray-800', textColor: 'text-white' },
  ];

  const testScenarios = [
    { name: '로그인 상태', url: '/member?auth=true' },
    { name: '비로그인 상태', url: '/member?auth=false' },
    { name: '에러 상태', url: '/member?error=true' },
    { name: '로딩 상태', url: '/member?loading=true' },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">반응형 디자인 테스트 도구</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 브레이크포인트 테스트 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            브레이크포인트 테스트
          </label>
          <div className="space-y-2">
            {breakpoints.map((breakpoint) => {
              const Icon = breakpoint.icon;
              return (
                <button 
                  key={breakpoint.name}
                  className="w-full flex items-center px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors"
                  onClick={() => onUrlChange(breakpoint.url)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {breakpoint.name} ({breakpoint.size})
                </button>
              );
            })}
          </div>
        </div>

        {/* 테마 테스트 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            테마 테스트
          </label>
          <div className="space-y-2">
            {themes.map((theme) => (
              <button 
                key={theme.name}
                className={`w-full px-3 py-2 text-sm rounded-md hover:opacity-80 transition-colors ${theme.bgColor} ${theme.textColor}`}
                onClick={() => onUrlChange(theme.url)}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        {/* 테스트 시나리오 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            테스트 시나리오
          </label>
          <div className="space-y-2">
            {testScenarios.map((scenario) => (
              <button 
                key={scenario.name}
                className="w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors"
                onClick={() => onUrlChange(scenario.url)}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 현재 URL 표시 */}
      <div className="mt-6 p-3 bg-gray-50 rounded-md">
        <label className="block text-xs font-medium text-gray-500 mb-1">현재 URL</label>
        <code className="text-sm text-gray-700">{currentUrl}</code>
      </div>
    </div>
  );
};
