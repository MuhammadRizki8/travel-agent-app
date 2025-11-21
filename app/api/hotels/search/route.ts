import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');

  if (!city) {
    return NextResponse.json({ error: 'City is required' }, { status: 400 });
  }

  const hotels = await prisma.hotel.findMany({
    where: {
      city: { contains: city, mode: 'insensitive' },
    },
  });

  return NextResponse.json(hotels);
}
