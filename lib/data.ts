import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const ITEMS_PER_PAGE = 5;

export async function getData(type: 'flight' | 'hotel' | 'activity' | 'location', query: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  if (type === 'flight') {
    const where: Prisma.FlightWhereInput = {
      departure: { gte: new Date() },
      availableSeats: { gt: 0 },
    };

    if (query) {
      where.OR = [{ originCode: { contains: query, mode: 'insensitive' } }, { destCode: { contains: query, mode: 'insensitive' } }, { airline: { contains: query, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        orderBy: { departure: 'asc' },
        take: ITEMS_PER_PAGE,
        skip,
        include: { origin: true, destination: true },
      }),
      prisma.flight.count({ where }),
    ]);

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  } else if (type === 'hotel') {
    const where: Prisma.HotelWhereInput = {};

    if (query) {
      where.OR = [{ name: { contains: query, mode: 'insensitive' } }, { location: { name: { contains: query, mode: 'insensitive' } } }];
    }

    const [data, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        orderBy: query ? undefined : { rating: 'desc' }, // Discovery: Rating tertinggi
        take: ITEMS_PER_PAGE,
        skip,
        include: { location: true },
      }),
      prisma.hotel.count({ where }),
    ]);

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  } else if (type === 'activity') {
    const where: Prisma.ActivityWhereInput = {};

    if (query) {
      where.OR = [{ name: { contains: query, mode: 'insensitive' } }, { location: { name: { contains: query, mode: 'insensitive' } } }];
    }

    const [data, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy: { price: 'asc' }, // Discovery: Harga termurah
        take: ITEMS_PER_PAGE,
        skip,
        include: { location: true },
      }),
      prisma.activity.count({ where }),
    ]);

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  } else {
    // LOCATION
    const where: Prisma.LocationWhereInput = {};

    if (query) {
      where.OR = [{ name: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }, { country: { contains: query, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      prisma.location.findMany({
        where,
        orderBy: { name: 'asc' },
        take: ITEMS_PER_PAGE,
        skip,
      }),
      prisma.location.count({ where }),
    ]);

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  }
}

export async function getUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@travel.com' },
    });
    return user?.id || null;
  } catch (e) {
    console.error('Gagal ambil user ID', e);
    return null;
  }
}
