// 푸시 알림 서비스
// PWA 푸시 알림 관리 및 VAPID 키 설정

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
}

class PushNotificationService {
  private vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI0F8jVvJw4-8X4VWXKrf4A0x2uoqjcrkRDHwkJ8plWBPVQpXrQjfQz4'; // 실제 VAPID 키로 교체 필요
  private isSupported: boolean = false;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // 푸시 알림 지원 여부 확인
  isPushSupported(): boolean {
    return this.isSupported;
  }

  // Service Worker 등록
  async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!this.isSupported) {
      throw new Error('푸시 알림을 지원하지 않는 브라우저입니다.');
    }

    try {
      // this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker 등록 성공 (Service Worker 비활성화됨)');
      // return this.registration;
      return null; // Service Worker 비활성화로 인해 null 반환
    } catch (error) {
      console.error('Service Worker 등록 실패:', error);
      throw error;
    }
  }

  // 푸시 알림 권한 요청
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('푸시 알림을 지원하지 않는 브라우저입니다.');
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('푸시 알림 권한:', permission);
      return permission;
    } catch (error) {
      console.error('푸시 알림 권한 요청 실패:', error);
      throw error;
    }
  }

  // 푸시 구독 생성
  async subscribeToPush(): Promise<PushSubscription> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      throw new Error('Service Worker 등록에 실패했습니다.');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('푸시 구독 성공:', subscription);
      return subscription;
    } catch (error) {
      console.error('푸시 구독 실패:', error);
      throw error;
    }
  }

  // 푸시 구독 해제
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        const result = await subscription.unsubscribe();
        console.log('푸시 구독 해제:', result);
        return result;
      }
      return true;
    } catch (error) {
      console.error('푸시 구독 해제 실패:', error);
      throw error;
    }
  }

  // 현재 푸시 구독 상태 확인
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('푸시 구독 상태 확인 실패:', error);
      return null;
    }
  }

  // 푸시 구독 정보를 서버에 전송
  async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
              auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`서버 전송 실패: ${response.status}`);
      }

      console.log('푸시 구독 정보 서버 전송 완료');
    } catch (error) {
      console.error('푸시 구독 정보 서버 전송 실패:', error);
      throw error;
    }
  }

  // 로컬 알림 표시
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) {
      await this.registerServiceWorker();
    }

    if (!this.registration) {
      throw new Error('Service Worker 등록에 실패했습니다.');
    }

    try {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/logo.png',
        image: payload.image,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction || false,
        silent: payload.silent || false,
        vibrate: payload.vibrate || [100, 50, 100],
        tag: 'sales-partner-notification',
        renotify: true
      });

      console.log('로컬 알림 표시 완료:', payload.title);
    } catch (error) {
      console.error('로컬 알림 표시 실패:', error);
      throw error;
    }
  }

  // 알림 클릭 이벤트 처리
  setupNotificationClickHandler(): void {
    if (!this.registration) {
      return;
    }

    this.registration.addEventListener('notificationclick', (event) => {
      console.log('알림 클릭:', event);
      
      event.notification.close();

      if (event.action === 'explore') {
        // 특정 페이지로 이동
        event.waitUntil(
          clients.openWindow('/member')
        );
      } else if (event.action === 'close') {
        // 알림 닫기
        console.log('알림 닫기');
      } else {
        // 기본 동작 - 앱 열기
        event.waitUntil(
          clients.matchAll({ type: 'window' }).then((clientList) => {
            // 이미 열린 창이 있으면 포커스
            for (const client of clientList) {
              if (client.url.includes(self.location.origin) && 'focus' in client) {
                return client.focus();
              }
            }
            // 새 창 열기
            if (clients.openWindow) {
              return clients.openWindow('/');
            }
          })
        );
      }
    });
  }

  // VAPID 키를 Uint8Array로 변환
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // ArrayBuffer를 Base64로 변환
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // 푸시 알림 설정 초기화
  async initialize(): Promise<boolean> {
    try {
      // Service Worker 등록
      await this.registerServiceWorker();
      
      // 알림 클릭 핸들러 설정
      this.setupNotificationClickHandler();
      
      // 권한 확인
      const permission = await this.requestPermission();
      
      if (permission === 'granted') {
        // 푸시 구독
        const subscription = await this.subscribeToPush();
        
        // 서버에 구독 정보 전송
        await this.sendSubscriptionToServer(subscription);
        
        console.log('푸시 알림 초기화 완료');
        return true;
      } else {
        console.log('푸시 알림 권한이 거부되었습니다.');
        return false;
      }
    } catch (error) {
      console.error('푸시 알림 초기화 실패:', error);
      return false;
    }
  }

  // 푸시 알림 테스트
  async testNotification(): Promise<void> {
    await this.showLocalNotification({
      title: '세일즈 파트너',
      body: '푸시 알림이 정상적으로 작동합니다!',
      icon: '/logo.png',
      actions: [
        {
          action: 'explore',
          title: '앱 열기',
          icon: '/logo.png'
        },
        {
          action: 'close',
          title: '닫기'
        }
      ],
      data: {
        url: '/member'
      }
    });
  }

  // 푸시 알림 상태 확인
  async getNotificationStatus(): Promise<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
    serviceWorkerActive: boolean;
  }> {
    const supported = this.isSupported;
    const permission = Notification.permission;
    const subscription = await this.getSubscription();
    const serviceWorkerActive = this.registration?.active !== null;

    return {
      supported,
      permission,
      subscribed: subscription !== null,
      serviceWorkerActive
    };
  }
}

// 싱글톤 인스턴스
export const pushNotificationService = new PushNotificationService();

// 푸시 알림 훅
export const usePushNotification = () => {
  const [status, setStatus] = React.useState<{
    supported: boolean;
    permission: NotificationPermission;
    subscribed: boolean;
    serviceWorkerActive: boolean;
  } | null>(null);

  const [isLoading, setIsLoading] = React.useState(false);

  // 상태 업데이트
  const updateStatus = async () => {
    try {
      const newStatus = await pushNotificationService.getNotificationStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('푸시 알림 상태 확인 실패:', error);
    }
  };

  // 초기화
  const initialize = async () => {
    setIsLoading(true);
    try {
      const success = await pushNotificationService.initialize();
      await updateStatus();
      return success;
    } catch (error) {
      console.error('푸시 알림 초기화 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 테스트 알림
  const testNotification = async () => {
    try {
      await pushNotificationService.testNotification();
    } catch (error) {
      console.error('테스트 알림 실패:', error);
    }
  };

  // 구독 해제
  const unsubscribe = async () => {
    try {
      await pushNotificationService.unsubscribeFromPush();
      await updateStatus();
    } catch (error) {
      console.error('푸시 구독 해제 실패:', error);
    }
  };

  React.useEffect(() => {
    updateStatus();
  }, []);

  return {
    status,
    isLoading,
    initialize,
    testNotification,
    unsubscribe,
    updateStatus
  };
};

