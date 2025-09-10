'use client';

import React from 'react';

export default function DevelopmentDetailsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔧 개발 세부내용</h1>
        <p className="text-gray-600 mb-8">현재 시스템의 상세한 기술 스펙 및 구현 현황 (2025년 9월 10일 기준)</p>
        
        <div className="space-y-8">
          {/* 시스템 개요 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📋 시스템 개요</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">기술 스택</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Frontend:</strong> Next.js 15.4.3 + React + TypeScript</li>
                  <li>• <strong>Styling:</strong> Tailwind CSS</li>
                  <li>• <strong>Database:</strong> SQLite + Prisma ORM</li>
                  <li>• <strong>Authentication:</strong> Custom Session Management</li>
                  <li>• <strong>Mobile:</strong> React Native + Expo</li>
                  <li>• <strong>State Management:</strong> Zustand (Mobile)</li>
                  <li>• <strong>Deployment:</strong> Vercel (예정)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">주요 기능</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>회원 관리:</strong> 일반회원, 파트너회원, 관리자, 담당자</li>
                  <li>• <strong>계약 관리:</strong> 계약입력, 수정, 삭제, 검색</li>
                  <li>• <strong>아이템 관리:</strong> 동적 상품 생성, 제목 수정</li>
                  <li>• <strong>담당자 관리:</strong> 담당자 배정 및 관리</li>
                  <li>• <strong>PWA 지원:</strong> 웹과 모바일 통합</li>
                  <li>• <strong>백업 시스템:</strong> 3중 백업 체계</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 데이터베이스 스키마 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🗄️ 데이터베이스 스키마 (총 25개 모델)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">핵심 모델들</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <div className="font-semibold mb-2">User (회원)</div>
                    <div>• role: ADMIN, MANAGER, STAFF, MEMBER, GENERAL</div>
                    <div>• partnerStatus: NOT_APPLIED, PARTNER_APPLIED, APPROVED</div>
                    <div>• points, referralCode, bankInfo 포함</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <div className="font-semibold mb-2">Contract (계약)</div>
                    <div>• itemCategory: INSURANCE, RENTAL, INTERNET_TV, FUNERAL, RENTAL_MALL, SHOPPING_MALL, INSTANT_PARTNER</div>
                    <div>• dynamicFields: JSON 형태로 확장 가능</div>
                    <div>• 증권번호, 납입기간, 계약금액 등</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <div className="font-semibold mb-2">Admin (관리자)</div>
                    <div>• role: ADMIN, SUPER_ADMIN</div>
                    <div>• 세션 관리 및 로그인 추적</div>
                    <div>• 독립적인 관리자 테이블</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    <div className="font-semibold mb-2">Manager (담당자)</div>
                    <div>• department: 담당자소속</div>
                    <div>• name: 담당자이름</div>
                    <div>• joinDate: 가입일</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">관리 시스템 모델들</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div className="font-semibold">ItemSetting</div>
                    <div>상품 설정 관리</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div className="font-semibold">SidebarItem</div>
                    <div>동적 사이드바 관리</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div className="font-semibold">CompanyInfo</div>
                    <div>회사 정보 관리</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div className="font-semibold">PartnerApplication</div>
                    <div>파트너 신청 관리</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div className="font-semibold">ActivityLog</div>
                    <div>활동 로그 추적</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded text-sm">
                    <div className="font-semibold">SystemConfig</div>
                    <div>시스템 설정</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">수금 관리 시스템 모델들 (완전 개발 완료)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div className="font-semibold">Contract</div>
                    <div>계약 정보 관리 (25개 상태)</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div className="font-semibold">Payment</div>
                    <div>결제 정보 관리</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-sm">
                    <div className="font-semibold">Settlement</div>
                    <div>정산 정보 관리</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">확장 모델들 (향후 개발)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-green-50 p-2 rounded text-xs">Payment</div>
                  <div className="bg-green-50 p-2 rounded text-xs">Settlement</div>
                  <div className="bg-green-50 p-2 rounded text-xs">PointLedger</div>
                  <div className="bg-green-50 p-2 rounded text-xs">WithdrawalRequest</div>
                  <div className="bg-green-50 p-2 rounded text-xs">Notification</div>
                  <div className="bg-green-50 p-2 rounded text-xs">Question</div>
                  <div className="bg-green-50 p-2 rounded text-xs">Consultation</div>
                  <div className="bg-green-50 p-2 rounded text-xs">Application</div>
                </div>
              </div>
            </div>
          </section>

          {/* API 엔드포인트 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔌 API 엔드포인트 (총 50+ 개)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">인증 관련</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/signup</strong> - 회원가입
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/web-login</strong> - 웹 로그인
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/member-login</strong> - PWA 로그인
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/auth/app-login</strong> - 앱 로그인
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>GET /api/admin/auth/me</strong> - 관리자 세션 확인
                  </div>
                  <div className="bg-blue-50 p-3 rounded">
                    <strong>POST /api/admin/auth/session-logout</strong> - 관리자 로그아웃
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">계약 관리 API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/contracts/entries</strong> - 계약 목록 조회
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>POST /api/admin/contracts/entries</strong> - 계약 생성
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>PUT /api/admin/contracts/entries/[id]</strong> - 계약 수정
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>DELETE /api/admin/contracts/entries/[id]</strong> - 계약 삭제
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/contracts/requests</strong> - 상담신청 목록
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>PUT /api/admin/contracts/requests/[id]</strong> - 상담신청 처리
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">아이템 관리 API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-purple-50 p-3 rounded">
                    <strong>GET /api/admin/items/list</strong> - 아이템 목록
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <strong>GET /api/admin/sidebar-items</strong> - 사이드바 아이템
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <strong>PUT /api/admin/sidebar-items</strong> - 사이드바 수정
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <strong>POST /api/admin/items/settings</strong> - 아이템 설정
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">담당자 관리 API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-orange-50 p-3 rounded">
                    <strong>GET /api/admin/managers</strong> - 담당자 목록
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <strong>POST /api/admin/managers</strong> - 담당자 생성
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <strong>PUT /api/admin/managers/[id]</strong> - 담당자 수정
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <strong>DELETE /api/admin/managers/[id]</strong> - 담당자 삭제
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">수금 관리 API (완전 개발 완료)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/collections/all-contracts</strong> - 전체 계약 목록
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/collections/collection-contracts</strong> - 수금관리계약
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/collections/completed-contracts</strong> - 수금완료계약
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>GET /api/admin/collections/lump-sum-contracts</strong> - 일시납계약
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <strong>POST /api/admin/collections/verification/upload</strong> - 수금검증 Excel 업로드
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">회원 관리 API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>GET /api/admin/users</strong> - 회원 목록
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>PUT /api/admin/users/[id]</strong> - 회원 수정
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>POST /api/admin/users/bulk-delete</strong> - 회원 일괄삭제
                  </div>
                  <div className="bg-yellow-50 p-3 rounded">
                    <strong>GET /api/admin/members/search</strong> - 회원 검색
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 주요 기능 구현 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚙️ 주요 기능 구현</h2>
            <div className="space-y-6">
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">🔐 인증 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>다중 로그인:</strong> 웹 로그인, PWA 로그인, 앱 로그인 분리</div>
                  <div>• <strong>세션 관리:</strong> HTTP-only 쿠키 기반 세션</div>
                  <div>• <strong>권한 관리:</strong> ADMIN, MANAGER, STAFF, MEMBER, GENERAL</div>
                  <div>• <strong>관리자 시스템:</strong> 독립적인 Admin 테이블, SUPER_ADMIN 권한</div>
                  <div>• <strong>보안 필드:</strong> referralCode, points는 최고등급 관리자만 수정 가능</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">📋 계약 관리 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>계약 입력:</strong> 고객정보, 계약기본정보, 상세정보입력</div>
                  <div>• <strong>필수 필드:</strong> 증권번호, 납입기간, 계약금액 필수 입력</div>
                  <div>• <strong>동적 필드:</strong> JSON 형태로 확장 가능한 dynamicFields</div>
                  <div>• <strong>계약 수정:</strong> 실시간 수정 및 즉시 서버 반영</div>
                  <div>• <strong>계약 삭제:</strong> 확인 다이얼로그 및 완전 삭제</div>
                  <div>• <strong>카테고리:</strong> 보험, 렌탈, 인터넷TV, 상조, 렌탈몰, 쇼핑몰, 즉시파트너</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">🏷️ 아이템 관리 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>동적 상품 생성:</strong> +상품추가하기로 새로운 상품 생성</div>
                  <div>• <strong>제목 수정:</strong> 사이드바제목수정으로 모든 상품 제목 수정</div>
                  <div>• <strong>서버 동기화:</strong> 모든 변경사항 즉시 서버 저장</div>
                  <div>• <strong>페이지 생성:</strong> 상품명으로 자동 페이지 생성</div>
                  <div>• <strong>영어 경로:</strong> 한글 상품명을 영어 경로로 자동 변환</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">👨‍💼 담당자 관리 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>담당자 등록:</strong> 소속, 이름, 가입일 입력</div>
                  <div>• <strong>담당자 배정:</strong> 상담신청관리에서 담당자 선택</div>
                  <div>• <strong>상태 변경:</strong> 상담신청중 → 상담진행으로 자동 변경</div>
                  <div>• <strong>계약 연동:</strong> 계약입력관리에서 담당자 정보 자동 표시</div>
                  <div>• <strong>배정일시:</strong> 담당자 배정 시 자동 기록</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">📱 PWA 및 모바일 지원</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>PWA 전용 페이지:</strong> /pwa-login, /pwa-signup</div>
                  <div>• <strong>공통 페이지:</strong> /member, /benefits, /settlement, /partner, /more</div>
                  <div>• <strong>React Native:</strong> 네이티브 앱 개발 환경</div>
                  <div>• <strong>상태 관리:</strong> Zustand를 통한 모바일 상태 관리</div>
                  <div>• <strong>개발 도구:</strong> 어드민에서 네이티브 앱 개발 환경 제공</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">💰 수금 관리 시스템 (완전 개발 완료)</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>전체계약:</strong> 모든 계약 현황 조회 (ACTIVE, CONFIRMED, COMPLETED, CANCELLED, SUSPENDED)</div>
                  <div>• <strong>수금관리계약:</strong> COLLECTION 상태 계약 관리, 월납 계약 수금 진행 상황 추적</div>
                  <div>• <strong>수금완료계약:</strong> COMPLETED_COLLECTION 상태 계약 관리, 수금 완료일시 및 확정 정보</div>
                  <div>• <strong>일시납계약:</strong> LUMP_SUM 상태 계약 관리, 즉시 정산 대상 계약</div>
                  <div>• <strong>수금검증:</strong> Excel 파일 업로드, 계약 데이터와 수금 데이터 비교, 수금 성공/실패 분류</div>
                  <div>• <strong>페이지네이션:</strong> 10개씩 페이지 분할, 검색 및 필터링 기능</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">💾 백업 시스템</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>• <strong>3중 백업:</strong> 수동백업, 로컬Git, GitHub 원격백업</div>
                  <div>• <strong>수동 백업:</strong> node_modules 제외한 전체 프로젝트 백업</div>
                  <div>• <strong>Git 백업:</strong> feature/member-home-dark 브랜치</div>
                  <div>• <strong>GitHub 백업:</strong> 원격 저장소와 완전 동기화</div>
                  <div>• <strong>백업 정리:</strong> 이전 백업들 자동 정리</div>
                </div>
              </div>
            </div>
          </section>

          {/* 최근 해결된 문제들 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">🔧 최근 해결된 문제들 (2025년 9월 10일)</h2>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 계약입력관리 시스템 고도화</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• 증권번호 필수 입력 설정 및 검증 추가</div>
                  <div>• 납입기간 필드명 startDate → paymentTerm으로 변경</div>
                  <div>• 계약금액 parseInt() 처리 시 콤마 제거 로직 추가</div>
                  <div>• 계약목록 테이블에 납입기간 컬럼 추가</div>
                  <div>• 계약 수정/삭제 기능 완전 구현</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 아이템 관리 시스템 개선</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• 동적 상품 생성 시스템 구현 (+상품추가하기)</div>
                  <div>• 사이드바 제목 수정 시스템 구현</div>
                  <div>• 한글 상품명을 영어 경로로 자동 변환</div>
                  <div>• 서버 즉시 저장 및 동기화</div>
                  <div>• ItemCategory enum에 SHOPPING_MALL, INSTANT_PARTNER 추가</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 담당자 관리 시스템 구축</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• Manager 모델 추가 (담당자소속, 담당자이름, 가입일)</div>
                  <div>• 담당자 등록/수정/삭제 기능 구현</div>
                  <div>• 상담신청관리에서 담당자 배정 기능</div>
                  <div>• 계약입력관리에서 담당자 정보 자동 표시</div>
                  <div>• 배정일시 자동 기록</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ PWA 및 모바일 통합</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• PWA 전용 로그인/회원가입 페이지 분리</div>
                  <div>• 웹과 PWA 경로 통합 및 최적화</div>
                  <div>• React Native 네이티브 앱 개발 환경</div>
                  <div>• 어드민 네이티브 앱 개발 도구</div>
                  <div>• 실시간 미리보기 및 디바이스 프레임</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 수금 관리 시스템 완전 개발 완료</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• 전체계약 페이지: 모든 계약 현황 조회 및 상태별 필터링</div>
                  <div>• 수금관리계약 페이지: COLLECTION 상태 계약 관리</div>
                  <div>• 수금완료계약 페이지: COMPLETED_COLLECTION 상태 계약 관리</div>
                  <div>• 일시납계약 페이지: LUMP_SUM 상태 계약 관리</div>
                  <div>• 수금검증 페이지: Excel 업로드, 데이터 비교, 성공/실패 분류</div>
                  <div>• 5개 API 엔드포인트 완전 구현</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 백업 시스템 정리</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• 3중 백업 체계 구축 (수동백업, 로컬Git, GitHub)</div>
                  <div>• 이전 혼란스러운 백업들 모두 정리</div>
                  <div>• node_modules 제외한 최적화된 백업</div>
                  <div>• 백업 정보 API 실시간 업데이트</div>
                  <div>• 개발가이드 백업 현황 정확한 반영</div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ 데이터베이스 스키마 확장</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• SidebarItem 모델 추가 (동적 사이드바 관리)</div>
                  <div>• Contract 모델에 dynamicFields, decisionPoints 등 추가</div>
                  <div>• Admin 모델 독립화 (관리자 전용 테이블)</div>
                  <div>• Manager 모델 추가 (담당자 관리)</div>
                  <div>• 총 25개 모델로 확장</div>
                </div>
              </div>
            </div>
          </section>

          {/* 현재 시스템 상태 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">📈 현재 시스템 상태 (2025년 9월 10일)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">✅ 완료된 기능</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>인증 시스템:</strong> 웹/PWA/앱 로그인 분리</li>
                  <li>• <strong>관리자 시스템:</strong> 독립적인 Admin 테이블</li>
                  <li>• <strong>회원 관리:</strong> 일반/파트너/관리자/담당자</li>
                  <li>• <strong>계약 관리:</strong> 입력/수정/삭제/검색</li>
                  <li>• <strong>아이템 관리:</strong> 동적 생성/제목수정</li>
                  <li>• <strong>담당자 관리:</strong> 등록/배정/관리</li>
                  <li>• <strong>수금 관리:</strong> 전체계약/수금관리/수금완료/일시납/수금검증</li>
                  <li>• <strong>상담신청 관리:</strong> 파트너 신청 및 승인</li>
                  <li>• <strong>PWA 지원:</strong> 웹과 모바일 통합</li>
                  <li>• <strong>백업 시스템:</strong> 3중 백업 체계</li>
                  <li>• <strong>회사 정보 관리:</strong> 기본 설정</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-3">🚧 향후 개발 예정</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• <strong>정산 관리:</strong> 정산완료리스트, 수당수수료계산, 출금요청리스트</li>
                  <li>• <strong>결제 시스템:</strong> Payment 모델 활용</li>
                  <li>• <strong>정산 시스템:</strong> Settlement 모델 활용</li>
                  <li>• <strong>포인트 시스템:</strong> PointLedger 모델 활용</li>
                  <li>• <strong>알림 시스템:</strong> Notification 모델 활용</li>
                  <li>• <strong>통계 대시보드:</strong> 실시간 통계</li>
                  <li>• <strong>문의사항:</strong> Question 모델 활용</li>
                  <li>• <strong>출금 요청:</strong> WithdrawalRequest 모델 활용</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-medium text-blue-800 mb-2">📊 현재 데이터 현황</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">6</div>
                  <div className="text-gray-600">총 사용자</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">1</div>
                  <div className="text-gray-600">총 계약</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">20</div>
                  <div className="text-gray-600">총 상품</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">3</div>
                  <div className="text-gray-600">담당자</div>
                </div>
              </div>
            </div>
          </section>

          {/* 개발 환경 설정 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚙️ 개발 환경 설정</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">필수 명령어</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npm install
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npx prisma generate
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npx prisma db push
                  </div>
                  <div className="bg-gray-50 p-3 rounded font-mono">
                    npm run dev
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">문제 해결</h3>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-50 p-3 rounded">
                    <strong>EPERM 오류:</strong> taskkill /f /im node.exe 후 재시작
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <strong>Prisma 오류:</strong> npx prisma generate && npx prisma db push
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <strong>캐시 문제:</strong> .next 폴더 삭제 후 재시작
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <strong>Service Worker:</strong> sw.js 파일 비활성화로 캐시 문제 해결
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 백업 시스템 */}
          <section className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">💾 백업 시스템 (3중 백업 체계)</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">📦 1단계 - 수동 백업</h3>
                <div className="bg-blue-50 p-4 rounded text-sm">
                  <div><strong>백업 디렉토리:</strong> C:\home\backup-2025-09-09_17-52-13</div>
                  <div><strong>백업 일시:</strong> 2025년 9월 9일 오후 5:59</div>
                  <div><strong>백업 내용:</strong> sales-partner-landing, sales-partner-mobile-app (node_modules 제외)</div>
                  <div><strong>백업 크기:</strong> 약 2.5GB</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">🔄 2단계 - 로컬 Git 백업</h3>
                <div className="bg-green-50 p-4 rounded text-sm">
                  <div><strong>브랜치:</strong> feature/member-home-dark</div>
                  <div><strong>커밋 해시:</strong> 28b6939</div>
                  <div><strong>커밋 일시:</strong> 2025년 9월 9일 오후 6:06</div>
                  <div><strong>커밋 메시지:</strong> "feat: 계약입력관리 시스템 고도화 및 백업 시스템 정리"</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">☁️ 3단계 - GitHub 원격 백업</h3>
                <div className="bg-purple-50 p-4 rounded text-sm">
                  <div><strong>원격 저장소:</strong> https://github.com/psy8200/sales-partner-landing.git</div>
                  <div><strong>동기화 상태:</strong> 최신</div>
                  <div><strong>마지막 푸시:</strong> 2025. 9. 9. 오후 6:06:18</div>
                  <div><strong>백업 상태:</strong> ✅ 완료</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">🔄 백업 정리 완료</h3>
                <div className="bg-gray-50 p-4 rounded text-sm">
                  <div><strong>삭제된 백업:</strong> backup-2025-09-06_00-43-26, backup-2025-09-06_00-43-33, backup-2025-09-09_17-12-59</div>
                  <div><strong>유지되는 백업:</strong> backup-2025-09-09_17-52-13</div>
                  <div><strong>백업 정보 API:</strong> /api/admin/backup-info 실시간 업데이트</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

