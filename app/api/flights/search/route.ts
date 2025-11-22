import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Params
  const origin = searchParams.get('origin'); // e.g. "CGK" (Location Code)
  const destination = searchParams.get('destination'); // e.g. "DPS"
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const skip = (page - 1) * limit;

  try {
    // Filter Logic: Relasi ke Location via originCode/destCode
    const whereClause: Prisma.FlightWhereInput = {
      availableSeats: { gt: 0 },
      departure: { gte: new Date() },
    };

    if (origin) {
      whereClause.originCode = { equals: origin, mode: 'insensitive' };
    }

    if (destination) {
      whereClause.destCode = { equals: destination, mode: 'insensitive' };
    }

    // Transaction: Get Data + Count Total
    const [flights, total] = await prisma.$transaction([
      prisma.flight.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        include: {
          origin: true, // Include detail Kota Asal
          destination: true, // Include detail Kota Tujuan
        },
        orderBy: { departure: 'asc' }, // Urutkan berdasarkan keberangkatan terdekat
      }),
      prisma.flight.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: flights,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
