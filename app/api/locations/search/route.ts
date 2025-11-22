import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // Cari lokasi berdasarkan Nama atau Kode (IATA)
    const locations = await prisma.location.findMany({
      where: {
        OR: [{ name: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }],
      },
      take: 10, // Limit autocomplete
    });

    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
