'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Edit, CheckCircle, Clock, TrendingUp, Users } from 'lucide-react';

export default function ContractsMainPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">계약 관리</h1>
        <p className="text-gray-600">계약 입력, 수금 관리, 정산 처리를 통합 관리할 수 있습니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 계약 건수</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
              <p className="text-sm text-gray-500">이번 달</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">확정된 계약</p>
              <p className="text-2xl font-bold text-gray-900">67</p>
              <p className="text-sm text-gray-500">75.3%</p>
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
              <p className="text-2xl font-bold text-gray-900">22</p>
              <p className="text-sm text-gray-500">평균 3.2일</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 계약금액</p>
              <p className="text-2xl font-bold text-gray-900">2.4억원</p>
              <p className="text-sm text-gray-500">전월 대비 +12%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 기능 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 계약입력관리 */}
        <Link href="/admin/contracts/entries" className="group">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Edit className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">계약입력관리</h3>
                <p className="text-sm text-gray-500">새로운 계약 입력 및 관리</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              고객의 계약 정보를 입력하고 상품별 설정에 따라 자동으로 계산된 수수료와 포인트를 확인할 수 있습니다.
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <span>바로가기</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* 수금관리 */}
        <Link href="/admin/collections/all-contracts" className="group">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-green-300">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">수금관리</h3>
                <p className="text-sm text-gray-500">계약 수금 및 완료 관리</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              확정된 계약의 수금 상태를 관리하고, 수금 완료된 계약을 정산 시스템으로 이동시킵니다.
            </p>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span>바로가기</span>
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* 수금관리 하위 메뉴 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">수금관리 세부 메뉴</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/admin/collections/all-contracts" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-2">
                  <FileText className="w-5 h-5 text-blue-600 mr-2" />
                  <h4 className="font-medium text-gray-900">전체계약</h4>
                </div>
                <p className="text-sm text-gray-600">확정된 모든 계약 목록</p>
              </div>
            </Link>
            
            <Link href="/admin/collections/collection-contracts" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600 mr-2" />
                  <h4 className="font-medium text-gray-900">수금관리계약</h4>
                </div>
                <p className="text-sm text-gray-600">수금 진행중인 계약</p>
              </div>
            </Link>
            
            <Link href="/admin/collections/completed-contracts" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <h4 className="font-medium text-gray-900">수금완료된계약</h4>
                </div>
                <p className="text-sm text-gray-600">수금이 완료된 계약</p>
              </div>
            </Link>
            
            <Link href="/admin/collections/lump-sum-contracts" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-gray-900">일시납계약</h4>
                </div>
                <p className="text-sm text-gray-600">일시납으로 처리된 계약</p>
              </div>
            </Link>
            
            <Link href="/admin/collections/verification" className="group">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-red-600 mr-2" />
                  <h4 className="font-medium text-gray-900">수금검증하기</h4>
                </div>
                <p className="text-sm text-gray-600">수금 데이터 검증 및 업로드</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 최근 계약 활동 */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">최근 계약 활동</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">박수용님의 보험 계약이 수금완료되었습니다</p>
                  <p className="text-xs text-gray-500">1시간 전</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">수금완료</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">김렌탈님의 렌탈 계약이 확정되었습니다</p>
                  <p className="text-xs text-gray-500">3시간 전</p>
                </div>
              </div>
              <span className="text-sm text-blue-600 font-medium">확정</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">이통신님의 인터넷+TV 계약이 수금관리로 이동되었습니다</p>
                  <p className="text-xs text-gray-500">5시간 전</p>
                </div>
              </div>
              <span className="text-sm text-orange-600 font-medium">수금진행</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">최상조님의 상조 계약이 일시납으로 처리되었습니다</p>
                  <p className="text-xs text-gray-500">1일 전</p>
                </div>
              </div>
              <span className="text-sm text-green-600 font-medium">일시납</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}