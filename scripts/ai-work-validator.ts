/**
 * AI 작업 검증 시스템
 * 모든 작업을 검증하고 사용자 확인을 요구합니다.
 */

import { aiSafetyGuard } from './ai-safety-guard';

export interface WorkRequest {
  action: string;
  command: string;
  description: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresConfirmation: boolean;
}

export class AIWorkValidator {
  private static instance: AIWorkValidator;
  
  static getInstance(): AIWorkValidator {
    if (!AIWorkValidator.instance) {
      AIWorkValidator.instance = new AIWorkValidator();
    }
    return AIWorkValidator.instance;
  }
  
  /**
   * 작업 요청 검증
   */
  validateWorkRequest(request: WorkRequest): {
    isValid: boolean;
    message: string;
    requiresUserConfirmation: boolean;
  } {
    // 위험도별 검증
    switch (request.riskLevel) {
      case 'CRITICAL':
        return {
          isValid: false,
          message: `🚨 CRITICAL 위험 작업: ${request.description}\n❌ 사용자의 명시적 지시 없이는 실행할 수 없습니다.`,
          requiresUserConfirmation: true
        };
        
      case 'HIGH':
        return {
          isValid: false,
          message: `⚠️ HIGH 위험 작업: ${request.description}\n❌ 사용자의 명시적 지시 없이는 실행할 수 없습니다.`,
          requiresUserConfirmation: true
        };
        
      case 'MEDIUM':
        return {
          isValid: true,
          message: `⚠️ MEDIUM 위험 작업: ${request.description}\n사용자 확인을 권장합니다.`,
          requiresUserConfirmation: true
        };
        
      case 'LOW':
        return {
          isValid: true,
          message: `✅ LOW 위험 작업: ${request.description}\n안전하게 실행 가능합니다.`,
          requiresUserConfirmation: false
        };
    }
  }
  
  /**
   * 작업 실행 전 최종 확인
   */
  async executeWithValidation(request: WorkRequest): Promise<boolean> {
    const validation = this.validateWorkRequest(request);
    
    if (!validation.isValid) {
      console.log(validation.message);
      return false;
    }
    
    if (validation.requiresUserConfirmation) {
      console.log(validation.message);
      console.log('❌ 사용자의 명시적 지시를 기다립니다...');
      return false;
    }
    
    // 안전 가드 검증
    return await aiSafetyGuard.executeSafeAction(request.action, request.command);
  }
  
  /**
   * 일반적인 위험 작업들 정의
   */
  getDangerousWorkTemplates() {
    return {
      DATABASE_RESET: {
        action: 'database_reset',
        command: 'npx prisma db push --force-reset',
        description: '데이터베이스 초기화 (모든 데이터 삭제)',
        riskLevel: 'CRITICAL' as const,
        requiresConfirmation: true
      },
      
      SEED_EXECUTION: {
        action: 'seed_execution', 
        command: 'node seed.js',
        description: '시드 데이터 실행 (기존 데이터 덮어쓰기)',
        riskLevel: 'CRITICAL' as const,
        requiresConfirmation: true
      },
      
      FILE_DELETION: {
        action: 'file_deletion',
        command: 'rm -rf',
        description: '파일 삭제',
        riskLevel: 'HIGH' as const,
        requiresConfirmation: true
      },
      
      SYSTEM_CLEANUP: {
        action: 'system_cleanup',
        command: 'npm run dev:clean',
        description: '시스템 정리 (임시 파일 삭제)',
        riskLevel: 'MEDIUM' as const,
        requiresConfirmation: true
      }
    };
  }
}

// 전역 인스턴스
export const aiWorkValidator = AIWorkValidator.getInstance();

