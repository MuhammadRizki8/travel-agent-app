import { prisma } from '@/lib/prisma';

export async function getLocationById(id: string) {
  return prisma.location.findUnique({
    where: { id },
    include: { hotels: true, activities: true },
  });
}

export async function getAllLocations() {
  return prisma.location.findMany({
    orderBy: { name: 'asc' },
  });
}
