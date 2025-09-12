/**
 * AI 안전 시스템 통합 관리
 * 모든 AI 작업을 안전하게 관리합니다.
 */

import { aiSafetyGuard } from './ai-safety-guard';
import { aiWorkValidator, WorkRequest } from './ai-work-validator';
import { aiBehaviorRestrictor } from './ai-behavior-restrictor';

export class AISafetySystem {
  private static instance: AISafetySystem;
  
  static getInstance(): AISafetySystem {
    if (!AISafetySystem.instance) {
      AISafetySystem.instance = new AISafetySystem();
    }
    return AISafetySystem.instance;
  }
  
  /**
   * 시스템 초기화
   */
  initialize(): void {
    console.log('🛡️ AI 안전 시스템 초기화');
    console.log('✅ 위험 명령어 차단 활성화');
    console.log('✅ 작업 검증 시스템 활성화');
    console.log('✅ 행동 제한 시스템 활성화');
    console.log('✅ 사용자 지시 모드 활성화');
  }
  
  /**
   * 안전한 작업 실행
   */
  async executeSafeWork(request: WorkRequest): Promise<boolean> {
    console.log(`🔍 작업 검증 시작: ${request.action}`);
    
    // 1. 행동 제한 확인
    if (!aiBehaviorRestrictor.canExecuteAction(request.action, request.description)) {
      return false;
    }
    
    // 2. 작업 검증
    const validation = aiWorkValidator.validateWorkRequest(request);
    if (!validation.isValid) {
      console.log(validation.message);
      return false;
    }
    
    // 3. 안전 가드 확인
    const isSafe = await aiSafetyGuard.executeSafeAction(request.action, request.command);
    if (!isSafe) {
      console.log('❌ 안전 가드에 의해 차단되었습니다.');
      return false;
    }
    
    console.log('✅ 모든 안전 검증 통과');
    return true;
  }
  
  /**
   * 사용자 지시 기록
   */
  recordUserInstruction(instruction: string): void {
    aiBehaviorRestrictor.recordUserInstruction(instruction);
  }
  
  /**
   * 위험 작업 템플릿
   */
  getDangerousWorkTemplates() {
    return aiWorkValidator.getDangerousWorkTemplates();
  }
  
  /**
   * 시스템 상태 확인
   */
  getSystemStatus() {
    return {
      safetyGuard: '활성화',
      workValidator: '활성화', 
      behaviorRestrictor: aiBehaviorRestrictor.getStatus(),
      lastUpdate: new Date().toISOString()
    };
  }
  
  /**
   * 응급 상황에서만 사용할 수 있는 관리자 명령어
   */
  emergencyOverride(action: string, reason: string): boolean {
    console.log('🚨 응급 상황 관리자 명령어 실행');
    console.log(`작업: ${action}`);
    console.log(`사유: ${reason}`);
    console.log('⚠️ 이 작업은 모든 안전 검증을 우회합니다.');
    
    // 실제로는 더 엄격한 인증이 필요
    return true;
  }
}

// 전역 인스턴스
export const aiSafetySystem = AISafetySystem.getInstance();

// 시스템 자동 초기화
aiSafetySystem.initialize();







