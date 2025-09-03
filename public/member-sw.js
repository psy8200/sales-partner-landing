const CACHE_NAME = 'member-pwa-v1';
const STATIC_CACHE = 'member-static-v1';
const DYNAMIC_CACHE = 'member-dynamic-v1';

// 캐시할 정적 리소스
const STATIC_URLS = [
  '/',
  '/mypage',
  '/manifest.json',
  '/member-manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/screenshot-member-mobile.png'
];

// 캐시할 API 엔드포인트
const API_CACHE_URLS = [
  '/api/auth/me',
  '/api/mypage/stats',
  '/api/mypage/activities'
];

// Service Worker 설치
self.addEventListener('install', (event) => {
  console.log('🔄 Member PWA Service Worker 설치 중...');
  
  event.waitUntil(
    Promise.all([
      // 정적 리소스 캐시
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 정적 리소스 캐시 중...');
        return cache.addAll(STATIC_URLS);
      }),
      // 동적 캐시 초기화
      caches.open(DYNAMIC_CACHE)
    ]).then(() => {
      console.log('✅ Member PWA Service Worker 설치 완료');
      return self.skipWaiting();
    })
  );
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  console.log('🚀 Member PWA Service Worker 활성화 중...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 오래된 캐시 삭제
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ 오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Member PWA Service Worker 활성화 완료');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 요청 처리
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 정적 리소스 처리
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// API 요청 처리 함수
async function handleApiRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    // 네트워크 우선 전략
    const networkResponse = await fetch(request);
    
    // 성공적인 응답만 캐시
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 네트워크 오류, 캐시에서 복구 시도:', error);
    
    // 캐시에서 응답 찾기
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 오프라인 응답
    return new Response(
      JSON.stringify({ 
        error: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
        offline: true 
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 정적 리소스 처리 함수
async function handleStaticRequest(request) {
  const staticCache = await caches.open(STATIC_CACHE);
  
  // 캐시에서 먼저 찾기
  const cachedResponse = await staticCache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // 네트워크에서 가져오기
    const networkResponse = await fetch(request);
    
    // 성공적인 응답만 캐시
    if (networkResponse.ok) {
      staticCache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 정적 리소스 네트워크 오류:', error);
    
    // 오프라인 페이지 반환
    if (request.destination === 'document') {
      return staticCache.match('/offline.html') || 
             new Response('오프라인 상태입니다.', { status: 503 });
    }
    
    return new Response('리소스를 찾을 수 없습니다.', { status: 404 });
  }
}

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 백그라운드 동기화 시작');
    event.waitUntil(doBackgroundSync());
  }
});

// 백그라운드 동기화 작업
async function doBackgroundSync() {
  try {
    // 오프라인 중에 저장된 데이터 동기화
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/')) {
        try {
          await fetch(request);
          console.log('✅ 백그라운드 동기화 성공:', request.url);
        } catch (error) {
          console.log('❌ 백그라운드 동기화 실패:', request.url, error);
        }
      }
    }
    
    console.log('✅ 백그라운드 동기화 완료');
  } catch (error) {
    console.error('❌ 백그라운드 동기화 오류:', error);
  }
}

// 푸시 알림 처리
self.addEventListener('push', (event) => {
  console.log('📱 푸시 알림 수신:', event);
  
  const options = {
    body: event.data ? event.data.text() : '새로운 알림이 있습니다.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '확인하기',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: '닫기',
        icon: '/icon-192x192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('파트너센터', options)
  );
});

// 알림 클릭 처리
self.addEventListener('notificationclick', (event) => {
  console.log('📱 알림 클릭:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/mypage')
    );
  }
});




