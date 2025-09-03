import { NextRequest, NextResponse } from 'next/server';
import { exportUsers } from '@/lib/excel';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const role = searchParams.get('role') || undefined;
    const idsParam = searchParams.get('ids');

    const filters: Record<string, unknown> = {};
    if (status) filters.status = status;
    if (role) filters.role = role;
    if (idsParam) {
      const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (ids.length > 0) filters.id = { in: ids };
    }

    const buffer = await exportUsers(filters);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="users.xlsx"',
      },
    });
  } catch (error) {
    console.error('Export users error:', error);
    return NextResponse.json({ error: 'Failed to export users' }, { status: 500 });
  }
}
