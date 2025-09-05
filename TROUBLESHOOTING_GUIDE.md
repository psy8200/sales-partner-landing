# 🔧 문제해결 가이드 (Troubleshooting Guide)

## 📋 목차
1. [한글 인코딩 문제](#한글-인코딩-문제)
2. [권한 문제 (EPERM)](#권한-문제-eperm)
3. [데이터베이스 연결 문제](#데이터베이스-연결-문제)
4. [서버 시작 문제](#서버-시작-문제)

---

## 🌏 한글 인코딩 문제

### 🚨 증상
- API 응답에서 한글이 `???` 또는 깨진 문자로 표시
- 데이터베이스에는 정상 저장되지만 웹에서 표시 안됨
- PowerShell에서 API 호출 시 한글 깨짐

### 🔍 원인 분석
- API 응답 헤더에 `charset=utf-8`이 명시되지 않음
- NextResponse.json()에서 Content-Type 헤더 누락

### ✅ 해결 방법

#### 1단계: API 엔드포인트 수정
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

#### 2단계: 모든 API 응답에 적용
- GET 응답
- POST 응답
- PUT 응답
- DELETE 응답

#### 3단계: 테스트
```powershell
# PowerShell에서 테스트
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/admin/company-info" -Method GET
$response.Content
```

### 📁 수정해야 할 파일들
- `src/app/api/admin/company-info/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/contracts/route.ts`
- 기타 모든 API 엔드포인트

### 🎯 예방 방법
- 새로운 API 엔드포인트 생성 시 항상 Content-Type 헤더 포함
- 한글 데이터를 다루는 모든 API에 charset=utf-8 설정

---

## 🔒 권한 문제 (EPERM)

### 🚨 증상
```
EPERM: operation not permitted, rename 'C:\home\sales-partner-landing\node_modules\.prisma\client\query_engine-windows.dll.node.tmpXXXXX'
```

### ✅ 해결 방법

#### 방법 1: 관리자 권한으로 프로세스 종료
```powershell
# 관리자 권한으로 PowerShell 실행 후
taskkill /f /im node.exe
```

#### 방법 2: Prisma 캐시 삭제
```powershell
Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
npx prisma generate
```

#### 방법 3: 개발 환경 정리
```powershell
# scripts/dev-cleanup.ps1 실행
.\scripts\dev-cleanup.ps1
```

---

## 🗄️ 데이터베이스 연결 문제

### 🚨 증상
- `DATABASE_URL` not found
- Prisma Client 연결 실패

### ✅ 해결 방법

#### 1단계: .env 파일 확인
```bash
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="dev-jwt-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-nextauth-secret"
NODE_ENV="development"
```

#### 2단계: 데이터베이스 초기화
```bash
npx prisma migrate reset --force
npx prisma generate
```

---

## 🚀 서버 시작 문제

### 🚨 증상
- 포트 3000이 이미 사용 중
- 서버가 시작되지 않음

### ✅ 해결 방법

#### 1단계: 포트 사용 프로세스 확인
```powershell
netstat -ano | findstr :3000
```

#### 2단계: 프로세스 종료
```powershell
taskkill /PID [PID번호] /F
```

#### 3단계: 서버 재시작
```bash
npm run dev
```

---

## 📞 긴급 복구 절차

### 🆘 모든 것이 망가졌을 때
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

---

## 📝 문제 보고 템플릿

새로운 문제가 발생했을 때 다음 정보를 포함하여 보고하세요:

```
## 문제 상황
- 발생 시간: 
- 작업 중이던 기능: 
- 오류 메시지: 

## 환경 정보
- OS: Windows 10/11
- Node.js 버전: 
- npm 버전: 
- 브라우저: 

## 재현 단계
1. 
2. 
3. 

## 예상 결과
- 

## 실제 결과
- 

## 추가 정보
- 스크린샷: 
- 로그 파일: 
```

---

## 🔄 정기 점검 항목

### 매일 확인
- [ ] 서버 정상 시작 여부
- [ ] 데이터베이스 연결 상태
- [ ] API 응답 정상 여부

### 주간 확인
- [ ] 백업 시스템 동작
- [ ] 로그 파일 크기
- [ ] 의존성 패키지 업데이트

### 월간 확인
- [ ] 보안 업데이트
- [ ] 성능 최적화
- [ ] 코드 리팩토링
