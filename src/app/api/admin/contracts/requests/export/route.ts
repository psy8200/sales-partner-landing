import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ExcelExporter } from '@/lib/excel';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ids = (searchParams.get('ids') || '').split(',').filter(Boolean);

    const where: Record<string, unknown> = {};
    if (ids.length > 0) where.id = { in: ids };

    const items = await prisma.partnerApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, phone: true, address: true } },
      },
    });

    const rows = items.map(it => ({
      ID: it.id,
      고객명: it.user?.name || '-',
      연락처: it.user?.phone || '-',
      지역: it.user?.address || '-',
      상담가능시간: it.availableTime || '-',
      메모: it.additionalNote || '-',
      상태: it.status,
      배정자: it.processedBy || '',
      배정일: it.processedAt || '',
      신청일: it.createdAt,
    }));

    const exporter = new ExcelExporter();
    exporter.addWorksheet(rows, '상담신청');
    const buffer = exporter.generateBuffer();

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="consult-requests.xlsx"`,
      },
    });
  } catch (error: unknown) {
    console.error('GET /api/admin/contracts/requests/export error', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



