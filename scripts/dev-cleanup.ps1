# 개발 환경 정리 스크립트
# 이 스크립트는 개발 시작 전 환경을 정리합니다.

Write-Host "🧹 개발 환경 정리 시작..." -ForegroundColor Green

# 1. 모든 Node.js 프로세스 종료 (관리자 권한으로)
Write-Host "📋 Node.js 프로세스 정리 중..." -ForegroundColor Yellow
try {
    # 현재 사용자 프로세스만 종료
    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
    Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.StartInfo.UserName -eq $currentUser } | Stop-Process -Force
    Write-Host "✅ 사용자 Node.js 프로세스 정리 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Node.js 프로세스 종료 실패 (권한 문제)" -ForegroundColor Yellow
    Write-Host "수동으로 작업 관리자에서 Node.js 프로세스를 종료하세요" -ForegroundColor Yellow
}

# 2. Prisma 클라이언트 캐시 정리
Write-Host "📋 Prisma 클라이언트 캐시 정리 중..." -ForegroundColor Yellow
try {
    Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
    Write-Host "✅ Prisma 캐시 정리 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Prisma 캐시 정리 실패" -ForegroundColor Yellow
}

# 3. npm 캐시 정리
Write-Host "📋 npm 캐시 정리 중..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ npm 캐시 정리 완료" -ForegroundColor Green
} catch {
    Write-Host "⚠️  npm 캐시 정리 실패" -ForegroundColor Yellow
}

# 4. 포트 사용 상태 확인
Write-Host "📋 포트 사용 상태 확인 중..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr :3000
if ($port3000) {
    Write-Host "⚠️  포트 3000이 사용 중입니다:" -ForegroundColor Yellow
    Write-Host $port3000 -ForegroundColor Red
} else {
    Write-Host "✅ 포트 3000 사용 가능" -ForegroundColor Green
}

# 5. Prisma 클라이언트 재생성
Write-Host "📋 Prisma 클라이언트 재생성 중..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma 클라이언트 재생성 완료" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma 클라이언트 재생성 실패" -ForegroundColor Red
    Write-Host "수동으로 'npx prisma generate' 실행하세요" -ForegroundColor Yellow
}

Write-Host "🎉 개발 환경 정리 완료!" -ForegroundColor Green
Write-Host "이제 'npm run dev'로 개발 서버를 시작할 수 있습니다." -ForegroundColor Cyan
