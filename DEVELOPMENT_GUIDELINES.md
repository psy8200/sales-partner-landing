# 개발 가이드 (Development Guidelines)

## 📋 프로젝트 개요
- **프로젝트명**: Sales Partner Landing Page + Native Mobile App
- **기술 스택**: 
  - **웹**: Next.js 15, TypeScript, Tailwind CSS, Prisma ORM
  - **모바일**: React Native, Expo, TypeScript, Zustand
- **데이터베이스**: SQLite (개발환경)
- **주요 기능**: 
  - **웹**: 파트너 상담 신청, 계약 관리, 회원 관리, 아이템 관리, 포인트 시스템, 정산 관리
  - **모바일**: 네이티브 앱 회원 대시보드, 실시간 통계, 포인트 관리, 활동 내역
  - **개발 도구**: 어드민 네이티브 앱 개발 환경, 실시간 미리보기, 디바이스 프레임

## 🏗️ 시스템 아키텍처

### 데이터베이스 스키마 (Prisma) - 총 25개 모델
```prisma
// 핵심 모델들
- User: 회원 정보 (역할, 파트너상태, 포인트, 레벨 등)
- Admin: 관리자 정보 (SUPER_ADMIN, ADMIN 역할)
- Manager: 담당자 정보 (소속, 이름, 가입일)
- Contract: 계약 정보 (렌탈, 보험, 상조 등)
- ItemSetting: 상품 설정
- CompanyInfo: 회사 정보
- Payment: 결제 정보
- Settlement: 정산 정보
- PointLedger: 포인트 내역
- WithdrawalRequest: 출금 요청
- ActivityLog: 활동 로그
- Notification: 알림
- Question: 문의사항
- ProfitItem: 수익 항목
- Consultation: 상담 정보
- Application: 신청서
- UserLog: 사용자 로그
- SystemConfig: 시스템 설정
- ExportLog: 내보내기 로그
- PartnerApplication: 파트너 신청
- ActivityBackup: 활동 백업
- AdminLoginLog: 관리자 로그인 로그
- SidebarItem: 사이드바 아이템
- ProfileChangeRequest: 프로필 변경 요청
```

### 디렉토리 구조
```
# 웹 프로젝트 (sales-partner-landing)
src/
├── app/
│   ├── admin/           # 관리자 페이지
│   │   ├── admins/      # 관리자 관리
│   │   ├── collections/ # 수금 관리 (완전 개발 완료)
│   │   ├── contracts/   # 계약 관리
│   │   ├── items/       # 아이템 관리
│   │   ├── members/     # 회원 관리
│   │   ├── settlements/ # 정산 관리 (일부 개발 완료)
│   │   ├── payment-*/   # 결제 관리
│   │   └── dev-guide/   # 개발 가이드 (네이티브 앱 개발 도구 포함)
│   ├── (member)/        # 회원 전용 페이지
│   ├── api/             # API 라우트
│   │   ├── admin/       # 관리자 API
│   │   ├── auth/        # 인증 API
│   │   ├── mypage/      # 마이페이지 API
│   │   └── ...          # 기타 API
│   ├── login/           # 로그인
│   ├── signup/          # 회원가입
│   ├── mypage/          # 마이페이지
│   ├── partner-apply/   # 파트너 신청
│   ├── support/         # 고객지원
│   └── ...              # 기타 페이지
├── components/          # 재사용 컴포넌트
├── lib/                # 유틸리티 함수
└── types/              # TypeScript 타입 정의

# 네이티브 앱 프로젝트 (sales-partner-mobile-app/SalesPartnerApp)
├── src/
│   ├── components/     # 네이티브 컴포넌트
│   ├── screens/        # 화면 컴포넌트
│   ├── navigation/     # 네비게이션
│   ├── services/       # API 서비스
│   ├── hooks/          # 커스텀 훅
│   ├── types/          # 타입 정의
│   ├── utils/          # 유틸리티
│   └── styles/         # 스타일
├── App.tsx             # 앱 진입점
├── app.json            # Expo 설정
└── package.json        # 의존성
```

## 🔧 주요 개발 작업 내역

### 1. 어드민 대시보드 현대화 (2025년 8월 29일 ~ 30일)
- **작업 내용**:
  - Tailwind CSS를 활용한 반응형 그리드 레이아웃
  - 12컬럼 그리드 시스템 적용 (`grid grid-cols-12`)
  - 통계 카드, 차트, 퀵 액션 버튼 구현
  - 알림 벨, 회원 검색 모달 등 UI 컴포넌트 추가
  - 실시간 대시보드 통계 및 활동 로그

### 2. 계약 입력 관리 시스템 구축 (2025년 8월 30일)
- **핵심 기능**:

#### 2.1 고객 정보 필드 확장
- **변경 전**: 고객명/연락처/주소 (3개 필드)
- **변경 후**: 고객명/연락처/주소/피보험자명/피보험자연락처 (5개 필드)
- **레이아웃**: 2/2/4/2/2 비율로 가로 1줄 배치

#### 2.2 계약 기본 정보 개선
- **필드 구성**:
  - 계약일: `col-span-2` (날짜 선택)
  - 납입기간: `col-span-2` (드롭다운)
  - 종료일: `col-span-2` (드롭다운)
  - 결정지급율: `col-span-2` (100%~10% 드롭다운)
  - 최종결정포인트: `col-span-2` (읽기전용)
  - 설치완료일: `col-span-2` (날짜 선택)

#### 2.3 자동 계산 시스템
- **결정포인트 계산**:
  ```
  월별기준금액 = 계약금액 × (예상지급율 ÷ 24 ÷ 100)
  결정포인트 = 월별기준금액 × (포인트전환율 ÷ 100)
  ```
- **최종결정포인트 계산**:
  ```
  최종결정포인트 = 결정포인트 × 결정지급율
  ```

### 3. 수금 관리 시스템 (완전 개발 완료) ✅

#### 3.1 전체계약 (`/admin/collections/all-contracts`) ✅ 완료
- **기능**: 모든 계약 현황 조회
- **상태 필터링**: ACTIVE, CONFIRMED, COMPLETED, CANCELLED, SUSPENDED
- **고객 정보**: 이름, 전화번호, 주소
- **계약 정보**: 상품 카테고리, 계약금액, 수수료, 포인트
- **페이지네이션**: 10개씩 페이지 분할
- **검색 기능**: 고객명, 전화번호, 계약번호 검색
- **API**: `GET /api/admin/collections/all-contracts`

#### 3.2 수금관리계약 (`/admin/collections/collection-contracts`) ✅ 완료
- **기능**: COLLECTION 상태 계약 관리
- **수금 진행 상황 추적**: 월납 계약의 수금 상태 관리
- **확정일시 필터**: 월별 그룹핑으로 수금 현황 파악
- **계약별 상세 정보**: 동적 필드 파싱 및 표시
- **API**: `GET /api/admin/collections/collection-contracts`

#### 3.3 수금완료계약 (`/admin/collections/completed-contracts`) ✅ 완료
- **기능**: COMPLETED_COLLECTION 상태 계약 관리
- **수금 완료일시**: 확정일시 기준 정렬
- **최종 포인트 계산**: 수금 완료된 계약의 최종 포인트
- **월별 그룹핑**: 확정일시별 계약 현황
- **API**: `GET /api/admin/collections/completed-contracts`

#### 3.4 일시납계약 (`/admin/collections/lump-sum-contracts`) ✅ 완료
- **기능**: LUMP_SUM 상태 계약 관리
- **일시납 완료 계약**: 즉시 정산 대상 계약
- **계약금액 기준 정렬**: 높은 금액부터 표시
- **API**: `GET /api/admin/collections/lump-sum-contracts`

#### 3.5 수금검증 (`/admin/collections/verification`) ✅ 완료
- **기능**: 계약별 수금 상태 검증
- **Excel 파일 업로드**: 수금 데이터 업로드
- **데이터 비교**: 계약 데이터와 수금 데이터 매칭
- **수금 성공/실패 분류**: 자동 분류 및 처리
- **검증 결과 리포트**: 상세한 검증 결과 표시
- **API**: `POST /api/admin/collections/verification/upload`

### 4. 정산 관리 시스템 (일부 개발 완료) 🚧

#### 4.1 정산리스트 (`/admin/settlements/list`) ✅ 완료
- **기능**: 수금완료계약과 일시납계약 데이터 통합 관리
- **정산 대상 계약**: PENDING, COMPLETED, PROCESSING 상태 관리
- **Excel 다운로드**: 정산 데이터 내보내기
- **계약 선택**: 일괄 처리 기능
- **상태별 배지**: 수금완료(초록), 일시납(파란), 정산상태별 색상
- **목업 데이터**: 현재 목업 데이터로 UI 구현

#### 4.2 정산 관리 하위 페이지들 🚧 개발중
- **정산완료리스트** (`/admin/settlements/completed`): 기본 페이지만 존재
- **수당수수료계산** (`/admin/settlements/commission-calculator`): 기본 페이지만 존재
- **출금요청리스트** (`/admin/settlements/withdrawal-requests`): 기본 페이지만 존재
- **파트너추천리스트** (`/admin/settlements/partner-referrals`): 기본 페이지만 존재
- **파트너트리정보** (`/admin/settlements/partner-tree`): 기본 페이지만 존재

### 5. 계약 관리 시스템 ✅ 완료

#### 5.1 계약입력관리 (`/admin/contracts/entries`) ✅ 완료
- **계약 생성**: 새로운 계약 입력 및 저장
- **계약 수정**: 기존 계약 정보 수정
- **계약 삭제**: 계약 완전 삭제 기능
- **동적 필드**: 상품별 맞춤 필드 지원
- **자동 계산**: 포인트 및 수수료 자동 계산
- **API**: `POST /api/admin/contracts/entries`, `PUT /api/admin/contracts/entries/[id]`, `DELETE /api/admin/contracts/entries/[id]`

#### 5.2 계약신청관리 (`/admin/contracts/requests`) ✅ 완료
- **신청서 관리**: 파트너 신청서 조회 및 처리
- **상태 관리**: PENDING, APPROVED, REJECTED 상태
- **일괄 처리**: 여러 신청서 동시 처리
- **API**: `GET /api/admin/contracts/requests`, `POST /api/admin/contracts/requests/bulk`

### 6. 아이템 관리 시스템 ✅ 완료

#### 6.1 상품 관리 (`/admin/items`) ✅ 완료
- **카테고리별 관리**: INSURANCE, RENTAL, INTERNET_TV, FUNERAL, RENTAL_MALL, SHOPPING_MALL, INSTANT_PARTNER
- **동적 상품 생성**: +상품추가하기 기능
- **사이드바 제목 수정**: 실시간 제목 변경
- **상품 설정**: 각 상품별 수수료율, 포인트율 설정
- **API**: `GET /api/admin/items/list`, `POST /api/admin/items/settings`

#### 6.2 상품별 상세 페이지 ✅ 완료
- **개별 상품 페이지**: `/admin/items/[itemName]`
- **상품별 계약 관리**: 해당 상품의 계약 현황
- **통계 정보**: 상품별 수익 및 계약 통계

### 7. 회원 관리 시스템 ✅ 완료

#### 7.1 회원 목록 (`/admin/members`) ✅ 완료
- **회원 조회**: 전체 회원 목록 및 검색
- **역할 관리**: ADMIN, MANAGER, STAFF, MEMBER, GENERAL
- **파트너 상태**: NOT_APPLIED, PARTNER_APPLIED, APPROVED
- **상태 관리**: PENDING, ACTIVE, SUSPENDED, DELETED
- **일괄 삭제**: 여러 회원 동시 삭제
- **API**: `GET /api/admin/users`, `POST /api/admin/users/bulk-delete`

#### 7.2 회원 상세 (`/admin/members/[id]/edit`) ✅ 완료
- **개인 정보 수정**: 이름, 연락처, 주소 등
- **포인트 관리**: 포인트 조정 및 내역
- **역할 변경**: 회원 역할 및 권한 변경
- **API**: `GET /api/admin/users/[id]`, `PUT /api/admin/users/[id]`

### 8. 담당자 관리 시스템 ✅ 완료

#### 8.1 담당자 관리 (`/admin/admins/managers`) ✅ 완료
- **담당자 등록**: 소속, 이름, 가입일 입력
- **담당자 목록**: 테이블 형태로 관리
- **수정/삭제**: 담당자 정보 수정 및 삭제
- **API**: `GET /api/admin/managers`, `POST /api/admin/managers`

### 9. 결제 관리 시스템 ✅ 완료

#### 9.1 결제 검증 (`/admin/payment-verification`) ✅ 완료
- **Excel 업로드**: 결제 데이터 업로드
- **데이터 검증**: 결제 정보 검증
- **성공/실패 분류**: 자동 분류 처리
- **API**: `POST /api/admin/payment-verification/upload`

#### 9.2 결제 성공/실패 관리 ✅ 완료
- **결제 성공** (`/admin/payment-success`): 성공한 결제 관리
- **결제 실패** (`/admin/payment-failure`): 실패한 결제 관리
- **상태 변경**: 성공/실패 간 상태 이동
- **API**: `GET /api/admin/payment-success`, `GET /api/admin/payment-failure`

### 10. API 시스템 고도화 ✅ 완료

#### 10.1 수금 관리 API ✅ 완료
- `GET /api/admin/collections/all-contracts`: 전체 계약 목록 조회
- `GET /api/admin/collections/collection-contracts`: 수금관리계약 목록 조회
- `GET /api/admin/collections/completed-contracts`: 수금완료계약 목록 조회
- `GET /api/admin/collections/lump-sum-contracts`: 일시납계약 목록 조회
- `POST /api/admin/collections/verification/upload`: 수금검증 Excel 업로드

#### 10.2 사이드바 관리 API ✅ 완료
- `GET /api/admin/sidebar-items`: 사이드바 아이템 목록 조회
- `POST /api/admin/sidebar-items`: 새 사이드바 아이템 추가
- `PUT /api/admin/sidebar-items`: 사이드바 아이템 일괄 업데이트
- `GET /api/admin/sidebar-items/[href]`: 특정 아이템 조회
- `PUT /api/admin/sidebar-items/[href]`: 특정 아이템 수정
- `DELETE /api/admin/sidebar-items/[href]`: 특정 아이템 삭제

#### 10.3 관리자 시스템 강화 ✅ 완료
- **다중 세션 지원**: `adminSession_*` 쿠키 형식으로 다중 세션 관리
- **권한 체계**: SUPER_ADMIN, ADMIN, MANAGER, STAFF 역할 구분
- **세션 토큰 관리**: JWT 기반 안전한 세션 토큰 처리
- **최고관리자 권한**: Admin 테이블 기반 권한 확인

#### 10.4 사용자 인증 API 개선 ✅ 완료
- `GET /api/auth/me`: 사용자 정보 및 포인트 계산 로직 통합
- 수금관리탭의 모든 페이지 데이터 통합 계산
- 어드민 포인트 API와 동일한 계산 로직 적용

### 11. React Native 네이티브 앱 개발 ✅ 완료
- **앱 아키텍처**: 
  - React Native + Expo 프레임워크
  - TypeScript 완전 지원
  - Zustand 상태 관리
  - React Navigation (Bottom Tab + Stack)
- **주요 화면**:
  - HomeScreen: 대시보드 (SummaryCard, QuickActions, InfoCards, RecentActivity)
  - LoginScreen: 인증 화면
  - MainNavigator: 네비게이션 구조
- **API 통합**: 기존 웹 API 엔드포인트 재사용
- **네이티브 최적화**: 
  - iOS Safe Area 지원
  - Android Material Design 3
  - Haptic Feedback
  - 생체 인증 지원

### 12. 어드민 네이티브 앱 개발 도구 ✅ 완료
- **개발 환경 통합**:
  - Expo 서버 상태 모니터링
  - 실시간 Hot Reload 상태 표시
  - 네이티브 앱 빌드 로그 실시간 표시
  - 에러 발생 시 어드민에서 즉시 확인
- **파일 관리**:
  - 파일 탐색기 (네이티브 앱 소스 코드)
  - 코드 편집기 (실시간 편집)
  - 자동 새로고침 트리거
- **디바이스 프레임**:
  - iPhone 15 Pro, iPhone 15, iPhone SE
  - Galaxy S24, Galaxy S24 Ultra, Galaxy A54
  - iPad, iPad Pro
  - 실제 스마트폰 해상도로 미리보기

### 13. PWA 및 웹 경로 통합 ✅ 완료

#### 13.1 PWA 전용 페이지
- **PWA 로그인**: `/pwa-login` (PWA 전용 API 사용)
- **PWA 회원가입**: `/pwa-signup` (PWA 전용 API 사용)
- **공통 페이지**: `/member`, `/benefits`, `/settlement`, `/partner`, `/more` (웹과 PWA 공유)

#### 13.2 경로 통합 및 최적화
- **PWA 개발 도구**: PWA 경로 정확한 반영
- **로그인 후 리다이렉트**: PWA는 `/member`, 웹은 `/mypage`
- **회원가입 후 리다이렉트**: PWA는 `/pwa-login`, 웹은 `/login`
- **UI/UX 통합**: 웹과 PWA 동일한 스타일 적용

## 🚧 현재 개발 중인 기능
- **정산 관리 시스템**: 
  - 정산완료리스트 페이지 🚧 개발중
  - 수당수수료계산 도구 🚧 개발중
  - 출금요청리스트 관리 🚧 개발중
  - 파트너추천리스트 관리 🚧 개발중
  - 파트너트리정보 시스템 🚧 개발중
- **성능 최적화**: 대용량 데이터 처리 최적화
- **UI/UX 개선**: 사용자 경험 향상
- **API 통합**: 모든 시스템 간 데이터 동기화

## ✅ 완료된 주요 기능
- **수금관리 시스템**: Excel 업로드, 데이터 비교, 수금성공/실패 분류 ✅ 완료
- **계약입력 관리 시스템**: 계약 생성, 수정, 삭제, 검증 ✅ 완료
- **아이템 관리 시스템**: 동적 상품 생성, 카테고리 관리 ✅ 완료
- **담당자 관리 시스템**: 담당자 배정, 관리 ✅ 완료
- **PWA 및 웹 경로 통합**: 로그인, 회원가입, 공통 페이지 ✅ 완료
- **React Native 네이티브 앱**: 완전한 모바일 앱 구현 ✅ 완료
- **어드민 개발 도구**: 네이티브 앱 개발 환경 통합 ✅ 완료

## 🛠️ 기술적 해결사항

### 1. Prisma 스키마 마이그레이션
- **문제**: CUSTOM 카테고리 제거 시 기존 데이터 충돌
- **해결**: Raw SQL을 사용한 데이터 마이그레이션
- **API**: `/api/admin/items/migrate-custom` 엔드포인트 구현

### 2. React Key 오류 해결
- **문제**: `Error: Encountered two children with the same key`
- **해결**: `safeKey` 유틸리티 함수 구현 및 고유 키 보장

### 3. 세션 관리 시스템
- **JWT 토큰**: 안전한 세션 토큰 관리
- **쿠키 기반**: httpOnly 쿠키를 통한 보안 강화
- **자동 로그아웃**: 세션 만료 시 자동 로그아웃

### 4. 실시간 계산 및 검증
- **폼 검증**: 필수 필드 검증 및 실시간 계산
- **데이터 동기화**: 프론트엔드-백엔드 데이터 일관성 유지

### 5. 한글 인코딩 문제 해결
- **문제**: API 응답에서 한글이 `???` 또는 깨진 문자로 표시
- **해결**: Content-Type 헤더에 charset=utf-8 명시
- **적용**: 모든 API 엔드포인트에 적용

## 📊 최신 데이터베이스 현황 (2025년 9월 10일 기준)

### 현재 데이터 현황
- **총 사용자**: 6명 (최고관리자 포함)
- **총 계약**: 1건 (수금관리계약)
- **총 상품**: 20개 (기본 상품 + 동적 생성 상품)
- **담당자**: 3명
- **파트너 신청**: 5건
- **활동 로그**: 11건
- **문의사항**: 0건
- **결제**: 0건
- **정산**: 0건

### 백업 시스템 (3중 백업 체계)

#### 📦 1단계 - 자동 데이터베이스 백업
- **백업 디렉토리**: `C:\home\sales-partner-landing\auto-backups\2025-09-10T09-26-17-777Z`
- **백업 일시**: 2025년 9월 10일 오전 9:26
- **백업 내용**:
  - 총 19개 테이블 백업 완료
  - users, items, partner-applications, activity-logs, company-info 등
  - user-logs, notifications, contracts, questions 등
  - 전체 백업 파일: `full-backup.json`
  - 요약 파일: `backup-summary.json`
  - 최신 백업: `latest-backup.json`
- **백업 상태**: ✅ 완료

#### 🔄 2단계 - 로컬 Git 백업
- **브랜치**: `feature/member-home-dark`
- **커밋 해시**: `e499928`
- **커밋 일시**: 2025년 9월 10일 오전 9:26
- **커밋 메시지**: "feat: 전체 시스템 백업 및 최신 개발 내용 커밋"
- **변경사항**:
  - 111개 파일 변경
  - 5,467줄 추가
  - 322줄 삭제
- **새로 추가된 주요 파일들**:
  - 정산 관리 페이지들 (7개 페이지)
  - 새로운 API 엔드포인트들
  - 백업 데이터 파일들 (21개 JSON 파일)
- **백업 상태**: ✅ 완료

#### ☁️ 3단계 - GitHub 원격 백업
- **저장소**: `https://github.com/psy8200/sales-partner-landing.git`
- **푸시 일시**: 2025년 9월 10일 오전 9:26
- **푸시 내용**:
  - 정산 관리 시스템 고도화
  - API 시스템 개선
  - 전체 데이터베이스 백업
  - 원격 저장소와 완전 동기화
- **백업 상태**: ✅ 완료

#### 🧹 백업 정리 완료
- **유지되는 백업들**:
  - `backup-2025-09-09_17-52-13` ✅ 유지 (전체 시스템 백업)
  - `auto-backups/2025-09-10T09-26-17-777Z` ✅ 유지 (최신 데이터 백업)
- **백업 주기**: 자동 백업 스크립트를 통한 정기 백업

## 🔒 보안 및 권한 관리
- **AdminGuard**: 관리자 페이지 접근 제어
- **세션 관리**: 로그인 상태 유지
- **API 보안**: 인증된 요청만 처리
- **CSRF 보호**: CSRF 토큰을 통한 보안 강화

## 📱 반응형 디자인
- **모바일 퍼스트**: Tailwind CSS 반응형 클래스 활용
- **그리드 시스템**: 12컬럼 그리드로 유연한 레이아웃
- **접근성**: ARIA 라벨 및 키보드 네비게이션 지원
- **다크모드**: 시스템 테마에 따른 자동 다크모드

## 🚀 성능 최적화
- **컴포넌트 최적화**: React.memo 및 useMemo 활용
- **데이터 페이징**: 대용량 데이터 처리
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **코드 스플리팅**: 동적 import를 통한 번들 최적화

## 🧪 테스트 및 디버깅
- **에러 바운더리**: React 에러 처리
- **로깅**: 상세한 에러 로그 및 디버깅 정보
- **백업 시스템**: 데이터 백업 및 복구 기능
- **개발 도구**: 개발 가이드 및 디버깅 페이지

## 📝 코드 스타일 가이드
- **TypeScript**: 엄격한 타입 체크
- **함수형 컴포넌트**: React Hooks 활용
- **명명 규칙**: 명확하고 의미있는 변수/함수명
- **주석**: 상세한 코드 설명
- **ESLint**: 코드 품질 관리

## 🔄 배포 및 유지보수
- **환경 변수**: .env 파일을 통한 설정 관리
- **데이터베이스 백업**: 정기적인 데이터 백업
- **모니터링**: 에러 추적 및 성능 모니터링
- **버전 관리**: Git을 통한 코드 버전 관리

## 📞 지원 및 문의
- **개발자**: AI Assistant
- **최종 업데이트**: 2025년 9월 10일
- **버전**: 2.2.0 (정산 관리 시스템 고도화)
- **백업 상태**: ✅ 3중 백업 완료 (2025-09-10T09-26-17-777Z)
- **GitHub 상태**: ✅ 푸시 완료 (feature/member-home-dark, 커밋: e499928)

---

**⚠️ 중요**: 이 가이드는 지속적으로 업데이트되며, 모든 변경사항은 이 문서에 반영됩니다.�|�  ��  ���:   0 9 / 1 0 / 2 0 2 5   1 8 : 4 7 : 3 9  
 �|�  ��  ���:   2 0 2 5 - 0 9 - 1 0   1 8 : 5 0 : 4 0  
 