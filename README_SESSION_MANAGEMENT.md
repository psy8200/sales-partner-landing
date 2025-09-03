# 🚀 어드민 세션 관리 시스템

## 📋 개요
어드민 접속을 지속적으로 유지하기 위한 자동화된 세션 관리 시스템입니다.

## ✨ 주요 기능

### 🔄 자동 세션 갱신
- **사용자 활동 감지**: 마우스, 키보드, 터치 등의 사용자 활동 시 자동 세션 갱신
- **주기적 갱신**: 30분마다 자동으로 세션 상태 확인 및 갱신
- **탭 전환 감지**: 브라우저 탭 전환 시 자동 세션 갱신

### ⚠️ 세션 만료 경고
- **사전 경고**: 세션 만료 5분 전 경고 모달 표시
- **원클릭 갱신**: 경고 모달에서 한 번의 클릭으로 세션 연장
- **자동 재설정**: 세션 갱신 후 새로운 경고 타이머 자동 설정

### 📊 실시간 상태 모니터링
- **연결 상태 표시**: 실시간 세션 연결 상태를 시각적으로 표시
- **상세 정보**: 클릭 시 세션 상태 상세 정보 확인 가능
- **수동 갱신**: 필요 시 수동으로 세션 갱신 가능

## 🛠️ 기술적 구현

### 📁 파일 구조
```
src/
├── components/
│   ├── AdminGuard.tsx          # 어드민 권한 보호 컴포넌트
│   └── SessionStatusIndicator.tsx  # 세션 상태 표시 컴포넌트
├── lib/
│   └── sessionManager.ts       # 세션 관리 유틸리티
└── app/
    └── admin/
        └── layout.tsx          # 어드민 레이아웃 (세션 표시기 포함)
```

### 🔧 핵심 클래스: SessionManager

#### 싱글톤 패턴
```typescript
const sessionManager = SessionManager.getInstance();
```

#### 주요 메서드
- `startSessionManagement()`: 세션 관리 시작
- `stopSessionManagement()`: 세션 관리 중지
- `checkSessionStatus()`: 현재 세션 상태 확인
- `manualRefresh()`: 수동 세션 갱신

### 🎯 사용자 활동 감지 이벤트
```typescript
const events = [
  'mousedown',    // 마우스 클릭
  'mousemove',    // 마우스 이동
  'keypress',     // 키보드 입력
  'scroll',       // 스크롤
  'touchstart',   // 터치
  'click'         // 클릭
];
```

## 🚀 사용법

### 1. 기본 사용 (자동)
```typescript
import { sessionManager } from '@/lib/sessionManager';

// 세션 관리 자동 시작
sessionManager.startSessionManagement();

// 컴포넌트 언마운트 시 정리
useEffect(() => {
  sessionManager.startSessionManagement();
  
  return () => {
    sessionManager.stopSessionManagement();
  };
}, []);
```

### 2. React 훅 사용
```typescript
import { useSessionManager } from '@/lib/sessionManager';

const { startSessionManagement, manualRefresh } = useSessionManager();

useEffect(() => {
  startSessionManagement();
}, [startSessionManagement]);

// 수동 갱신
const handleRefresh = async () => {
  await manualRefresh();
};
```

### 3. 컴포넌트에 세션 상태 표시기 추가
```tsx
import SessionStatusIndicator from '@/components/SessionStatusIndicator';

// 어드민 레이아웃에 추가
<SessionStatusIndicator className="ml-4" />
```

## 📱 UI 컴포넌트

### SessionStatusIndicator
- **연결됨**: 초록색 원형 표시
- **연결 끊김**: 빨간색 원형 표시
- **갱신 중**: 파란색 스피너 표시

### 세션 만료 경고 모달
- **경고 아이콘**: ⏰ 이모지
- **세션 연장 버튼**: 파란색 버튼으로 원클릭 갱신
- **닫기 버튼**: 경고 모달 닫기

## ⚙️ 설정 옵션

### 타이밍 설정
```typescript
// 주기적 갱신 간격 (기본: 30분)
private setupPeriodicRefresh(): void {
  this.sessionRefreshInterval = setInterval(async () => {
    await this.refreshSession();
  }, 30 * 60 * 1000);
}

// 경고 표시 타이밍 (기본: 25분 후)
private setupSessionWarning(): void {
  this.warningTimeout = setTimeout(() => {
    this.showSessionWarning();
  }, 25 * 60 * 1000);
}

// 사용자 활동 후 갱신 지연 (기본: 1초)
this.userActivityTimeout = setTimeout(async () => {
  await this.refreshSession();
}, 1000);
```

## 🔒 보안 고려사항

### 세션 토큰 관리
- HTTP-only 쿠키 사용으로 XSS 공격 방지
- SameSite=Lax 설정으로 CSRF 공격 방지
- 90일 만료 기간으로 장기간 작업 지원

### 권한 검증
- 매번 API 호출 시 어드민 권한 재확인
- 계정 상태(ACTIVE, isActive) 지속적 검증
- 세션 만료 시 자동 로그아웃 처리

## 🐛 문제 해결

### 세션이 자주 만료되는 경우
1. **브라우저 설정 확인**: 쿠키 차단 여부 확인
2. **네트워크 상태**: 인터넷 연결 상태 확인
3. **브라우저 탭**: 백그라운드 탭에서 세션 갱신 확인

### 자동 갱신이 작동하지 않는 경우
1. **콘솔 로그 확인**: 세션 관리 시작/중지 메시지 확인
2. **사용자 활동**: 마우스/키보드 활동으로 갱신 트리거
3. **수동 갱신**: 세션 상태 표시기에서 수동 갱신 시도

## 📈 성능 최적화

### 메모리 누수 방지
- 컴포넌트 언마운트 시 모든 타이머 정리
- 이벤트 리스너 적절한 정리
- 싱글톤 패턴으로 중복 인스턴스 방지

### 네트워크 최적화
- 사용자 활동 시 디바운싱으로 불필요한 API 호출 방지
- 주기적 갱신과 활동 기반 갱신의 균형
- 에러 발생 시 적절한 재시도 로직

## 🔮 향후 개선 계획

### 예정된 기능
- [ ] 세션 갱신 실패 시 자동 재시도
- [ ] 사용자별 세션 설정 커스터마이징
- [ ] 세션 활동 로그 기록
- [ ] 푸시 알림을 통한 세션 만료 경고

### 모니터링 강화
- [ ] 세션 갱신 성공률 통계
- [ ] 사용자 활동 패턴 분석
- [ ] 세션 만료 원인 분석

---

## 📞 지원

문제가 발생하거나 추가 기능이 필요한 경우 개발팀에 문의해주세요.

**개발팀**: sales-partner-dev@company.com  
**문서 버전**: 1.0.0  
**최종 업데이트**: 2025년 1월
