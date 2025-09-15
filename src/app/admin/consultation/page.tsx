'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, BarChart3, Users, Calendar, TrendingUp, Clock } from 'lucide-react';

export default function ConsultationMainPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">상담 관리</h1>
        <p className="text-gray-600">상담 신청, 이력 관리, 통계 분석을 통합 관리할 수 있습니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 상담 건수</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-500">이번 달</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">완료율</p>
              <p className="text-2xl font-bold text-gray-900">71.2%</p>
              <p className="text-sm text-gray-500">전월 대비 +5.3%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">진행중</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-sm text-gray-500">평균 2.3일</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 담당자</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
              <p className="text-sm text-gray-500">평균 19.5건/담당자</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 기능 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 상담신청관리 */}
        <Link href="/admin/consultation/requests" className="group">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">상담신청관리</h3>
                <p className="text-sm text-gray-500">새로운 상담 신청 처리</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              고객의 상담 신청을 접수하고 담당자를 배정하여 체계적으로 관리합니다.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <span>바로가기</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* 상담이력관리 */}
        <Link href="/admin/consultation/consultations" className="group">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-green-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">상담이력관리</h3>
                <p className="text-sm text-gray-500">상담 진행 상황 관리</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              진행중인 상담의 상태를 추적하고 완료된 상담의 이력을 관리합니다.
            </p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span>바로가기</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* 상담통계 */}
        <Link href="/admin/consultation/consultations/stats" className="group">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-purple-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">상담통계</h3>
                <p className="text-sm text-gray-500">담당자별 실적 분석</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              담당자별 상담 실적과 월별 통계를 분석하여 보너스 지급 기준을 제공합니다.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <span>바로가기</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* 최근 활동 */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">최근 상담 활동</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">김상담님의 보험 상담이 완료되었습니다</p>
                  <p className="text-xs text-gray-500">2시간 전</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">완료</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">이렌탈님의 렌탈 상담이 진행중입니다</p>
                  <p className="text-xs text-gray-500">4시간 전</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 font-medium">진행중</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">박통신님의 인터넷+TV 상담 신청이 접수되었습니다</p>
                  <p className="text-xs text-gray-500">6시간 전</p>
                </div>
              </div>
              <span className="text-sm text-yellow-600 font-medium">신청</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">최상조님의 상조 상담이 완료되었습니다</p>
                  <p className="text-xs text-gray-500">1일 전</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">완료</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
