import { NextRequest, NextResponse } from 'next/server';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    switch (action) {
      case 'start':
        return await startExpoServer();
      case 'stop':
        return await stopExpoServer();
      case 'restart':
        return await restartExpoServer();
      case 'build':
        return await buildApp();
      case 'hot-reload':
        return await triggerHotReload();
      case 'open-browser':
        return await openInBrowser();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Expo 서버 시작
async function startExpoServer() {
  try {
    console.log('Expo 서버 시작 시도...');
    
    // 먼저 기존 프로세스가 있는지 확인하고 정리
    try {
      await execAsync('taskkill /f /im node.exe /fi "WINDOWTITLE eq *expo*"');
    } catch (cleanupError) {
      console.log('기존 프로세스 정리 완료 또는 없음');
    }

    // PowerShell을 사용하여 백그라운드에서 실행 (올바른 옵션 사용)
    const command = `powershell -Command "Start-Process -FilePath 'npx' -ArgumentList 'expo', 'start', '--port', '8081', '--web' -WorkingDirectory 'C:\\home\\sales-partner-mobile-app\\SalesPartnerApp' -WindowStyle Hidden -Environment @{CI='1'}"`;
    
    await execAsync(command);
    
    console.log('Expo 서버 시작 명령어 실행 완료');

    return NextResponse.json({
      success: true,
      message: 'Expo 서버가 시작되었습니다.',
      status: 'starting'
    });
  } catch (error) {
    console.error('Expo 서버 시작 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start Expo server',
    });
  }
}

// Expo 서버 중지
async function stopExpoServer() {
  try {
    console.log('Expo 서버 중지 시도...');
    
    // 방법 1: Expo CLI를 통한 안전한 중지
    try {
      const command = 'cd C:\\home\\sales-partner-mobile-app\\SalesPartnerApp && npx expo stop';
      await execAsync(command);
      console.log('Expo stop 명령어로 중지 완료');
    } catch (stopError) {
      console.log('Expo stop 명령어 실패, 대체 방법 시도...');
      
      // 방법 2: 특정 포트의 프로세스만 중지
      try {
        const killCommand = 'powershell "Get-NetTCPConnection -LocalPort 8081,19006 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"';
        await execAsync(killCommand);
        console.log('포트 기반 프로세스 중지 완료');
      } catch (killError) {
        console.log('포트 기반 프로세스 중지도 실패, 강제 중지 시도...');
        
        // 방법 3: 강제 중지
        try {
          await execAsync('taskkill /f /im node.exe');
          console.log('모든 node 프로세스 강제 중지 완료');
        } catch (forceError) {
          console.log('강제 중지도 실패했습니다.');
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Expo 서버가 중지되었습니다.',
      status: 'stopped'
    });
  } catch (error) {
    console.error('Expo 서버 중지 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop Expo server',
    });
  }
}

// Expo 서버 재시작
async function restartExpoServer() {
  try {
    console.log('Expo 서버 재시작 시도...');
    
    // 먼저 중지
    console.log('1단계: 서버 중지 중...');
    await stopExpoServer();
    
    // 잠시 대기
    console.log('2단계: 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 다시 시작
    console.log('3단계: 서버 시작 중...');
    await startExpoServer();
    
    return NextResponse.json({
      success: true,
      message: 'Expo 서버가 재시작되었습니다.',
      status: 'restarting'
    });
  } catch (error) {
    console.error('Expo 서버 재시작 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to restart Expo server',
    });
  }
}

// 앱 빌드
async function buildApp() {
  try {
    const command = 'cd C:\\home\\sales-partner-mobile-app\\SalesPartnerApp && npm run build';
    
    const { stdout, stderr } = await execAsync(command);
    
    return NextResponse.json({
      success: true,
      message: '앱 빌드가 완료되었습니다.',
      output: stdout,
      error: stderr
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to build app',
    });
  }
}

// Hot Reload 트리거
async function triggerHotReload() {
  try {
    // Metro bundler에 Hot Reload 신호 전송
    const response = await fetch('http://localhost:8081/reload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Hot Reload가 트리거되었습니다.',
        status: 'reloaded'
      });
    } else {
      throw new Error(`Metro bundler 응답 오류: ${response.status}`);
    }
  } catch (error) {
    // Metro bundler가 실행되지 않은 경우 대체 방법
    console.log('Metro bundler 직접 접근 실패, 대체 방법 시도...');
    
    try {
      // Expo CLI를 통한 Hot Reload
      const command = 'cd C:\\home\\sales-partner-mobile-app\\SalesPartnerApp && npx expo r';
      await execAsync(command);
      
      return NextResponse.json({
        success: true,
        message: 'Hot Reload가 트리거되었습니다. (대체 방법)',
        status: 'reloaded'
      });
    } catch (fallbackError) {
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger hot reload',
        fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Fallback method also failed'
      });
    }
  }
}

// 브라우저에서 열기
async function openInBrowser() {
  try {
    console.log('브라우저에서 Expo 서버 열기 시도...');
    
    // 기본 브라우저에서 Expo 서버 열기
    const command = 'start http://localhost:19006';
    await execAsync(command);
    
    console.log('브라우저에서 Expo 서버 열기 완료');
    
    return NextResponse.json({
      success: true,
      message: '브라우저에서 Expo 서버가 열렸습니다.',
      url: 'http://localhost:19006'
    });
  } catch (error) {
    console.error('브라우저 열기 실패:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to open browser',
    });
  }
}
