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
    const backupDir = path.join(process.cwd(), 'auto-backups');
    
    if (!fs.existsSync(backupDir)) {
      return {
        status: 'no_backup',
        message: '백업 폴더가 존재하지 않습니다.',
        lastBackup: null,
        backupCount: 0,
        totalSize: 0
      };
    }

    // 백업 폴더 목록 조회
    const backupFolders = fs.readdirSync(backupDir)
      .filter(item => {
        const itemPath = path.join(backupDir, item);
        return fs.statSync(itemPath).isDirectory() && item.includes('T');
      })
      .sort()
      .reverse();

    if (backupFolders.length === 0) {
      return {
        status: 'no_backup',
        message: '백업이 없습니다.',
        lastBackup: null,
        backupCount: 0,
        totalSize: 0
      };
    }

    // 최신 백업 정보
    const latestBackup = backupFolders[0];
    const latestBackupPath = path.join(backupDir, latestBackup);
    const summaryPath = path.join(latestBackupPath, 'backup-summary.json');

    let backupData = null;
    if (fs.existsSync(summaryPath)) {
      backupData = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    }

    // 백업 크기 계산
    let totalSize = 0;
    if (fs.existsSync(latestBackupPath)) {
      const files = fs.readdirSync(latestBackupPath);
      for (const file of files) {
        const filePath = path.join(latestBackupPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      }
    }

    return {
      status: 'success',
      lastBackup: latestBackup,
      backupDate: backupData?.backupDate || null,
      backupCount: backupFolders.length,
      totalSize: Math.round(totalSize / 1024), // KB 단위
      backupData: backupData ? {
        users: backupData.totalUsers || 0,
        contracts: backupData.totalContracts || 0,
        items: backupData.totalItems || 0,
        partnerApplications: backupData.totalPartnerApplications || 0,
        activityLogs: backupData.totalActivityLogs || 0
      } : null
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

    // 마지막 커밋 정보
    const lastCommit = execSync('git log -1 --pretty=format:"%h - %an, %ar : %s"', {
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

    // 마지막 푸시 시간 (대략적)
    let lastPushTime = null;
    try {
      const lastPush = execSync('git log -1 --pretty=format:"%cd" --date=iso', {
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      lastPushTime = new Date(lastPush).toLocaleString('ko-KR');
    } catch {
      // 푸시 정보를 가져올 수 없는 경우
    }

    return {
      status: 'success',
      remoteUrl,
      isUpToDate,
      hasUnpushedCommits,
      hasUnpulledCommits,
      lastPushTime,
      syncStatus: isUpToDate ? 'up_to_date' : 
                  hasUnpushedCommits ? 'ahead' : 
                  hasUnpulledCommits ? 'behind' : 'unknown'
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'GitHub 정보를 가져올 수 없습니다.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
