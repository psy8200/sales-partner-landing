# React Native 네이티브 앱 설계

## 📁 프로젝트 구조

```
SalesPartnerApp/
├── src/
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── common/          # 공통 컴포넌트
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── SafeAreaView.tsx
│   │   ├── forms/           # 폼 컴포넌트
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── ProfileForm.tsx
│   │   └── business/        # 비즈니스 로직 컴포넌트
│   │       ├── SummaryCard.tsx
│   │       ├── QuickActions.tsx
│   │       ├── InfoCards.tsx
│   │       └── RecentActivity.tsx
│   ├── screens/             # 화면 컴포넌트
│   │   ├── auth/           # 인증 관련 화면
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignupScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── main/           # 메인 앱 화면
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── BenefitsScreen.tsx
│   │   │   ├── SettlementScreen.tsx
│   │   │   ├── PartnerScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── modal/          # 모달 화면
│   │       ├── NotificationModal.tsx
│   │       └── SettingsModal.tsx
│   ├── navigation/          # 네비게이션 설정
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── types.ts
│   ├── services/            # API 및 서비스
│   │   ├── api/            # API 클라이언트
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── contracts.ts
│   │   │   └── settlements.ts
│   │   ├── storage/        # 로컬 스토리지
│   │   │   ├── AsyncStorage.ts
│   │   │   └── SecureStorage.ts
│   │   └── notifications/  # 푸시 알림
│   │       └── PushNotificationService.ts
│   ├── hooks/              # 커스텀 훅
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useStorage.ts
│   │   └── useNotifications.ts
│   ├── store/              # 상태 관리 (Zustand)
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── contractStore.ts
│   │   └── index.ts
│   ├── utils/              # 유틸리티 함수
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── constants.ts
│   │   └── helpers.ts
│   ├── types/              # TypeScript 타입 정의
│   │   ├── api.ts
│   │   ├── navigation.ts
│   │   ├── user.ts
│   │   └── contract.ts
│   └── styles/             # 스타일 정의
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       └── theme.ts
├── assets/                 # 이미지, 폰트 등
│   ├── images/
│   ├── icons/
│   └── fonts/
├── android/               # Android 네이티브 코드
├── ios/                   # iOS 네이티브 코드
└── package.json
```

## 🎨 2. 네이티브 UI/UX 설계

### 주요 화면 구성
1. **인증 화면**: 로그인, 회원가입, 비밀번호 찾기
2. **메인 대시보드**: 요약 카드, 빠른 액션, 최근 활동
3. **혜택 화면**: 등급별 혜택, 포인트 내역
4. **정산 화면**: 정산 내역, 수당 관리
5. **파트너 화면**: 파트너 정보, 추천 관리
6. **프로필 화면**: 개인정보, 설정

### 네이티브 최적화 요소
- **하단 탭 네비게이션**: iOS/Android 표준 패턴
- **풀스크린 모달**: 중요한 액션에 사용
- **스와이프 제스처**: 카드 간 이동, 새로고침
- **풀투리프레시**: 데이터 새로고침
- **하단 시트**: 추가 옵션 표시
- **푸시 알림**: 중요한 업데이트 알림

## 🔌 3. API 통합 설계

### 기존 API 엔드포인트 활용
- `/api/auth/member-login` - 회원 로그인
- `/api/auth/me` - 사용자 정보 조회
- `/api/mypage/stats` - 통계 정보
- `/api/mypage/activities` - 활동 내역
- `/api/points/summary` - 포인트 요약

### 네이티브 최적화
- **토큰 기반 인증**: JWT 토큰을 SecureStorage에 저장
- **자동 토큰 갱신**: 만료 전 자동 갱신
- **오프라인 지원**: 캐시된 데이터 표시
- **백그라운드 동기화**: 앱 백그라운드에서 데이터 동기화

## 📱 4. 네비게이션 구조

### 탭 네비게이션 (메인)
- 홈 (Home)
- 혜택 (Benefits) 
- 정산 (Settlement)
- 파트너 (Partner)
- 전체 (More)

### 스택 네비게이션 (세부 화면)
- 각 탭 내에서 세부 화면으로 이동
- 모달 형태의 추가 기능
- 딥링크 지원

## 🎯 5. 상태 관리

### Zustand 스토어 구조
- **authStore**: 인증 상태, 사용자 정보
- **userStore**: 사용자 프로필, 설정
- **contractStore**: 계약 정보, 정산 데이터
- **notificationStore**: 알림 상태

## 🔒 6. 보안 고려사항

- **SecureStorage**: 민감한 정보 암호화 저장
- **Certificate Pinning**: API 통신 보안
- **Biometric Auth**: 생체 인증 지원
- **App State Protection**: 백그라운드에서 앱 보호
