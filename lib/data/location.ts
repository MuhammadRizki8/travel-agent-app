import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type LocationWithDetails = Prisma.LocationGetPayload<{
  include: {
    hotels: true;
    activities: true;
    arrivals: {
      include: { origin: true };
    };
  };
}>;

export async function getLocationById(id: string): Promise<LocationWithDetails | null> {
  return prisma.location.findUnique({
    where: { id },
    include: {
      hotels: true,
      activities: true,
      arrivals: {
        include: { origin: true },
        where: {
          departure: { gte: new Date() },
          availableSeats: { gt: 0 },
        },
        orderBy: { departure: 'asc' },
        take: 3,
      },
    },
  });
}

export async function getAllLocations() {
  return prisma.location.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function searchLocations(query: string, filters?: { country?: string }, skip: number = 0, take: number = 5) {
  const mode = 'insensitive';
  const where: Prisma.LocationWhereInput = {};

  if (query) {
    where.OR = [{ name: { contains: query, mode } }, { code: { contains: query, mode } }, { country: { contains: query, mode } }];
  }

  if (filters?.country) {
    where.country = { contains: filters.country, mode };
  }

  const [data, total] = await Promise.all([
    prisma.location.findMany({
      where,
      orderBy: { name: 'asc' },
      take,
      skip,
    }),
    prisma.location.count({ where }),
  ]);

  return { data, total };
}

export async function getUniqueCountries() {
  const locations = await prisma.location.findMany({
    select: { country: true },
    distinct: ['country'],
    orderBy: { country: 'asc' },
  });
  return locations.map((l) => l.country);
}
