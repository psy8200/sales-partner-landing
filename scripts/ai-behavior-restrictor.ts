/**
 * AI 행동 제한 시스템
 * AI가 임의로 작업하지 않도록 제한합니다.
 */

import { aiWorkValidator, WorkRequest } from './ai-work-validator';

export class AIBehaviorRestrictor {
  private static instance: AIBehaviorRestrictor;
  private userInstructions: string[] = [];
  private isUserMode: boolean = true; // 사용자 모드 (기본값)
  
  static getInstance(): AIBehaviorRestrictor {
    if (!AIBehaviorRestrictor.instance) {
      AIBehaviorRestrictor.instance = new AIBehaviorRestrictor();
    }
    return AIBehaviorRestrictor.instance;
  }
  
  /**
   * 사용자 지시 기록
   */
  recordUserInstruction(instruction: string): void {
    this.userInstructions.push(instruction);
    console.log(`📝 사용자 지시 기록: ${instruction}`);
  }
  
  /**
   * AI 모드 설정
   */
  setUserMode(enabled: boolean): void {
    this.isUserMode = enabled;
    console.log(`🔄 AI 모드: ${enabled ? '사용자 지시 모드' : '자율 모드'}`);
  }
  
  /**
   * 작업 실행 권한 확인
   */
  canExecuteAction(action: string, reason?: string): boolean {
    if (!this.isUserMode) {
      console.log('❌ 사용자 모드가 비활성화되어 있습니다.');
      return false;
    }
    
    // 사용자 지시가 있는지 확인
    const hasUserInstruction = this.userInstructions.some(instruction => 
      instruction.toLowerCase().includes(action.toLowerCase())
    );
    
    if (!hasUserInstruction && reason) {
      console.log(`🚨 임의 작업 감지: ${action}`);
      console.log(`사유: ${reason}`);
      console.log('❌ 사용자의 명시적 지시 없이는 실행할 수 없습니다.');
      return false;
    }
    
    return true;
  }
  
  /**
   * 안전한 작업 실행
   */
  async executeSafeWork(request: WorkRequest): Promise<boolean> {
    // 1. 사용자 지시 확인
    if (!this.canExecuteAction(request.action, request.description)) {
      return false;
    }
    
    // 2. 작업 검증
    return await aiWorkValidator.executeWithValidation(request);
  }
  
  /**
   * 일반적인 임의 작업 방지
   */
  preventArbitraryActions() {
    const restrictedActions = [
      '데이터베이스 초기화',
      '시드 데이터 실행', 
      '파일 삭제',
      '시스템 정리',
      '자동 수정',
      '임의 변경',
      '추론 기반 작업'
    ];
    
    console.log('🛡️ AI 행동 제한 활성화');
    console.log('제한된 작업들:');
    restrictedActions.forEach(action => {
      console.log(`  ❌ ${action}`);
    });
  }
  
  /**
   * 현재 상태 출력
   */
  getStatus() {
    return {
      userMode: this.isUserMode,
      userInstructions: this.userInstructions,
      restrictedActions: [
        '데이터베이스 초기화',
        '시드 데이터 실행',
        '파일 삭제',
        '시스템 정리',
        '자동 수정',
        '임의 변경'
      ]
    };
  }
}

// 전역 인스턴스
export const aiBehaviorRestrictor = AIBehaviorRestrictor.getInstance();

// 시스템 초기화
aiBehaviorRestrictor.preventArbitraryActions();


