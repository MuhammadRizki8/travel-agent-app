import { prisma } from '@/lib/prisma';

// --- Single Item Fetchers ---

export async function getFlightById(id: string) {
  return prisma.flight.findUnique({
    where: { id },
    include: { origin: true, destination: true },
  });
}

export async function getHotelById(id: string) {
  return prisma.hotel.findUnique({
    where: { id },
    include: { location: true },
  });
}

export async function getActivityById(id: string) {
  return prisma.activity.findUnique({
    where: { id },
    include: { location: true },
  });
}

// --- List Fetchers (for Dropdowns/Modals) ---

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

export async function getAllHotels() {
  return prisma.hotel.findMany({
    take: 50,
    include: { location: true },
    orderBy: { rating: 'desc' },
  });
}

export async function getAllActivities() {
  return prisma.activity.findMany({
    take: 50,
    include: { location: true },
    orderBy: { price: 'asc' },
  });
}
