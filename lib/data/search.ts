import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const ITEMS_PER_PAGE = 5;

export async function getListingMaster(type: 'flight' | 'hotel' | 'activity' | 'location', query: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;
  const mode = 'insensitive';

  try {
    if (type === 'flight') {
      const where: Prisma.FlightWhereInput = {
        departure: { gte: new Date() },
        availableSeats: { gt: 0 },
      };

      if (query) {
        where.OR = [
          { originCode: { contains: query, mode } },
          { destCode: { contains: query, mode } },
          { airline: { contains: query, mode } },
          { origin: { name: { contains: query, mode } } },
          { destination: { name: { contains: query, mode } } },
        ];
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
    }

    if (type === 'hotel') {
      const where: Prisma.HotelWhereInput = {};

      if (query) {
        where.OR = [{ name: { contains: query, mode } }, { location: { name: { contains: query, mode } } }];
      }

      const [data, total] = await Promise.all([
        prisma.hotel.findMany({
          where,
          orderBy: query ? undefined : { rating: 'desc' },
          take: ITEMS_PER_PAGE,
          skip,
          include: { location: true },
        }),
        prisma.hotel.count({ where }),
      ]);

      return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
    }

    if (type === 'activity') {
      const where: Prisma.ActivityWhereInput = {};

      if (query) {
        where.OR = [{ name: { contains: query, mode } }, { location: { name: { contains: query, mode } } }];
      }

      const [data, total] = await Promise.all([
        prisma.activity.findMany({
          where,
          orderBy: { price: 'asc' },
          take: ITEMS_PER_PAGE,
          skip,
          include: { location: true },
        }),
        prisma.activity.count({ where }),
      ]);

      return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
    }

    // LOCATION
    const where: Prisma.LocationWhereInput = {};

    if (query) {
      where.OR = [{ name: { contains: query, mode } }, { code: { contains: query, mode } }, { country: { contains: query, mode } }];
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
  } catch (error) {
    console.error('Error in getListingMaster:', error);
    return { data: [], total: 0, totalPages: 0 };
  }
}
