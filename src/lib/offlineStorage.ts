// 오프라인 데이터 저장소 관리
// IndexedDB를 사용한 오프라인 데이터 동기화

interface OfflineData {
  id: string;
  type: 'api_request' | 'form_data' | 'user_action';
  data: any;
  timestamp: number;
  synced: boolean;
  url?: string;
  method?: string;
}

class OfflineStorage {
  private dbName = 'SalesPartnerOfflineDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  // IndexedDB 초기화
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB 초기화 실패:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB 초기화 성공');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // 오프라인 데이터 저장소
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }

        // 사용자 설정 저장소
        if (!db.objectStoreNames.contains('userSettings')) {
          db.createObjectStore('userSettings', { keyPath: 'key' });
        }

        // 캐시된 API 응답 저장소
        if (!db.objectStoreNames.contains('apiCache')) {
          const store = db.createObjectStore('apiCache', { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // 오프라인 데이터 저장
  async saveOfflineData(data: Omit<OfflineData, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    if (!this.db) {
      await this.init();
    }

    const offlineData: OfflineData = {
      ...data,
      id: this.generateId(),
      timestamp: Date.now(),
      synced: false,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onsuccess = () => {
        console.log('오프라인 데이터 저장 완료:', offlineData.id);
        resolve(offlineData.id);
      };

      request.onerror = () => {
        console.error('오프라인 데이터 저장 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 오프라인 데이터 조회
  async getOfflineData(type?: string): Promise<OfflineData[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const request = type 
        ? store.index('type').getAll(type)
        : store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('오프라인 데이터 조회 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 동기화되지 않은 데이터 조회
  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        console.error('동기화되지 않은 데이터 조회 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 데이터 동기화 완료 표시
  async markAsSynced(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          
          putRequest.onsuccess = () => {
            console.log('데이터 동기화 완료:', id);
            resolve();
          };
          
          putRequest.onerror = () => {
            console.error('데이터 동기화 표시 실패:', putRequest.error);
            reject(putRequest.error);
          };
        } else {
          reject(new Error('데이터를 찾을 수 없습니다.'));
        }
      };

      getRequest.onerror = () => {
        console.error('데이터 조회 실패:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  // 사용자 설정 저장
  async saveUserSetting(key: string, value: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readwrite');
      const store = transaction.objectStore('userSettings');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => {
        console.log('사용자 설정 저장 완료:', key);
        resolve();
      };

      request.onerror = () => {
        console.error('사용자 설정 저장 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 사용자 설정 조회
  async getUserSetting(key: string): Promise<any> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['userSettings'], 'readonly');
      const store = transaction.objectStore('userSettings');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };

      request.onerror = () => {
        console.error('사용자 설정 조회 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // API 응답 캐시 저장
  async cacheApiResponse(url: string, response: any, ttl: number = 300000): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const cacheData = {
      url,
      response,
      timestamp: Date.now(),
      ttl,
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const request = store.put(cacheData);

      request.onsuccess = () => {
        console.log('API 응답 캐시 저장 완료:', url);
        resolve();
      };

      request.onerror = () => {
        console.error('API 응답 캐시 저장 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // API 응답 캐시 조회
  async getCachedApiResponse(url: string): Promise<any> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readonly');
      const store = transaction.objectStore('apiCache');
      const request = store.get(url);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const isExpired = Date.now() - result.timestamp > result.ttl;
          if (isExpired) {
            // 만료된 캐시 삭제
            this.deleteCachedApiResponse(url);
            resolve(null);
          } else {
            resolve(result.response);
          }
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        console.error('API 응답 캐시 조회 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // API 응답 캐시 삭제
  async deleteCachedApiResponse(url: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const request = store.delete(url);

      request.onsuccess = () => {
        console.log('API 응답 캐시 삭제 완료:', url);
        resolve();
      };

      request.onerror = () => {
        console.error('API 응답 캐시 삭제 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 만료된 캐시 정리
  async cleanupExpiredCache(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['apiCache'], 'readwrite');
      const store = transaction.objectStore('apiCache');
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result || [];
        const now = Date.now();
        const expiredKeys: string[] = [];

        results.forEach((item) => {
          if (now - item.timestamp > item.ttl) {
            expiredKeys.push(item.url);
          }
        });

        if (expiredKeys.length > 0) {
          const deletePromises = expiredKeys.map(key => 
            new Promise<void>((deleteResolve, deleteReject) => {
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => deleteResolve();
              deleteRequest.onerror = () => deleteReject(deleteRequest.error);
            })
          );

          Promise.all(deletePromises)
            .then(() => {
              console.log('만료된 캐시 정리 완료:', expiredKeys.length, '개');
              resolve();
            })
            .catch(reject);
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        console.error('캐시 정리 실패:', request.error);
        reject(request.error);
      };
    });
  }

  // 고유 ID 생성
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 데이터베이스 초기화 (개발용)
  async clearAllData(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData', 'userSettings', 'apiCache'], 'readwrite');
      
      const clearStore = (storeName: string) => {
        return new Promise<void>((storeResolve, storeReject) => {
          const store = transaction.objectStore(storeName);
          const request = store.clear();
          request.onsuccess = () => storeResolve();
          request.onerror = () => storeReject(request.error);
        });
      };

      Promise.all([
        clearStore('offlineData'),
        clearStore('userSettings'),
        clearStore('apiCache')
      ])
        .then(() => {
          console.log('모든 오프라인 데이터 삭제 완료');
          resolve();
        })
        .catch(reject);
    });
  }
}

// 싱글톤 인스턴스
export const offlineStorage = new OfflineStorage();

// 오프라인 API 요청 래퍼
export class OfflineApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // API 요청 (오프라인 지원)
  async request(url: string, options: RequestInit = {}): Promise<any> {
    const fullUrl = `${this.baseUrl}${url}`;
    
    try {
      // 온라인 상태에서 네트워크 요청 시도
      if (navigator.onLine) {
        const response = await fetch(fullUrl, options);
        
        if (response.ok) {
          const data = await response.json();
          
          // 성공한 응답을 캐시에 저장
          await offlineStorage.cacheApiResponse(fullUrl, data);
          
          return data;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else {
        throw new Error('오프라인 상태');
      }
    } catch (error) {
      console.log('네트워크 요청 실패, 오프라인 처리:', error);
      
      // 오프라인 요청을 저장
      await offlineStorage.saveOfflineData({
        type: 'api_request',
        data: { url: fullUrl, options },
        url: fullUrl,
        method: options.method || 'GET',
      });
      
      // 캐시된 응답이 있는지 확인
      const cachedResponse = await offlineStorage.getCachedApiResponse(fullUrl);
      if (cachedResponse) {
        console.log('캐시된 응답 사용:', fullUrl);
        return cachedResponse;
      }
      
      throw new Error('오프라인 상태에서 사용 가능한 데이터가 없습니다.');
    }
  }

  // 오프라인 데이터 동기화
  async syncOfflineData(): Promise<void> {
    if (!navigator.onLine) {
      throw new Error('온라인 상태가 아닙니다.');
    }

    const unsyncedData = await offlineStorage.getUnsyncedData();
    console.log('동기화할 데이터:', unsyncedData.length, '개');

    for (const data of unsyncedData) {
      try {
        if (data.type === 'api_request') {
          const { url, options } = data.data;
          const response = await fetch(url, options);
          
          if (response.ok) {
            await offlineStorage.markAsSynced(data.id);
            console.log('데이터 동기화 완료:', data.id);
          }
        }
      } catch (error) {
        console.error('데이터 동기화 실패:', data.id, error);
      }
    }
  }
}

// 기본 API 클라이언트 인스턴스
export const apiClient = new OfflineApiClient();
