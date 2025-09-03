'use client';

import React, { useState } from 'react';
import MobilePreviewFrame from '@/components/MobilePreviewFrame';

export default function MemberAppPage() {
  const [appSettings, setAppSettings] = useState({
    theme: 'light',
    primaryColor: '#3B82F6',
    layout: 'default'
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">📱 회원페이지 앱 설정</h1>
            <p className="text-gray-600 mt-2">회원페이지 모바일 앱 인터페이스 설정</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 모바일 미리보기 */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">📱</div>
                  <h2 className="text-xl font-semibold text-blue-900">모바일 미리보기</h2>
                </div>
                
                <MobilePreviewFrame>
                  <div className="bg-white min-h-screen">
                    {/* 앱 바 */}
                    <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-white rounded-full mr-3"></div>
                        <div>
                          <div className="font-semibold">파트너 앱</div>
                          <div className="text-xs opacity-90">환영합니다!</div>
                        </div>
                      </div>
                      <div className="text-2xl">🔔</div>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="p-4 space-y-4">
                      {/* 요약 카드 */}
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm opacity-90">총 포인트</div>
                          <div className="text-2xl font-bold">12,450</div>
                        </div>
                        <div className="text-xs opacity-90">이번 달 +2,340 포인트</div>
                      </div>

                      {/* 빠른 액션 */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl mb-1">📊</div>
                          <div className="text-sm font-medium">통계</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl mb-1">🎁</div>
                          <div className="text-sm font-medium">리워드</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl mb-1">👥</div>
                          <div className="text-sm font-medium">팀</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl mb-1">⚙️</div>
                          <div className="text-sm font-medium">설정</div>
                        </div>
                      </div>

                      {/* 최근 활동 */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="font-semibold mb-3">최근 활동</div>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span>새로운 추천인 등록</span>
                            <span className="ml-auto text-gray-500">2시간 전</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span>포인트 적립 완료</span>
                            <span className="ml-auto text-gray-500">1일 전</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </MobilePreviewFrame>
              </div>

              {/* 앱 설정 */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚙️</div>
                  <h2 className="text-xl font-semibold text-green-900">앱 설정</h2>
                </div>
                
                <div className="space-y-4">
                  {/* 테마 설정 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      테마 설정
                    </label>
                    <select 
                      value={appSettings.theme}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, theme: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="앱 테마를 선택하세요"
                      aria-label="앱 테마 선택"
                    >
                      <option value="light">라이트 모드</option>
                      <option value="dark">다크 모드</option>
                      <option value="auto">자동</option>
                    </select>
                  </div>

                  {/* 주요 색상 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      주요 색상
                    </label>
                    <input 
                      type="color"
                      value={appSettings.primaryColor}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-full h-10 border border-gray-300 rounded-md"
                      title="주요 색상을 선택하세요"
                      aria-label="주요 색상 선택"
                    />
                  </div>

                  {/* 레이아웃 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      레이아웃 스타일
                    </label>
                    <select 
                      value={appSettings.layout}
                      onChange={(e) => setAppSettings(prev => ({ ...prev, layout: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      title="레이아웃 스타일을 선택하세요"
                      aria-label="레이아웃 스타일 선택"
                    >
                      <option value="default">기본</option>
                      <option value="compact">컴팩트</option>
                      <option value="spacious">여유로운</option>
                    </select>
                  </div>

                  {/* 저장 버튼 */}
                  <button 
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    title="앱 설정을 저장합니다"
                    aria-label="앱 설정 저장"
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
