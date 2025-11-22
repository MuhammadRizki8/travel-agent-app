import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getActivityById(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: { location: true },
  });
}

export async function getAllActivities() {
  return prisma.activity.findMany({
    take: 50,
    include: { location: true },
    orderBy: { price: 'asc' },
  });
}

export async function searchActivities(query: string, filters?: { minPrice?: number; maxPrice?: number; location?: string }, skip: number = 0, take: number = 5) {
  const mode = 'insensitive';
  const where: Prisma.ActivityWhereInput = {};

  if (query) {
    where.OR = [{ name: { contains: query, mode } }, { location: { name: { contains: query, mode } } }];
  }

  if (filters?.minPrice || filters?.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  if (filters?.location) {
    where.location = { name: { contains: filters.location, mode } };
  }

  const [data, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      orderBy: { price: 'asc' },
      take,
      skip,
      include: { location: true },
    }),
    prisma.activity.count({ where }),
  ]);

  return { data, total };
}
