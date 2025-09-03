import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// 임시 JSON 파일 기반 저장 (Prisma 클라이언트 생성 오류 해결 전까지)
const PROFIT_ITEMS_FILE = join(process.cwd(), 'data', 'profit-items.json');

// 수익 아이템 타입 정의
interface ProfitItem {
  id: string;
  name: string;
  status: string;
  isDefault: boolean;
  insurance: number;
  telecom: number;
  rental: number;
  events: number;
  insurancePercent: number;
  telecomPercent: number;
  rentalPercent: number;
  eventsPercent: number;
  insuranceName: string;
  telecomName: string;
  rentalName: string;
  eventsName: string;
  createdAt: string;
  updatedAt: string;
}

interface ProfitItemsData {
  items: ProfitItem[];
  lastUpdated: string;
}

// 데이터 디렉토리 생성
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), 'data');
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }
};

// 파일에서 데이터 읽기
const readProfitItems = (): ProfitItemsData => {
  try {
    ensureDataDir();
    if (existsSync(PROFIT_ITEMS_FILE)) {
      const data = readFileSync(PROFIT_ITEMS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error: unknown) {
    console.error('파일 읽기 오류:', error);
  }
  return { items: [], lastUpdated: new Date().toISOString() };
};

// 파일에 데이터 쓰기
const writeProfitItems = (data: ProfitItemsData): boolean => {
  try {
    ensureDataDir();
    writeFileSync(PROFIT_ITEMS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error: unknown) {
    console.error('파일 쓰기 오류:', error);
    return false;
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, isDefault } = body;

    // 기존 데이터 읽기
    const existingData = readProfitItems();
    
    // 최종 결정 데이터만 필터링 (isDefault: false인 것들)
    const finalItems = existingData.items.filter((item: ProfitItem) => item.isDefault === false);
    
    // 새로운 아이템들 추가 (isDefault: false로 설정)
    const newItems: ProfitItem[] = items.map((item: Record<string, unknown>) => ({
      id: (item.id as string) || Date.now().toString(),
      name: (item.name as string) || '',
      status: 'active',
      isDefault: isDefault || false,
      insurance: (item.insurance as number) || 0,
      telecom: (item.telecom as number) || 0,
      rental: (item.rental as number) || 0,
      events: (item.events as number) || 0,
      insurancePercent: (item.insurancePercent as number) || 30,
      telecomPercent: (item.telecomPercent as number) || 30,
      rentalPercent: (item.rentalPercent as number) || 40,
      eventsPercent: (item.eventsPercent as number) || 100,
      insuranceName: (item.insuranceName as string) || '보험료(월)',
      telecomName: (item.telecomName as string) || '통신비(월)',
      rentalName: (item.rentalName as string) || '렌탈료(월)',
      eventsName: (item.eventsName as string) || '이벤트(건)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // 최종 결정 데이터로 저장
    const updatedData: ProfitItemsData = {
      items: [...finalItems, ...newItems],
      lastUpdated: new Date().toISOString()
    };

    // 파일에 저장
    const success = writeProfitItems(updatedData);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '수익아이템이 성공적으로 저장되었습니다.',
        items: newItems
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '파일 저장 중 오류가 발생했습니다.'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('수익아이템 저장 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '수익아이템 저장 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 최종 결정 데이터 조회
    const data = readProfitItems();
    const finalItems = data.items.filter((item: ProfitItem) => 
      item.isDefault === false && item.status === 'active'
    );

    return NextResponse.json({
      success: true,
      items: finalItems
    });

  } catch (error: unknown) {
    console.error('수익아이템 조회 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '수익아이템 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
