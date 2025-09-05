# 한글 인코딩 문제 해결 스크립트
# 사용법: .\scripts\fix-encoding-issue.ps1

Write-Host "🌏 한글 인코딩 문제 해결 스크립트 시작..." -ForegroundColor Green

# 1. 모든 Node.js 프로세스 종료
Write-Host "1️⃣ Node.js 프로세스 종료 중..." -ForegroundColor Yellow
try {
    taskkill /f /im node.exe 2>$null
    Write-Host "✅ Node.js 프로세스 종료 완료" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ 실행 중인 Node.js 프로세스가 없습니다." -ForegroundColor Blue
}

# 2. Prisma 캐시 삭제
Write-Host "2️⃣ Prisma 캐시 삭제 중..." -ForegroundColor Yellow
try {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    Write-Host "✅ Prisma 캐시 삭제 완료" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Prisma 캐시가 없습니다." -ForegroundColor Blue
}

# 3. 데이터베이스 리셋
Write-Host "3️⃣ 데이터베이스 리셋 중..." -ForegroundColor Yellow
try {
    npx prisma migrate reset --force
    Write-Host "✅ 데이터베이스 리셋 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ 데이터베이스 리셋 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Prisma 클라이언트 재생성
Write-Host "4️⃣ Prisma 클라이언트 재생성 중..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma 클라이언트 재생성 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma 클라이언트 재생성 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. 서버 시작
Write-Host "5️⃣ 개발 서버 시작 중..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-Command", "npm run dev" -WindowStyle Normal
    Write-Host "✅ 개발 서버 시작 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ 개발 서버 시작 실패: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 한글 인코딩 문제 해결 완료!" -ForegroundColor Green
Write-Host "📝 참고: API 엔드포인트에서 Content-Type 헤더에 charset=utf-8을 추가해야 합니다." -ForegroundColor Cyan
Write-Host "📖 자세한 내용은 TROUBLESHOOTING_GUIDE.md를 참고하세요." -ForegroundColor Cyan
