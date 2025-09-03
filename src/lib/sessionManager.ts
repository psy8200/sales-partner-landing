/**
 * 어드민 세션 관리 유틸리티
 * 세션 자동 갱신, 만료 감지, 사용자 활동 추적 등을 담당
 */

export interface SessionInfo {
  userId: string;
  role: string;
  lastActivity: number;
  expiresAt: number;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionRefreshInterval: NodeJS.Timeout | null = null;
  private userActivityTimeout: NodeJS.Timeout | null = null;
  private warningTimeout: NodeJS.Timeout | null = null;
  private isActive = false;

  private constructor() {}

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * 세션 관리 시작
   */
  startSessionManagement(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.setupPeriodicRefresh();
    this.setupUserActivityTracking();
    this.setupSessionWarning();
    
    console.log('세션 관리가 시작되었습니다.');
  }

  /**
   * 세션 관리 중지
   */
  stopSessionManagement(): void {
    this.isActive = false;
    
    if (this.sessionRefreshInterval) {
      clearInterval(this.sessionRefreshInterval);
      this.sessionRefreshInterval = null;
    }
    
    if (this.userActivityTimeout) {
      clearTimeout(this.userActivityTimeout);
      this.userActivityTimeout = null;
    }
    
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout);
      this.warningTimeout = null;
    }
    
    console.log('세션 관리가 중지되었습니다.');
  }

  /**
   * 주기적 세션 갱신 설정 (개발 환경에서는 비활성화, 프로덕션에서는 60분마다)
   */
  private setupPeriodicRefresh(): void {
    // 개발 환경에서는 주기적 갱신 비활성화
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 개발 환경: 주기적 세션 갱신 비활성화');
      return;
    }
    
    this.sessionRefreshInterval = setInterval(async () => {
      await this.refreshSession();
    }, 60 * 60 * 1000); // 60분
  }

  /**
   * 사용자 활동 추적 설정 (개발 환경에서는 비활성화)
   */
  private setupUserActivityTracking(): void {
    // 개발 환경에서는 사용자 활동 추적 비활성화
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 개발 환경: 사용자 활동 추적 비활성화');
      return;
    }
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleUserActivity = () => {
      // 사용자 활동이 감지되면 세션 갱신
      if (this.userActivityTimeout) {
        clearTimeout(this.userActivityTimeout);
      }
      
      this.userActivityTimeout = setTimeout(async () => {
        await this.refreshSession();
      }, 1000); // 1초 후 세션 갱신
    };

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // 페이지 가시성 변경 감지 (탭 전환 시)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        this.refreshSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  /**
   * 세션 만료 경고 설정 (25분 후)
   */
  private setupSessionWarning(): void {
    this.warningTimeout = setTimeout(() => {
      this.showSessionWarning();
    }, 25 * 60 * 1000); // 25분 후 경고
  }

  /**
   * 세션 갱신
   */
  private async refreshSession(): Promise<boolean> {
    try {
      // 현재 페이지가 어드민 페이지인지 확인
      const isAdminPage = window.location.pathname.startsWith('/admin');
      
      let response;
      if (isAdminPage) {
        // 어드민 페이지에서는 어드민 전용 API 사용
        response = await fetch('/api/admin/auth/me');
      } else {
        // 일반 페이지에서는 일반 사용자 API 사용
        response = await fetch('/api/auth/me');
      }
      
      if (!response.ok) {
        throw new Error('세션 갱신에 실패했습니다.');
      }
      
      const data = await response.json();
      const userData = data.user;
      
      // 어드민 권한 재확인
      if (userData.role !== 'ADMIN' && userData.role !== 'MANAGER') {
        throw new Error('어드민 권한이 필요합니다.');
      }
      
      // 계정 상태 재확인
      if (userData.status !== 'ACTIVE' || !userData.isActive) {
        throw new Error('비활성화된 계정입니다.');
      }
      
      console.log('세션이 성공적으로 갱신되었습니다.');
      return true;
    } catch (err) {
      console.error('세션 갱신 오류:', err);
      return false;
    }
  }

  /**
   * 세션 만료 경고 표시
   */
  private showSessionWarning(): void {
    // 경고 모달이 이미 표시되어 있는지 확인
    if (document.querySelector('.session-warning-modal')) {
      return;
    }

    const warningModal = document.createElement('div');
    warningModal.className = 'session-warning-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    warningModal.innerHTML = `
      <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
        <div class="text-center">
          <div class="text-yellow-500 text-4xl mb-4">⏰</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">세션 만료 예정</h3>
          <p class="text-gray-600 mb-4">
            곧 세션이 만료됩니다. 계속 작업하시려면 아래 버튼을 클릭하세요.
          </p>
          <div class="flex space-x-3">
            <button id="extend-session" class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              세션 연장
            </button>
            <button id="close-warning" class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors">
              닫기
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(warningModal);

    // 이벤트 리스너 등록
    const extendButton = warningModal.querySelector('#extend-session');
    const closeButton = warningModal.querySelector('#close-warning');

    extendButton?.addEventListener('click', async () => {
      await this.refreshSession();
      this.removeWarningModal();
      // 새로운 경고 타이머 설정
      this.setupSessionWarning();
    });

    closeButton?.addEventListener('click', () => {
      this.removeWarningModal();
    });
  }

  /**
   * 경고 모달 제거
   */
  private removeWarningModal(): void {
    const warningModal = document.querySelector('.session-warning-modal');
    if (warningModal) {
      warningModal.remove();
    }
  }

  /**
   * 현재 세션 상태 확인
   */
  async checkSessionStatus(): Promise<{ isValid: boolean; user?: Record<string, unknown>; error?: string }> {
    try {
      // 현재 페이지가 어드민 페이지인지 확인
      const isAdminPage = window.location.pathname.startsWith('/admin');
      
      let response;
      if (isAdminPage) {
        // 어드민 페이지에서는 어드민 전용 API 사용
        response = await fetch('/api/admin/auth/me');
      } else {
        // 일반 페이지에서는 일반 사용자 API 사용
        response = await fetch('/api/auth/me');
      }
      
      if (!response.ok) {
        return { isValid: false, error: '세션이 유효하지 않습니다.' };
      }
      
      const data = await response.json();
      return { isValid: true, user: data.user };
    } catch {
      return { isValid: false, error: '세션 확인 중 오류가 발생했습니다.' };
    }
  }

  /**
   * 세션 수동 갱신
   */
  async manualRefresh(): Promise<boolean> {
    return await this.refreshSession();
  }
}

// 전역 인스턴스
export const sessionManager = SessionManager.getInstance();

/**
 * 세션 관리 훅 (React 컴포넌트에서 사용)
 */
export const useSessionManager = () => {
  return {
    startSessionManagement: () => sessionManager.startSessionManagement(),
    stopSessionManagement: () => sessionManager.stopSessionManagement(),
    checkSessionStatus: () => sessionManager.checkSessionStatus(),
    manualRefresh: () => sessionManager.manualRefresh(),
  };
};
