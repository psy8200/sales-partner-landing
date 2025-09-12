'use client';

import React from 'react';
import Link from 'next/link';


export default function DevGuidePage() {

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900">🔧 개발 가이드</h1>
            <p className="text-gray-600 mt-2">현재까지 개발된 시스템의 전체적인 개요 및 기술 문서</p>

          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* 시스템 개요 */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">📋</div>
                  <h2 className="text-xl font-semibold text-blue-900">시스템 개요</h2>
                </div>
                <div className="space-y-3 text-sm text-blue-800">
                  <div>• <strong>기술 스택:</strong> Next.js 15.4.3 + React + TypeScript</div>
                  <div>• <strong>데이터베이스:</strong> SQLite + Prisma ORM</div>
                  <div>• <strong>스타일링:</strong> Tailwind CSS</div>
                  <div>• <strong>인증:</strong> Custom Session Management</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>

              {/* 주요 기능 */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚙️</div>
                  <h2 className="text-xl font-semibold text-green-900">주요 기능</h2>
                </div>
                <div className="space-y-3 text-sm text-green-800">
                  <div>• <strong>회원 관리:</strong> 일반/파트너/관리자 분리</div>
                  <div>• <strong>파트너 신청:</strong> 상담신청 및 승인 시스템</div>
                  <div>• <strong>정산관리 시스템:</strong> 계약/추천/승급/지급 관리</div>
                  <div>• <strong>포인트 시스템:</strong> 적립 및 사용 관리</div>
                  <div>• <strong>관리자 대시보드:</strong> 통계 및 관리 기능</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>

              {/* 데이터베이스 */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🗄️</div>
                  <h2 className="text-xl font-semibold text-purple-900">데이터베이스</h2>
                </div>
                <div className="space-y-3 text-sm text-purple-800">
                  <div>• <strong>User:</strong> 회원 정보 및 권한 관리</div>
                  <div>• <strong>Contract:</strong> 계약 정보 및 정산 데이터</div>
                  <div>• <strong>PaymentHistory:</strong> 승급 지급완료 내역</div>
                  <div>• <strong>PartnerApplication:</strong> 파트너 신청 관리</div>
                  <div>• <strong>CompanyInfo:</strong> 회사 정보 관리</div>
                  <div>• <strong>ActivityLog:</strong> 활동 로그 관리</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                  >
                    스키마 보기 →
                  </Link>
                </div>
              </div>

              {/* API 엔드포인트 */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🔌</div>
                  <h2 className="text-xl font-semibold text-orange-900">API 엔드포인트</h2>
                </div>
                <div className="space-y-3 text-sm text-orange-800">
                  <div>• <strong>인증:</strong> 로그인/로그아웃/세션 관리</div>
                  <div>• <strong>정산관리:</strong> 데이터 조회/엑셀 다운로드</div>
                  <div>• <strong>승급관리:</strong> 승급 처리/지급 완료</div>
                  <div>• <strong>회원:</strong> CRUD 작업 및 권한 관리</div>
                  <div>• <strong>파트너:</strong> 신청 및 승인 처리</div>
                  <div>• <strong>관리자:</strong> 대시보드 및 통계</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                  >
                    API 문서 →
                  </Link>
                </div>
              </div>

              {/* 최근 업데이트 */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🆕</div>
                  <h2 className="text-xl font-semibold text-red-900">최근 업데이트</h2>
                </div>
                <div className="space-y-3 text-sm text-red-800">
                  <div>• <strong>정산관리 시스템:</strong> 4개 페이지 완성</div>
                  <div>• <strong>승급시스템:</strong> 자동 등급 계산 및 지급 관리</div>
                  <div>• <strong>엑셀 다운로드:</strong> xlsx 패키지 통합</div>
                  <div>• <strong>PaymentHistory:</strong> 지급완료 내역 관리</div>
                  <div>• <strong>파트너 승인:</strong> 시스템 완성</div>
                  <div>• <strong>인증 개선:</strong> adminSession 통일</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    변경사항 →
                  </Link>
                </div>
              </div>

              {/* 개발 환경 */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">⚙️</div>
                  <h2 className="text-xl font-semibold text-gray-900">개발 환경</h2>
                </div>
                <div className="space-y-3 text-sm text-gray-800">
                  <div>• <strong>설치:</strong> npm install</div>
                  <div>• <strong>데이터베이스:</strong> npx prisma db push</div>
                  <div>• <strong>실행:</strong> npm run dev</div>
                  <div>• <strong>문제해결:</strong> taskkill /f /im node.exe</div>
                </div>
                <div className="mt-4">
                  <Link 
                    href="/admin/dev-guide/details" 
                    className="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                  >
                    설정 가이드 →
                  </Link>
                </div>
              </div>
            </div>

            {/* 정산관리 시스템 섹션 */}
            <div className="mt-8">
              <div className="flex items-center mb-6">
                <div className="text-2xl mr-3">💰</div>
                <h2 className="text-2xl font-semibold text-gray-900">정산관리 시스템</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 정산리스트 */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">📊</div>
                    <h3 className="text-lg font-semibold text-blue-900">정산리스트</h3>
                  </div>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>• <strong>검색 기능:</strong> 이름+연락처+내코드+추천인코드</div>
                    <div>• <strong>내코드 필드:</strong> 연락처 뒤 8자리 자동 생성</div>
                    <div>• <strong>엑셀 다운로드:</strong> 선택된 데이터 내보내기</div>
                    <div>• <strong>반응형 레이아웃:</strong> 50% 검색바 + 50% 버튼 영역</div>
                    <div>• <strong>실시간 데이터:</strong> 계약 데이터 기반 정산 정보</div>
                  </div>
                </div>

                {/* 파트너추천리스트 */}
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">👥</div>
                    <h3 className="text-lg font-semibold text-green-900">파트너추천리스트</h3>
                  </div>
                  <div className="space-y-2 text-sm text-green-800">
                    <div>• <strong>사용자 검색:</strong> 전화번호로 파트너 조회</div>
                    <div>• <strong>추천 체계:</strong> 직접/간접 추천인원 계산</div>
                    <div>• <strong>매칭 시스템:</strong> 추천인코드 기반 매칭</div>
                    <div>• <strong>등급 표시:</strong> 아이콘 + 추천인원 수</div>
                    <div>• <strong>2560px 최적화:</strong> 대형 모니터 지원</div>
                  </div>
                </div>

                {/* 승급회원관리 */}
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">🏆</div>
                    <h3 className="text-lg font-semibold text-purple-900">승급회원관리</h3>
                  </div>
                  <div className="space-y-2 text-sm text-purple-800">
                    <div>• <strong>자동 등급 계산:</strong> 직접+간접 추천인원 기반</div>
                    <div>• <strong>승급 조건:</strong> 0→1(1명), 1→2(4명), 2→3(10명)...</div>
                    <div>• <strong>지급 상태:</strong> 대기중/지급요청/지급완료/취소</div>
                    <div>• <strong>선물 관리:</strong> 등급별 선물 내용 자동 설정</div>
                    <div>• <strong>실시간 업데이트:</strong> PaymentHistory 연동</div>
                  </div>
                </div>

                {/* 승급회원지급완료리스트 */}
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center mb-4">
                    <div className="text-lg mr-2">📋</div>
                    <h3 className="text-lg font-semibold text-orange-900">승급회원지급완료리스트</h3>
                  </div>
                  <div className="space-y-2 text-sm text-orange-800">
                    <div>• <strong>지급 내역 관리:</strong> 완료된 승급 지급 기록</div>
                    <div>• <strong>선택 및 삭제:</strong> 체크박스로 다중 선택</div>
                    <div>• <strong>엑셀 다운로드:</strong> 선택된 데이터 내보내기</div>
                    <div>• <strong>메모 관리:</strong> 개별 메모 입력 및 저장</div>
                    <div>• <strong>필터링:</strong> 등급별/선물타입별 조회</div>
                  </div>
                </div>
              </div>

              {/* 기술적 특징 */}
              <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 기술적 특징</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">데이터베이스 설계</h4>
                    <ul className="space-y-1">
                      <li>• PaymentHistory 모델 추가</li>
                      <li>• Prisma 마이그레이션 완료</li>
                      <li>• 인덱스 최적화</li>
                      <li>• ENUM 타입 활용 (GiftType, PaymentStatus)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">API 개발</h4>
                    <ul className="space-y-1">
                      <li>• RESTful API 설계</li>
                      <li>• 에러 처리 및 로깅</li>
                      <li>• 엑셀 다운로드 (xlsx 패키지)</li>
                      <li>• 실시간 데이터 동기화</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">UI/UX 개선</h4>
                    <ul className="space-y-1">
                      <li>• 일관된 디자인 시스템</li>
                      <li>• 반응형 레이아웃</li>
                      <li>• 직관적인 사용자 인터페이스</li>
                      <li>• 로딩 상태 및 에러 처리</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">핵심 기능</h4>
                    <ul className="space-y-1">
                      <li>• 실시간 데이터 동기화</li>
                      <li>• 추천 체계 관리</li>
                      <li>• 승급 시스템</li>
                      <li>• 데이터 내보내기</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
