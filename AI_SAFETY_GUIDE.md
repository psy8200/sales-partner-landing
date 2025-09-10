# 🛡️ AI 안전 시스템 사용 가이드

## 개요
이 시스템은 AI가 임의로 위험한 작업을 수행하는 것을 방지하고, 사용자의 명시적 지시가 있을 때만 작업을 실행하도록 보장합니다.

## 🚫 차단되는 작업들

### 1. 데이터베이스 관련
- `npx prisma db push --force-reset`
- `npx prisma migrate reset`
- `node seed.js`
- `npm run prisma:reset`

### 2. 파일 시스템 관련
- `rm -rf`
- `del /s /q`
- `npm run dev:clean`

### 3. 임의 작업
- 데이터베이스 초기화
- 시드 데이터 실행
- 파일 삭제
- 시스템 정리
- 자동 수정
- 추론 기반 작업

## ✅ 허용되는 작업들

### 1. 안전한 작업
- 파일 읽기
- 코드 분석
- 정보 조회
- 로그 확인

### 2. 사용자 지시 작업
- 명시적으로 요청된 작업
- 확인된 작업
- 승인된 작업

## 🔧 사용법

### 1. 시스템 초기화
```typescript
import { aiSafetySystem } from './scripts/ai-safety-system';

// 시스템 초기화
aiSafetySystem.initialize();
```

### 2. 안전한 작업 실행
```typescript
const workRequest: WorkRequest = {
  action: 'file_read',
  command: 'cat package.json',
  description: 'package.json 파일 읽기',
  riskLevel: 'LOW',
  requiresConfirmation: false
};

const canExecute = await aiSafetySystem.executeSafeWork(workRequest);
```

### 3. 사용자 지시 기록
```typescript
// 사용자가 명시적으로 지시한 작업 기록
aiSafetySystem.recordUserInstruction('데이터베이스 초기화 실행');
```

## 🚨 위험 작업 실행 방법

### 1. 사용자 확인 필요
```typescript
const dangerousWork: WorkRequest = {
  action: 'database_reset',
  command: 'npx prisma db push --force-reset',
  description: '데이터베이스 초기화',
  riskLevel: 'CRITICAL',
  requiresConfirmation: true
};

// 사용자 확인 후 실행
const canExecute = await aiSafetySystem.executeSafeWork(dangerousWork);
```

### 2. 응급 상황 (관리자만)
```typescript
// 응급 상황에서만 사용
const emergency = aiSafetySystem.emergencyOverride(
  'database_reset',
  '시스템 복구 필요'
);
```

## 📊 시스템 상태 확인

```typescript
const status = aiSafetySystem.getSystemStatus();
console.log(status);
```

## 🎯 핵심 원칙

1. **사용자 지시 우선**: 사용자의 명시적 지시가 있을 때만 작업 실행
2. **안전 검증**: 모든 작업은 안전 검증을 거쳐야 함
3. **임의 작업 금지**: AI가 임의로 추론하여 작업하지 않음
4. **투명성**: 모든 작업은 사용자에게 투명하게 공개
5. **복구 가능**: 실수 시 복구 가능한 안전장치

## ⚠️ 주의사항

- 이 시스템은 AI의 자율적 작업을 제한합니다
- 모든 위험 작업은 사용자 확인이 필요합니다
- 응급 상황에서만 관리자 명령어를 사용하세요
- 시스템을 비활성화하지 마세요

## 🔄 업데이트

시스템은 지속적으로 업데이트되어 더 많은 위험 작업을 차단합니다.




