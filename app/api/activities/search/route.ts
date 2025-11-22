import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Params
  const locationQuery = searchParams.get('location'); // e.g. "Bali" atau "DPS"
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  // if (!locationQuery) {
  //   return NextResponse.json({ error: 'Location is required' }, { status: 400 });
  // }

  try {
    // Filter Logic: Cari Activity yg Location-nya cocok (Nama atau Kode)
    const whereClause: Prisma.ActivityWhereInput = {};

    if (locationQuery) {
      whereClause.location = {
        OR: [{ name: { contains: locationQuery, mode: 'insensitive' } }, { code: { equals: locationQuery, mode: 'insensitive' } }],
      };
    }

    const [activities, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        include: { location: true },
        orderBy: { price: 'asc' },
      }),
      prisma.activity.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: activities,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
