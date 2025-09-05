# 📱 Sales Partner React Native App

기존 웹 회원페이지를 기반으로 설계된 React Native 네이티브 앱입니다.

## 🎯 주요 특징

### ✨ 네이티브 최적화
- **하단 탭 네비게이션**: iOS/Android 표준 패턴
- **풀스크린 모달**: 중요한 액션에 사용
- **스와이프 제스처**: 카드 간 이동, 새로고침
- **풀투리프레시**: 데이터 새로고침
- **하단 시트**: 추가 옵션 표시
- **푸시 알림**: 중요한 업데이트 알림

### 🔌 API 통합
- 기존 웹 API 엔드포인트 그대로 활용
- JWT 토큰 기반 인증
- 자동 토큰 갱신
- 오프라인 지원 (캐시된 데이터)
- 백그라운드 동기화

### 🎨 UI/UX 설계
- **모바일 퍼스트**: 터치 친화적 인터페이스
- **다크모드 지원**: 시스템 설정 연동
- **접근성**: 스크린 리더 지원
- **성능 최적화**: 지연 로딩, 이미지 최적화

## 🏗️ 아키텍처

### 폴더 구조
```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
├── screens/            # 화면 컴포넌트
├── navigation/         # 네비게이션 설정
├── services/           # API 및 서비스
├── hooks/              # 커스텀 훅
├── store/              # 상태 관리 (Zustand)
├── utils/              # 유틸리티 함수
├── types/              # TypeScript 타입 정의
└── styles/             # 스타일 정의
```

### 주요 컴포넌트
- **SummaryCard**: 잔액, 지출, 대기 건수 표시
- **QuickActions**: 빠른 액션 버튼들
- **InfoCards**: 사용자 정보 카드
- **RecentActivity**: 최근 활동 내역
- **AppBar**: 상단 앱바 (알림, 테마 토글)

### 네비게이션 구조
- **하단 탭**: 홈, 혜택, 정산, 파트너, 전체
- **스택 네비게이션**: 각 탭 내 세부 화면
- **모달**: 알림, 설정 등

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
# 또는
yarn install
```

### 2. 환경 설정
```bash
# API 베이스 URL 설정
cp .env.example .env
```

### 3. 앱 실행
```bash
# 개발 서버 시작
npm start

# iOS 시뮬레이터에서 실행
npm run ios

# Android 에뮬레이터에서 실행
npm run android
```

## 🔧 주요 기능

### 인증 시스템
- 전화번호/비밀번호 로그인
- 자동 로그인 (토큰 기반)
- 생체 인증 지원
- 보안 토큰 저장

### 대시보드
- 실시간 잔액 표시
- 월별 지출 통계
- 대기 중인 건수
- 최근 활동 내역

### 빠른 액션
- 정산 관리
- 수당 내역
- 계정 설정
- 보안 설정
- 파트너 관리
- 고객 문의
- 혜택 확인

### 데이터 동기화
- 실시간 데이터 업데이트
- 오프라인 캐시
- 백그라운드 동기화
- 충돌 해결

## 📱 플랫폼별 최적화

### iOS
- Safe Area 지원
- iOS 스타일 네비게이션
- Haptic Feedback
- Face ID/Touch ID

### Android
- Material Design 3
- Android 스타일 네비게이션
- 백 버튼 처리
- 지문 인증

## 🔒 보안

- **SecureStorage**: 민감한 정보 암호화 저장
- **Certificate Pinning**: API 통신 보안
- **Biometric Auth**: 생체 인증 지원
- **App State Protection**: 백그라운드에서 앱 보호

## 🧪 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

## 📦 빌드

```bash
# Android APK 빌드
npm run build:android

# iOS IPA 빌드
npm run build:ios
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 지원

문제가 있으시면 이슈를 생성해주세요.
