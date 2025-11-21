import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  // Validasi input dasar
  if (!origin || !destination) {
    return NextResponse.json({ error: 'Origin and Destination are required' }, { status: 400 });
  }

  // Cari penerbangan yang cocok
  const flights = await prisma.flight.findMany({
    where: {
      // Gunakan mode insensitif agar "jkt" cocok dengan "JKT"
      origin: { equals: origin, mode: 'insensitive' },
      destination: { equals: destination, mode: 'insensitive' },
      // Hanya cari penerbangan masa depan
      departure: { gte: new Date() },
    },
    orderBy: {
      price: 'asc', // Urutkan termurah dulu (biar AI hemat)
    },
  });

  return NextResponse.json(flights);
}
