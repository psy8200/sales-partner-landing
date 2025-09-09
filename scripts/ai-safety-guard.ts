/**
 * AI 안전 가드 시스템
 * 위험한 작업을 방지하고 사용자 확인을 요구합니다.
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// 위험한 명령어 목록
const DANGEROUS_COMMANDS = [
  'prisma db push --force-reset',
  'prisma migrate reset',
  'prisma db seed',
  'node seed.js',
  'npm run prisma:reset',
  'rm -rf',
  'del /s /q',
  'format c:',
  'rm -rf node_modules',
  'npm run dev:clean'
];

// 데이터베이스 관련 위험 명령어
const DB_DANGEROUS_COMMANDS = [
  'deleteMany',
  'drop',
  'truncate',
  'ALTER TABLE DROP',
  'DROP TABLE',
  'DELETE FROM'
];

/**
 * 명령어가 위험한지 확인
 */
export function isDangerousCommand(command: string): boolean {
  const lowerCommand = command.toLowerCase();
  
  return DANGEROUS_COMMANDS.some(dangerous => 
    lowerCommand.includes(dangerous.toLowerCase())
  );
}

/**
 * 데이터베이스 위험 명령어인지 확인
 */
export function isDatabaseDangerousCommand(command: string): boolean {
  const lowerCommand = command.toLowerCase();
  
  return DB_DANGEROUS_COMMANDS.some(dangerous => 
    lowerCommand.includes(dangerous.toLowerCase())
  );
}

/**
 * 안전한 명령어 실행 (사용자 확인 필요)
 */
export async function executeSafeCommand(command: string, requiresConfirmation: boolean = true): Promise<boolean> {
  if (isDangerousCommand(command)) {
    console.log('🚨 위험한 명령어가 감지되었습니다!');
    console.log(`명령어: ${command}`);
    console.log('⚠️ 이 명령어는 데이터 손실을 일으킬 수 있습니다.');
    
    if (requiresConfirmation) {
      console.log('❌ 사용자의 명시적 확인 없이는 실행할 수 없습니다.');
      return false;
    }
  }
  
  if (isDatabaseDangerousCommand(command)) {
    console.log('🗄️ 데이터베이스 위험 명령어가 감지되었습니다!');
    console.log(`명령어: ${command}`);
    console.log('⚠️ 이 명령어는 데이터베이스 데이터를 변경할 수 있습니다.');
    
    if (requiresConfirmation) {
      console.log('❌ 사용자의 명시적 확인 없이는 실행할 수 없습니다.');
      return false;
    }
  }
  
  return true;
}

/**
 * AI 작업 제한 시스템
 */
export class AISafetyGuard {
  private static instance: AISafetyGuard;
  private userConfirmedActions: Set<string> = new Set();
  
  static getInstance(): AISafetyGuard {
    if (!AISafetyGuard.instance) {
      AISafetyGuard.instance = new AISafetyGuard();
    }
    return AISafetyGuard.instance;
  }
  
  /**
   * 사용자 확인이 필요한 작업인지 확인
   */
  requiresUserConfirmation(action: string): boolean {
    const dangerousActions = [
      'database_reset',
      'data_initialization', 
      'file_deletion',
      'system_cleanup',
      'migration_reset',
      'seed_execution'
    ];
    
    return dangerousActions.some(dangerous => 
      action.toLowerCase().includes(dangerous.toLowerCase())
    );
  }
  
  /**
   * 사용자 확인 기록
   */
  recordUserConfirmation(action: string): void {
    this.userConfirmedActions.add(action);
    console.log(`✅ 사용자 확인 기록: ${action}`);
  }
  
  /**
   * 사용자 확인 여부 확인
   */
  hasUserConfirmation(action: string): boolean {
    return this.userConfirmedActions.has(action);
  }
  
  /**
   * 안전한 작업 실행
   */
  async executeSafeAction(action: string, command: string): Promise<boolean> {
    if (this.requiresUserConfirmation(action)) {
      if (!this.hasUserConfirmation(action)) {
        console.log(`🚨 작업 "${action}"은 사용자 확인이 필요합니다.`);
        console.log(`명령어: ${command}`);
        console.log('❌ 사용자의 명시적 지시 없이는 실행할 수 없습니다.');
        return false;
      }
    }
    
    return await executeSafeCommand(command, false);
  }
}

// 전역 인스턴스
export const aiSafetyGuard = AISafetyGuard.getInstance();


