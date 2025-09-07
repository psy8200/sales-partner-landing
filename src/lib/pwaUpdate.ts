// PWA 업데이트 관리
// Service Worker 업데이트 및 앱 버전 관리

interface UpdateInfo {
  hasUpdate: boolean;
  isUpdating: boolean;
  updateAvailable: boolean;
  currentVersion: string;
  newVersion?: string;
  updateProgress?: number;
}

class PwaUpdateManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateInfo: UpdateInfo = {
    hasUpdate: false,
    isUpdating: false,
    updateAvailable: false,
    currentVersion: '1.0.0'
  };
  private updateCallbacks: Array<(info: UpdateInfo) => void> = [];

  constructor() {
    this.initialize();
  }

  // 초기화
  private async initialize(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.getRegistration();
        if (this.registration) {
          this.setupUpdateListeners();
          await this.checkForUpdates();
        }
      } catch (error) {
        console.error('PWA 업데이트 매니저 초기화 실패:', error);
      }
    }
  }

  // 업데이트 리스너 설정
  private setupUpdateListeners(): void {
    if (!this.registration) return;

    // Service Worker 업데이트 감지
    this.registration.addEventListener('updatefound', () => {
      console.log('새 Service Worker 발견');
      
      const newWorker = this.registration!.installing;
      if (newWorker) {
        this.updateInfo.isUpdating = true;
        this.updateInfo.hasUpdate = true;
        this.notifyCallbacks();

        newWorker.addEventListener('statechange', () => {
          switch (newWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                // 새 버전이 설치됨
                this.updateInfo.updateAvailable = true;
                this.updateInfo.isUpdating = false;
                this.updateInfo.newVersion = this.generateVersion();
                console.log('새 버전이 설치되었습니다. 업데이트를 적용하세요.');
              } else {
                // 첫 설치
                this.updateInfo.isUpdating = false;
                this.updateInfo.hasUpdate = false;
                console.log('Service Worker가 설치되었습니다.');
              }
              this.notifyCallbacks();
              break;
            case 'activated':
              console.log('새 Service Worker가 활성화되었습니다.');
              this.updateInfo.isUpdating = false;
              this.updateInfo.hasUpdate = false;
              this.updateInfo.updateAvailable = false;
              this.updateInfo.currentVersion = this.updateInfo.newVersion || this.updateInfo.currentVersion;
              this.notifyCallbacks();
              break;
          }
        });
      }
    });

    // 컨트롤러 변경 감지
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker 컨트롤러가 변경되었습니다.');
      window.location.reload();
    });
  }

  // 업데이트 확인
  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) {
      console.log('Service Worker가 등록되지 않았습니다.');
      return false;
    }

    try {
      console.log('업데이트 확인 중...');
      await this.registration.update();
      
      // 업데이트 확인 후 상태 체크
      if (this.registration.waiting) {
        this.updateInfo.updateAvailable = true;
        this.updateInfo.hasUpdate = true;
        this.updateInfo.newVersion = this.generateVersion();
        this.notifyCallbacks();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('업데이트 확인 실패:', error);
      return false;
    }
  }

  // 업데이트 적용
  async applyUpdate(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      throw new Error('적용할 업데이트가 없습니다.');
    }

    try {
      console.log('업데이트 적용 중...');
      this.updateInfo.isUpdating = true;
      this.notifyCallbacks();

      // 대기 중인 Service Worker에게 메시지 전송
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // 컨트롤러 변경을 기다림
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('업데이트 적용 완료');
          this.updateInfo.isUpdating = false;
          this.updateInfo.hasUpdate = false;
          this.updateInfo.updateAvailable = false;
          this.updateInfo.currentVersion = this.updateInfo.newVersion || this.updateInfo.currentVersion;
          this.notifyCallbacks();
          resolve();
        });
      });
    } catch (error) {
      console.error('업데이트 적용 실패:', error);
      this.updateInfo.isUpdating = false;
      this.notifyCallbacks();
      throw error;
    }
  }

  // 강제 새로고침
  async forceRefresh(): Promise<void> {
    try {
      // 모든 탭에서 새로고침
      const clients = await navigator.serviceWorker.getClients();
      clients.forEach(client => {
        if (client.navigate) {
          client.navigate(client.url);
        }
      });
      
      // 현재 탭 새로고침
      window.location.reload();
    } catch (error) {
      console.error('강제 새로고침 실패:', error);
      window.location.reload();
    }
  }

  // 업데이트 상태 구독
  subscribe(callback: (info: UpdateInfo) => void): () => void {
    this.updateCallbacks.push(callback);
    
    // 현재 상태 즉시 전달
    callback(this.updateInfo);
    
    // 구독 해제 함수 반환
    return () => {
      const index = this.updateCallbacks.indexOf(callback);
      if (index > -1) {
        this.updateCallbacks.splice(index, 1);
      }
    };
  }

  // 콜백 알림
  private notifyCallbacks(): void {
    this.updateCallbacks.forEach(callback => {
      try {
        callback(this.updateInfo);
      } catch (error) {
        console.error('업데이트 콜백 실행 실패:', error);
      }
    });
  }

  // 버전 생성 (실제로는 서버에서 받아와야 함)
  private generateVersion(): string {
    const now = new Date();
    const timestamp = now.getTime();
    const version = `1.0.${Math.floor(timestamp / 1000)}`;
    return version;
  }

  // 현재 업데이트 정보 반환
  getUpdateInfo(): UpdateInfo {
    return { ...this.updateInfo };
  }

  // 업데이트 무시
  async ignoreUpdate(): Promise<void> {
    this.updateInfo.updateAvailable = false;
    this.updateInfo.hasUpdate = false;
    this.notifyCallbacks();
  }

  // 자동 업데이트 설정
  setAutoUpdate(enabled: boolean): void {
    localStorage.setItem('pwa-auto-update', enabled.toString());
  }

  // 자동 업데이트 설정 확인
  isAutoUpdateEnabled(): boolean {
    return localStorage.getItem('pwa-auto-update') === 'true';
  }

  // 업데이트 알림 표시
  showUpdateNotification(): void {
    if (!this.updateInfo.updateAvailable) return;

    // 브라우저 알림 사용
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('세일즈 파트너 업데이트', {
        body: '새 버전이 사용 가능합니다. 업데이트를 적용하시겠습니까?',
        icon: '/logo.png',
        tag: 'pwa-update',
        requireInteraction: true,
        actions: [
          {
            action: 'update',
            title: '업데이트'
          },
          {
            action: 'ignore',
            title: '나중에'
          }
        ]
      });
    }
  }

  // 캐시 정리
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('캐시 정리 완료');
      } catch (error) {
        console.error('캐시 정리 실패:', error);
        throw error;
      }
    }
  }

  // 앱 재설치
  async reinstallApp(): Promise<void> {
    try {
      // 캐시 정리
      await this.clearCache();
      
      // Service Worker 등록 해제
      if (this.registration) {
        await this.registration.unregister();
      }
      
      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('앱 재설치 실패:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스
export const pwaUpdateManager = new PwaUpdateManager();

// PWA 업데이트 훅
export const usePwaUpdate = () => {
  const [updateInfo, setUpdateInfo] = React.useState<UpdateInfo>({
    hasUpdate: false,
    isUpdating: false,
    updateAvailable: false,
    currentVersion: '1.0.0'
  });

  const [isLoading, setIsLoading] = React.useState(false);

  // 업데이트 상태 구독
  React.useEffect(() => {
    const unsubscribe = pwaUpdateManager.subscribe((info) => {
      setUpdateInfo(info);
    });

    return unsubscribe;
  }, []);

  // 업데이트 확인
  const checkForUpdates = async () => {
    setIsLoading(true);
    try {
      const hasUpdate = await pwaUpdateManager.checkForUpdates();
      return hasUpdate;
    } catch (error) {
      console.error('업데이트 확인 실패:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // 업데이트 적용
  const applyUpdate = async () => {
    setIsLoading(true);
    try {
      await pwaUpdateManager.applyUpdate();
    } catch (error) {
      console.error('업데이트 적용 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 업데이트 무시
  const ignoreUpdate = async () => {
    await pwaUpdateManager.ignoreUpdate();
  };

  // 강제 새로고침
  const forceRefresh = async () => {
    await pwaUpdateManager.forceRefresh();
  };

  // 캐시 정리
  const clearCache = async () => {
    setIsLoading(true);
    try {
      await pwaUpdateManager.clearCache();
    } catch (error) {
      console.error('캐시 정리 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 앱 재설치
  const reinstallApp = async () => {
    setIsLoading(true);
    try {
      await pwaUpdateManager.reinstallApp();
    } catch (error) {
      console.error('앱 재설치 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateInfo,
    isLoading,
    checkForUpdates,
    applyUpdate,
    ignoreUpdate,
    forceRefresh,
    clearCache,
    reinstallApp
  };
};
