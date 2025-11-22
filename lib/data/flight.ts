import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function getFlightById(id: string) {
  return prisma.flight.findUnique({
    where: { id },
    include: { origin: true, destination: true },
  });
}

export async function getAllFlights() {
  return prisma.flight.findMany({
    take: 50,
    include: { origin: true, destination: true },
    orderBy: { departure: 'asc' },
    where: {
      departure: { gte: new Date() },
      availableSeats: { gt: 0 },
    },
  });
}

export async function searchFlights(query: string, filters?: { minPrice?: number; maxPrice?: number; airline?: string; origin?: string; destination?: string; date?: string }, skip: number = 0, take: number = 5) {
  const mode = 'insensitive';
  const where: Prisma.FlightWhereInput = {
    availableSeats: { gt: 0 },
  };

  // Date filter logic
  if (filters?.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setDate(endDate.getDate() + 1);

    where.departure = {
      gte: startDate,
      lt: endDate,
    };
  } else {
    // Default: upcoming flights
    where.departure = { gte: new Date() };
  }

  if (query) {
    where.OR = [
      { originCode: { contains: query, mode } },
      { destCode: { contains: query, mode } },
      { airline: { contains: query, mode } },
      { origin: { name: { contains: query, mode } } },
      { destination: { name: { contains: query, mode } } },
    ];
  }

  if (filters?.minPrice || filters?.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  if (filters?.airline) {
    where.airline = { contains: filters.airline, mode };
  }

  if (filters?.origin) {
    where.origin = { name: { contains: filters.origin, mode } };
  }

  if (filters?.destination) {
    where.destination = { name: { contains: filters.destination, mode } };
  }

  const [data, total] = await Promise.all([
    prisma.flight.findMany({
      where,
      orderBy: { departure: 'asc' },
      take,
      skip,
      include: { origin: true, destination: true },
    }),
    prisma.flight.count({ where }),
  ]);

  return { data, total };
}

export async function getUniqueAirlines() {
  const flights = await prisma.flight.findMany({
    select: { airline: true },
    distinct: ['airline'],
    orderBy: { airline: 'asc' },
  });
  return flights.map((f) => f.airline);
}
