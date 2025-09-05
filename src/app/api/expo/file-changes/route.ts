import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Git을 사용하여 파일 변경 감지
    const { stdout } = await execAsync('git status --porcelain');
    const changes = stdout.trim().split('\n').filter(line => line.trim()).map((line, index) => {
      const [status, file] = line.split(' ').filter(Boolean);
      let type: 'added' | 'modified' | 'deleted' = 'modified';
      
      if (status.includes('A')) type = 'added';
      else if (status.includes('D')) type = 'deleted';
      else if (status.includes('M')) type = 'modified';
      
      return {
        id: `change-${index}`,
        path: file,
        type,
        timestamp: new Date().toISOString(),
        size: 0 // 실제 구현에서는 파일 크기를 가져올 수 있음
      };
    });

    return NextResponse.json({
      success: true,
      changes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      changes: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
