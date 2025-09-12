import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * 백업 생성 API
 * 고정된 경로에 백업을 생성하고 기존 백업을 덮어씁니다.
 */
export async function POST(request: NextRequest) {
  try {
    const backupResult = await createBackup();
    
    if (backupResult.success) {
      return NextResponse.json({
        success: true,
        message: '백업이 성공적으로 생성되었습니다.',
        backupInfo: backupResult
      });
    } else {
      return NextResponse.json({
        success: false,
        error: backupResult.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('백업 생성 중 오류:', error);
    return NextResponse.json(
      { success: false, error: '백업 생성 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 백업 생성 함수
 */
async function createBackup() {
  try {
    const homeDir = path.join(process.cwd(), '..');
    const backupDir = path.join(homeDir, 'backup-latest');
    
    console.log('🔄 백업 생성 시작...');
    console.log('📁 백업 경로:', backupDir);
    
    // 기존 백업 폴더가 있으면 삭제
    if (fs.existsSync(backupDir)) {
      console.log('🗑️ 기존 백업 폴더 삭제 중...');
      fs.rmSync(backupDir, { recursive: true, force: true });
    }
    
    // 백업 폴더 생성
    fs.mkdirSync(backupDir, { recursive: true });
    
    // 현재 프로젝트 복사
    const sourceDir = process.cwd();
    const targetDir = path.join(backupDir, 'sales-partner-landing');
    
    console.log('📋 프로젝트 파일 복사 중...');
    copyDirectory(sourceDir, targetDir);
    
    // 백업 정보 파일 생성
    const backupInfo = {
      backupDate: new Date().toISOString(),
      backupPath: backupDir,
      sourcePath: sourceDir,
      version: '1.0.0',
      description: '정산관리 시스템 완성 버전 백업'
    };
    
    fs.writeFileSync(
      path.join(backupDir, 'backup-info.json'),
      JSON.stringify(backupInfo, null, 2)
    );
    
    // 백업 크기 계산
    const backupSize = getDirectorySize(backupDir);
    
    console.log('✅ 백업 생성 완료!');
    console.log('📊 백업 크기:', Math.round(backupSize / (1024 * 1024) * 100) / 100, 'MB');
    
    return {
      success: true,
      backupPath: backupDir,
      backupSize: Math.round(backupSize / (1024 * 1024) * 100) / 100,
      backupDate: new Date().toLocaleString('ko-KR'),
      message: '백업이 성공적으로 생성되었습니다.'
    };
    
  } catch (error) {
    console.error('❌ 백업 생성 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 디렉토리 복사 함수
 */
function copyDirectory(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
  
  const items = fs.readdirSync(source);
  
  for (const item of items) {
    const sourcePath = path.join(source, item);
    const targetPath = path.join(target, item);
    
    // node_modules, .next, .git 등 제외
    if (['node_modules', '.next', '.git', 'backup-latest'].includes(item)) {
      continue;
    }
    
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

/**
 * 디렉토리 크기 계산 함수
 */
function getDirectorySize(dirPath: string): number {
  let size = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(itemPath);
      } else {
        size += stats.size;
      }
    }
  } catch (error) {
    // 권한 문제나 접근 불가능한 파일은 무시
  }
  
  return size;
}
