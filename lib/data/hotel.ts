import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getHotelById(id: string) {
  return prisma.hotel.findUnique({
    where: { id },
    include: { location: true },
  });
}

export async function getAllHotels() {
  return prisma.hotel.findMany({
    take: 50,
    include: { location: true },
    orderBy: { rating: 'desc' },
  });
}

export async function searchHotels(query: string, filters?: { minPrice?: number; maxPrice?: number; minRating?: number; location?: string }, skip: number = 0, take: number = 5) {
  const mode = 'insensitive';
  const where: Prisma.HotelWhereInput = {};

  if (query) {
    where.OR = [{ name: { contains: query, mode } }, { location: { name: { contains: query, mode } } }];
  }

  if (filters?.minPrice || filters?.maxPrice) {
    where.pricePerNight = {};
    if (filters.minPrice) where.pricePerNight.gte = filters.minPrice;
    if (filters.maxPrice) where.pricePerNight.lte = filters.maxPrice;
  }

  if (filters?.minRating) {
    where.rating = { gte: filters.minRating };
  }

  if (filters?.location) {
    where.location = { name: { contains: filters.location, mode } };
  }

  const [data, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      orderBy: query ? undefined : { rating: 'desc' },
      take,
      skip,
      include: { location: true },
    }),
    prisma.hotel.count({ where }),
  ]);

  return { data, total };
}
