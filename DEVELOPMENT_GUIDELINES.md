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

### 데이터베이스 스키마 (Prisma)
```prisma
// 주요 모델들 (총 18개 테이블)
- User: 회원 정보 (역할, 파트너상태, 포인트, 레벨 등)
- PartnerApplication: 파트너 신청
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
```

### 디렉토리 구조
```
# 웹 프로젝트 (sales-partner-landing)
src/
├── app/
│   ├── admin/           # 관리자 페이지
│   │   ├── contracts/   # 계약 관리
│   │   ├── items/       # 아이템 관리
│   │   ├── members/     # 회원 관리
│   │   ├── collections/ # 수금 관리
│   │   ├── settlements/ # 정산 관리
│   │   └── dev-guide/   # 개발 가이드 (네이티브 앱 개발 도구 포함)
│   ├── (member)/        # 회원 전용 페이지
│   ├── api/             # API 라우트
│   │   ├── expo/        # Expo 개발 도구 API
│   │   └── ...          # 기타 API
│   ├── login/           # 로그인
│   ├── signup/          # 회원가입
│   ├── mypage/          # 마이페이지
│   ├── partner-apply/   # 파트너 신청
│   ├── support/         # 고객지원
│   └── ...              # 기타 페이지
├── components/          # 재사용 컴포넌트
│   ├── NativeAppDevTool.tsx  # 네이티브 앱 개발 도구
│   ├── FileWatcher.tsx       # 파일 변경 감지
│   ├── ApiMonitor.tsx        # API 모니터링
│   └── ...                   # 기타 컴포넌트
├── lib/                # 유틸리티 함수
└── types/              # TypeScript 타입 정의

# 네이티브 앱 프로젝트 (sales-partner-mobile-app/SalesPartnerApp)
├── src/
│   ├── components/     # 네이티브 컴포넌트
│   │   ├── common/     # 공통 컴포넌트
│   │   └── business/   # 비즈니스 컴포넌트
│   ├── screens/        # 화면 컴포넌트
│   │   ├── auth/       # 인증 화면
│   │   └── main/       # 메인 화면
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

### 3. 수금 관리 시스템 구축 (2025년 8월 31일)
- **전체계약 관리**: 모든 계약의 수금 현황 조회
- **수금관리계약**: 월납 계약 관리
- **일시납계약**: 일시납 계약 관리
- **수금검증**: 계약별 수금 상태 검증
- **계약 상태 관리**: ACTIVE, CONFIRMED, COMPLETED, CANCELLED, SUSPENDED

### 4. 정산 관리 시스템 (2025년 9월 1일)
- **정산 내역 조회**: 월별/분기별 정산 현황
- **정산 상태 관리**: PENDING, PROCESSING, COMPLETED, CANCELLED, ON_HOLD
- **정산 방법**: BANK_TRANSFER, CHECK, CASH, OTHER
- **세금 계산**: 자동 세금 계산 및 공제

### 5. 포인트 시스템 구축 (2025년 9월 1일)
- **포인트 적립**: 계약별 포인트 자동 적립
- **포인트 사용**: 출금 요청 및 처리
- **포인트 내역**: PointLedger를 통한 상세 내역 관리
- **레벨 시스템**: 추천인 수에 따른 등급 관리

### 6. 회원 관리 시스템 고도화 (2025년 9월 1일)
- **역할 관리**: ADMIN, MANAGER, STAFF, MEMBER, GENERAL
- **파트너 상태**: NOT_APPLIED, PARTNER_APPLIED, APPROVED
- **사용자 상태**: PENDING, ACTIVE, SUSPENDED, DELETED
- **추천인 시스템**: referralCode를 통한 추천인 관리

### 7. 마이페이지 시스템 (2025년 9월 2일)
- **개인 정보 관리**: 프로필 수정, 비밀번호 변경
- **포인트 현황**: 총 포인트, 출금가능 포인트, 예정 포인트
- **활동 내역**: 최근 활동 로그 및 통계
- **문의 관리**: 1:1 문의 작성 및 조회
- **정산 내역**: 월별 정산 현황 조회

### 8. 고객지원 시스템 (2025년 9월 2일)
- **1:1 문의**: 질문 작성 및 답변 조회
- **FAQ**: 자주 묻는 질문 관리
- **문의 상태**: PENDING, ANSWERED
- **관리자 답변**: 관리자 답변 시스템

### 9. 자동 백업 시스템 (2025년 9월 1일)
- **데이터 백업**: 사용자, 계약, 상품 데이터 자동 백업
- **백업 스케줄링**: 정기적인 백업 실행
- **백업 복구**: 백업 데이터 복구 기능
- **백업 모니터링**: 백업 상태 및 크기 모니터링

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

### 5. ESLint 코드 품질 관리
- **현재 문제**: 53개의 ESLint 경고/오류
- **주요 이슈**: 
  - 사용하지 않는 변수/함수 (25개)
  - any 타입 사용 (13개)
  - React Hooks 의존성 문제 (2개)
- **해결 방안**: 단계적 코드 정리 및 타입 안전성 강화

## 📊 데이터베이스 현황 (2025년 9월 3일 기준)

### 현재 데이터 현황
- **총 사용자**: 4명
- **총 계약**: 6건
- **총 상품**: 18개
- **파트너 신청**: 1건
- **활동 로그**: 7건
- **문의사항**: 0건
- **결제**: 0건
- **정산**: 0건

### 백업 시스템
- **수동 백업**: 3개 시점 (2025-01-31, 2025-08-31, 2025-09-02)
- **자동 백업**: 최신 백업 (2025-09-01)
- **백업 크기**: 약 45.6MB (수동) + 34.7KB (자동)

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

## 🌏 한글 인코딩 문제 해결

### 🚨 문제 상황
- API 응답에서 한글이 `???` 또는 깨진 문자로 표시
- 데이터베이스에는 정상 저장되지만 웹에서 표시 안됨
- PowerShell에서 API 호출 시 한글 깨짐

### ✅ 해결 방법
API 엔드포인트에서 Content-Type 헤더에 charset=utf-8 명시:

```typescript
// ❌ 문제가 있는 코드
return NextResponse.json({
  success: true,
  data: companyInfo
});

// ✅ 해결된 코드
return NextResponse.json({
  success: true,
  data: companyInfo
}, {
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
});
```

### 📁 적용 대상
- 모든 API 엔드포인트 (GET, POST, PUT, DELETE)
- 한글 데이터를 다루는 모든 응답

### 🎯 예방 방법
- 새로운 API 생성 시 항상 Content-Type 헤더 포함
- 한글 데이터 처리 시 charset=utf-8 설정 필수

### 🔧 긴급 복구 절차
```powershell
# 1. 모든 Node.js 프로세스 종료
taskkill /f /im node.exe

# 2. Prisma 캐시 삭제
Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue

# 3. 데이터베이스 리셋
npx prisma migrate reset --force

# 4. Prisma 클라이언트 재생성
npx prisma generate

# 5. 서버 시작
npm run dev
```

### 10. React Native 네이티브 앱 개발 (2025년 9월 5일)
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

### 11. 어드민 네이티브 앱 개발 도구 (2025년 9월 5일)
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
- **API 엔드포인트**:
  - `/api/expo/status`: Expo 서버 상태 확인
  - `/api/expo/control`: Expo 서버 제어 (시작/중지/재시작)
  - `/api/expo/file-changes`: 파일 변경 감지
  - `/api/expo/git-status`: Git 상태 확인
  - `/api/expo/api-requests`: API 요청 모니터링
  - `/api/expo/api-stats`: API 통계
  - `/api/expo/files`: 파일 관리
- **실시간 모니터링**:
  - Metro Bundler 상태
  - 연결된 디바이스 정보
  - 성능 메트릭
  - 네트워크 요청/응답 로그

### 12. 백업 및 버전 관리 시스템 (2025년 9월 6일)
- **전체 시스템 백업**:
  - 웹 프로젝트 (sales-partner-landing) 완전 백업
  - 네이티브 앱 프로젝트 (sales-partner-mobile-app) 완전 백업
  - 데이터베이스 (Prisma 스키마, 마이그레이션, SQLite 파일)
  - 설정 파일 (package.json, tsconfig.json, 환경변수)
- **GitHub 푸시**:
  - 브랜치: feature/member-home-dark
  - 원격 저장소: https://github.com/psy8200/sales-partner-landing.git
  - 커밋: 네이티브 앱 개발 및 어드민 도구 완성
- **백업 통계**:
  - 총 파일 수: 51,251개
  - 백업 위치: C:\home\backup-2025-09-06_00-43-33\
  - 압축 파일: backup-2025-09-06_00-43-33.zip

## 🚧 현재 개발 중인 기능
- **네이티브 앱 테스트**: 실제 디바이스에서 앱 테스트
- **성능 최적화**: 네이티브 앱 성능 튜닝
- **UI/UX 개선**: 네이티브 앱 사용자 경험 향상
- **API 통합**: 웹과 네이티브 앱 간 데이터 동기화

## 📞 지원 및 문의
- **개발자**: AI Assistant
- **최종 업데이트**: 2025년 9월 6일
- **버전**: 2.0.0 (네이티브 앱 포함)
- **백업 상태**: ✅ 완료 (2025-09-06T00-43-33)
- **GitHub 상태**: ✅ 푸시 완료 (feature/member-home-dark)

---

**⚠️ 중요**: 이 가이드는 지속적으로 업데이트되며, 모든 변경사항은 이 문서에 반영됩니다.
