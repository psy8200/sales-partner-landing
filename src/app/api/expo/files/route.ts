import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

const NATIVE_APP_PATH = 'C:\\home\\sales-partner-mobile-app\\SalesPartnerApp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    const path = searchParams.get('path') || '';

    switch (action) {
      case 'list':
        return await listFiles(path);
      case 'read':
        return await readFileContent(path);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, path, content } = await request.json();

    switch (action) {
      case 'write':
        return await writeFileContent(path, content);
      case 'create':
        return await createFile(path, content);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 파일 목록 가져오기
async function listFiles(relativePath: string) {
  try {
    const fullPath = join(NATIVE_APP_PATH, relativePath);
    const items = await readdir(fullPath, { withFileTypes: true });
    
    const files = await Promise.all(
      items.map(async (item) => {
        const itemPath = join(fullPath, item.name);
        const stats = await stat(itemPath);
        
        return {
          name: item.name,
          path: join(relativePath, item.name).replace(/\\/g, '/'),
          type: item.isDirectory() ? 'folder' : 'file',
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
    );

    return NextResponse.json({
      success: true,
      files: files.sort((a, b) => {
        // 폴더를 먼저, 그 다음 파일
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      }),
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files',
    });
  }
}

// 파일 내용 읽기
async function readFileContent(relativePath: string) {
  try {
    const fullPath = join(NATIVE_APP_PATH, relativePath);
    const content = await readFile(fullPath, 'utf-8');
    
    return NextResponse.json({
      success: true,
      content,
      path: relativePath,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    });
  }
}

// 파일 내용 쓰기
async function writeFileContent(relativePath: string, content: string) {
  try {
    const fullPath = join(NATIVE_APP_PATH, relativePath);
    await writeFile(fullPath, content, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'File saved successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to write file',
    });
  }
}

// 새 파일 생성
async function createFile(relativePath: string, content: string = '') {
  try {
    const fullPath = join(NATIVE_APP_PATH, relativePath);
    await writeFile(fullPath, content, 'utf-8');
    
    return NextResponse.json({
      success: true,
      message: 'File created successfully',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create file',
    });
  }
}
