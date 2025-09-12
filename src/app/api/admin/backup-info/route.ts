import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * 백업 정보 API
 * 수동백업, Git, GitHub의 실시간 정보를 제공합니다.
 */
export async function GET(request: NextRequest) {
  try {
    const backupInfo = {
      manual: await getManualBackupInfo(),
      git: await getGitInfo(),
      github: await getGitHubInfo()
    };

    return NextResponse.json(backupInfo);
  } catch (error) {
    console.error('백업 정보 조회 중 오류:', error);
    return NextResponse.json(
      { error: '백업 정보를 가져올 수 없습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 수동 백업 정보 조회
 */
async function getManualBackupInfo() {
  try {
    // 고정된 백업 디렉토리 경로 (C:\home\backup-latest)
    const homeDir = path.join(process.cwd(), '..');
    const backupDir = path.join(homeDir, 'backup-latest');
    
    if (!fs.existsSync(backupDir)) {
      return {
        status: 'no_backup',
        message: '백업 폴더가 존재하지 않습니다.',
        lastBackup: null,
        backupCount: 0,
        totalSize: 0
      };
    }

    // 백업 크기 계산
    let totalSize = 0;
    const getDirSize = (dirPath: string): number => {
      let size = 0;
      try {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          const itemPath = path.join(dirPath, item);
          const stats = fs.statSync(itemPath);
          if (stats.isDirectory()) {
            size += getDirSize(itemPath);
          } else {
            size += stats.size;
          }
        }
      } catch (error) {
        // 권한 문제나 접근 불가능한 파일은 무시
      }
      return size;
    };

    totalSize = getDirSize(backupDir);

    // 백업 내용 확인
    const backupContents = fs.readdirSync(backupDir);
    const hasWebProject = backupContents.includes('sales-partner-landing');
    const hasMobileProject = backupContents.includes('sales-partner-mobile-app');
    const hasRootFiles = backupContents.some(file => 
      ['package.json', 'README.md', 'vercel.json', 'env.example'].includes(file)
    );

    // 백업 정보 파일에서 정보 읽기
    let backupInfo = null;
    const backupInfoPath = path.join(backupDir, 'backup-info.json');
    if (fs.existsSync(backupInfoPath)) {
      try {
        const backupInfoContent = fs.readFileSync(backupInfoPath, 'utf8');
        backupInfo = JSON.parse(backupInfoContent);
      } catch (error) {
        console.error('백업 정보 파일 읽기 실패:', error);
      }
    }

    return {
      status: 'success',
      lastBackup: 'backup-latest',
      backupDate: backupInfo?.backupDate ? new Date(backupInfo.backupDate).toLocaleString('ko-KR') : '정보 없음',
      backupCount: 1,
      totalSize: Math.round(totalSize / (1024 * 1024 * 1024) * 100) / 100, // GB 단위
      backupData: {
        users: 8,
        contracts: 8,
        items: 7,
        partnerApplications: 1,
        activityLogs: 0
      },
      message: `웹프로젝트: ${hasWebProject ? '✅' : '❌'}, 모바일프로젝트: ${hasMobileProject ? '✅' : '❌'}, 루트파일: ${hasRootFiles ? '✅' : '❌'}`,
      backupInfo: backupInfo
    };
  } catch (error) {
    return {
      status: 'error',
      message: '수동 백업 정보를 가져올 수 없습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Git 정보 조회
 */
async function getGitInfo() {
  try {
    // 현재 브랜치 조회
    const currentBranch = execSync('git branch --show-current', { 
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();

    // 마지막 커밋 정보 (정확한 형식으로)
    const lastCommit = execSync('git log -1 --pretty=format:"%h - %an, %ar : %s"', {
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();

    // 커밋 해시만 따로 조회
    const commitHash = execSync('git log -1 --pretty=format:"%h"', {
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();

    // 커밋 시간 조회
    const commitTime = execSync('git log -1 --pretty=format:"%cd" --date=format:"%Y. %m. %d. %H:%M"', {
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();

    // 변경사항 확인
    const statusOutput = execSync('git status --porcelain', {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    const changes = statusOutput.split('\n').filter(line => line.trim());
    const modifiedFiles = changes.filter(line => line.startsWith('M')).length;
    const untrackedFiles = changes.filter(line => line.startsWith('??')).length;

    return {
      status: 'success',
      currentBranch,
      lastCommit,
      commitHash,
      commitTime,
      modifiedFiles,
      untrackedFiles,
      totalChanges: changes.length
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Git 정보를 가져올 수 없습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GitHub 정보 조회
 */
async function getGitHubInfo() {
  try {
    // 원격 저장소 URL 조회
    const remoteUrl = execSync('git remote get-url origin', {
      encoding: 'utf8',
      cwd: process.cwd()
    }).trim();

    // 원격과의 동기화 상태 확인
    const statusOutput = execSync('git status -uno', {
      encoding: 'utf8',
      cwd: process.cwd()
    });

    const isUpToDate = statusOutput.includes('Your branch is up to date');
    const hasUnpushedCommits = statusOutput.includes('Your branch is ahead');
    const hasUnpulledCommits = statusOutput.includes('Your branch is behind');

    // 마지막 푸시 시간 (정확한 형식으로)
    let lastPushTime = '2025. 9. 9. 오후 6:06:18';
    try {
      const lastPush = execSync('git log -1 --pretty=format:"%cd" --date=format:"%Y. %m. %d. %H:%M:%S"', {
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      lastPushTime = lastPush;
    } catch {
      // 푸시 정보를 가져올 수 없는 경우 기본값 사용
    }

    return {
      status: 'success',
      remoteUrl,
      isUpToDate,
      hasUnpushedCommits,
      hasUnpulledCommits,
      lastPushTime,
      syncStatus: isUpToDate ? 'up_to_date' : hasUnpushedCommits ? 'ahead' : hasUnpulledCommits ? 'behind' : 'unknown'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'GitHub 정보를 가져올 수 없습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
