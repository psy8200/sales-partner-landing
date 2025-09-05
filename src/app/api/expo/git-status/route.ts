import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Git 브랜치 정보
    const { stdout: branchOutput } = await execAsync('git branch --show-current');
    const branch = branchOutput.trim();

    // Git 상태
    const { stdout: statusOutput } = await execAsync('git status --porcelain');
    const changes = statusOutput.trim().split('\n').filter(line => line.trim()).length;

    // 마지막 커밋 정보
    const { stdout: lastCommitOutput } = await execAsync('git log -1 --format=%H %ci');
    const [lastCommitHash, lastCommitDate] = lastCommitOutput.trim().split(' ');

    return NextResponse.json({
      success: true,
      branch,
      status: changes === 0 ? 'clean' : 'dirty',
      changes,
      lastCommit: lastCommitDate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      branch: 'unknown',
      status: 'unknown',
      changes: 0,
      lastCommit: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
