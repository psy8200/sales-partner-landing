import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'status';
    
    switch (action) {
      case 'status':
        return await getExpoStatus();
      case 'logs':
        return await getExpoLogs();
      case 'devices':
        return await getConnectedDevices();
      case 'performance':
        return await getPerformanceMetrics();
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

// Expo 개발 서버 상태 확인
async function getExpoStatus() {
  try {
    // Metro bundler 상태 확인 - 실제 웹 페이지에 접근해서 확인
    const metroResponse = await fetch('http://localhost:8081', {
      timeout: 5000,
      method: 'HEAD' // HEAD 요청으로 빠르게 상태만 확인
    });
    
    if (metroResponse.ok) {
      // Expo 웹 서버 상태 확인
      const expoWebResponse = await fetch('http://localhost:8081', {
        timeout: 5000,
        method: 'HEAD'
      });
      
      return NextResponse.json({
        status: 'running',
        metro: {
          port: 8081,
          status: 'running',
          url: 'http://localhost:8081',
          message: 'Metro bundler is running'
        },
        expo: {
          port: 8081,
          status: expoWebResponse.ok ? 'running' : 'stopped',
          url: 'http://localhost:8081',
          message: expoWebResponse.ok ? 'Expo web server is running' : 'Expo web server is not responding'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.log('Metro bundler 상태 확인 실패:', error);
  }
  
  return NextResponse.json({
    status: 'stopped',
    metro: {
      port: 8081,
      status: 'stopped',
      error: 'Metro bundler is not running'
    },
    expo: {
      port: 8081,
      status: 'stopped',
      error: 'Expo development server is not running'
    },
    timestamp: new Date().toISOString()
  });
}

// Expo 빌드 로그 가져오기
async function getExpoLogs() {
  try {
    // Metro bundler가 실행 중인지 확인
    const response = await fetch('http://localhost:8081', {
      timeout: 5000,
      method: 'HEAD'
    });
    
    if (response.ok) {
      // Metro bundler가 실행 중이면 더미 로그 반환
      const dummyLogs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Metro bundler is running',
          source: 'metro'
        },
        {
          timestamp: new Date(Date.now() - 1000).toISOString(),
          level: 'info',
          message: 'Expo web server started',
          source: 'expo'
        },
        {
          timestamp: new Date(Date.now() - 2000).toISOString(),
          level: 'info',
          message: 'Bundle compiled successfully',
          source: 'metro'
        }
      ];
      
      return NextResponse.json({
        success: true,
        logs: dummyLogs,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Expo 로그 가져오기 실패:', error);
  }
  
  return NextResponse.json({
    success: false,
    logs: [],
    error: 'Metro bundler is not running',
    timestamp: new Date().toISOString()
  });
}

// 연결된 디바이스 정보
async function getConnectedDevices() {
  try {
    // Metro bundler가 실행 중인지 확인
    const response = await fetch('http://localhost:8081', {
      timeout: 5000,
      method: 'HEAD'
    });
    
    if (response.ok) {
      // Metro bundler가 실행 중이면 더미 디바이스 정보 반환
      const dummyDevices = [
        {
          id: 'web-browser',
          name: 'Web Browser',
          type: 'web',
          platform: 'web',
          status: 'connected',
          lastSeen: new Date().toISOString()
        },
        {
          id: 'expo-go',
          name: 'Expo Go (QR Code)',
          type: 'mobile',
          platform: 'expo',
          status: 'available',
          lastSeen: new Date().toISOString()
        }
      ];
      
      return NextResponse.json({
        success: true,
        devices: dummyDevices,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('디바이스 정보 가져오기 실패:', error);
  }
  
  return NextResponse.json({
    success: false,
    devices: [],
    error: 'Metro bundler is not running',
    timestamp: new Date().toISOString()
  });
}

// 성능 메트릭
async function getPerformanceMetrics() {
  try {
    // Metro bundler가 실행 중인지 확인
    const response = await fetch('http://localhost:8081', {
      timeout: 5000,
      method: 'HEAD'
    });
    
    if (response.ok) {
      // Metro bundler가 실행 중이면 더미 성능 메트릭 반환
      const dummyMetrics = {
        bundleSize: 2.4, // MB
        buildTime: 1.2, // seconds
        memoryUsage: 45.6, // MB
        cpuUsage: 12.3, // %
        uptime: Math.floor((Date.now() - (Date.now() - 300000)) / 1000), // 5분 전부터 실행 중
        requestsPerMinute: 15,
        averageResponseTime: 120 // ms
      };
      
      return NextResponse.json({
        success: true,
        metrics: dummyMetrics,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('성능 메트릭 가져오기 실패:', error);
  }
  
  return NextResponse.json({
    success: false,
    metrics: {
      bundleSize: 0,
      buildTime: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      uptime: 0,
      requestsPerMinute: 0,
      averageResponseTime: 0
    },
    error: 'Metro bundler is not running',
    timestamp: new Date().toISOString()
  });
}
