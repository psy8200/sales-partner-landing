import { NextRequest } from 'next/server';
import { WebSocketServer } from 'ws';

// WebSocket 서버 인스턴스 (싱글톤)
let wss: WebSocketServer | null = null;
const clients = new Set<any>();

export async function GET(request: NextRequest) {
  if (!wss) {
    wss = new WebSocketServer({ port: 8080 });
    
    wss.on('connection', (ws) => {
      console.log('Expo 개발 도구 WebSocket 연결됨');
      clients.add(ws);
      
      // Expo Metro bundler와의 연결 설정
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          console.log('Expo 메시지 수신:', message);
          
          // 모든 클라이언트에게 메시지 브로드캐스트
          clients.forEach(client => {
            if (client.readyState === 1) { // WebSocket.OPEN
              client.send(JSON.stringify(message));
            }
          });
        } catch (error) {
          console.error('WebSocket 메시지 파싱 오류:', error);
        }
      });
      
      ws.on('close', () => {
        console.log('Expo 개발 도구 WebSocket 연결 해제됨');
        clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('WebSocket 오류:', error);
        clients.delete(ws);
      });
    });
  }
  
  return new Response(JSON.stringify({ 
    status: 'WebSocket server running on port 8080',
    connectedClients: clients.size 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Expo Metro bundler 상태 확인
export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'check-expo-status':
        // Expo 개발 서버 상태 확인
        const expoStatus = await checkExpoServerStatus();
        return new Response(JSON.stringify(expoStatus));
        
      case 'trigger-reload':
        // Hot Reload 트리거
        await triggerHotReload();
        return new Response(JSON.stringify({ success: true }));
        
      case 'get-build-logs':
        // 빌드 로그 가져오기
        const logs = await getBuildLogs();
        return new Response(JSON.stringify({ logs }));
        
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}

// Expo 서버 상태 확인
async function checkExpoServerStatus() {
  try {
    const response = await fetch('http://localhost:8081/status');
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'running',
        port: 8081,
        data
      };
    }
  } catch (error) {
    // Expo 서버가 실행되지 않은 경우
  }
  
  return {
    status: 'stopped',
    port: 8081,
    error: 'Expo development server is not running'
  };
}

// Hot Reload 트리거
async function triggerHotReload() {
  try {
    // Expo Metro bundler에 Hot Reload 신호 전송
    const response = await fetch('http://localhost:8081/reload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reload: true })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Hot Reload 트리거 실패:', error);
    return false;
  }
}

// 빌드 로그 가져오기
async function getBuildLogs() {
  try {
    const response = await fetch('http://localhost:8081/logs');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('빌드 로그 가져오기 실패:', error);
  }
  
  return [];
}
