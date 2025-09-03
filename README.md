# Sales Partner Landing

## 🚀 근본적 문제 해결 방안

### 🔧 Prisma 클라이언트 동기화 문제 해결

#### **문제점**
- `Unknown field 'referralCode'` 오류 발생
- Prisma 스키마와 클라이언트 간 동기화 실패
- Windows 환경에서 파일 권한 문제

#### **해결 방안**

##### **1. 자동화된 헬스체크 및 복구**
```bash
# Prisma 클라이언트 상태 확인 및 자동 복구
npm run prisma:health
```

##### **2. 개발 환경 최적화**
```bash
# 개발 서버 시작 (자동 Prisma 클라이언트 생성)
npm run dev

# Prisma 클라이언트 강제 재생성
npm run prisma:reset

# 데이터베이스 스키마 동기화
npm run prisma:sync
```

##### **3. 개선된 Prisma 클라이언트 관리**
- **싱글톤 패턴**: 메모리 효율성 및 연결 안정성
- **자동 연결 테스트**: 클라이언트 생성 시 연결 상태 확인
- **안전한 쿼리 래퍼**: `safePrismaQuery` 함수로 에러 핸들링 강화
- **스키마 검증**: `validatePrismaSchema` 함수로 필드 존재 확인

#### **새로운 스크립트**

| 스크립트 | 설명 |
|---------|------|
| `npm run prisma:health` | Prisma 클라이언트 상태 확인 및 자동 복구 |
| `npm run prisma:reset` | Node.js 프로세스 종료 → Prisma 재생성 → 서버 재시작 |
| `npm run prisma:sync` | 데이터베이스 스키마 동기화 및 클라이언트 재생성 |

#### **개선된 API 구조**

##### **안전한 Prisma 쿼리 사용**
```typescript
// 기존 방식
const user = await prisma.user.findUnique({...});

// 개선된 방식
const user = await safePrismaQuery(async () => {
  return await prisma.user.findUnique({...});
});
```

##### **스키마 검증**
```typescript
// API 시작 시 스키마 검증
const schemaValid = await validatePrismaSchema();
if (!schemaValid) {
  return NextResponse.json({ error: "시스템 오류" }, { status: 500 });
}
```

### 🛡️ 예방적 조치

#### **1. 개발 서버 시작 시 자동 검증**
- `npm run dev` 실행 시 자동으로 `prisma generate` 실행
- 스키마 변경사항 자동 반영

#### **2. 에러 핸들링 강화**
- 스키마 동기화 문제 감지 시 자동 복구 시도
- 상세한 에러 로깅 및 사용자 친화적 메시지

#### **3. 모니터링 및 알림**
- Prisma 클라이언트 상태 실시간 모니터링
- 문제 발생 시 즉시 알림 및 복구 시도

### 📋 사용 가이드

#### **일반적인 개발 워크플로우**
1. **개발 서버 시작**: `npm run dev`
2. **스키마 변경 시**: `npm run prisma:sync`
3. **문제 발생 시**: `npm run prisma:health`
4. **강제 재시작**: `npm run prisma:reset`

#### **문제 해결 순서**
1. `npm run prisma:health` 실행
2. 문제 발견 시 자동 복구 시도
3. 복구 실패 시 `npm run prisma:reset` 실행
4. 여전히 문제가 있으면 수동으로 `taskkill /f /im node.exe` 후 `npm run dev`

### 🔍 모니터링

#### **터미널 로그 확인**
- `✅ Prisma Client 연결 성공`
- `✅ referralCode 필드 확인 성공`
- `✅ Prisma 스키마 검증 성공`

#### **문제 발생 시 로그**
- `❌ Prisma 클라이언트 상태 확인 실패`
- `🔄 스키마 동기화 문제 감지, Prisma 클라이언트 재생성 시도...`

이제 Prisma 클라이언트 동기화 문제가 근본적으로 해결되었으며, 앞으로 이런 문제가 발생하지 않도록 예방적 조치가 마련되었습니다.

---

## 기존 README 내용...

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
