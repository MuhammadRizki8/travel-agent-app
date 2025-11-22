'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from './user';
import { revalidatePath } from 'next/cache';

export async function getUserTrips(userId: string) {
  const currentUserId = await getUserId();
  if (userId !== currentUserId) {
    throw new Error('Unauthorized access to trips');
  }

  return prisma.trip.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    include: {
      bookings: {
        select: { id: true, type: true, status: true, totalAmount: true, startDate: true, endDate: true },
      },
    },
  });
}

export async function getTripById(tripId: string) {
  const currentUserId = await getUserId();

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      bookings: {
        orderBy: { startDate: 'asc' },
        include: {
          flight: { include: { origin: true, destination: true } },
          hotel: { include: { location: true } },
          activity: { include: { location: true } },
        },
      },
      user: {
        include: {
          paymentMethods: true,
        },
      },
    },
  });

  if (trip && trip.userId !== currentUserId) {
    throw new Error('Unauthorized access to trip');
  }

  return trip;
}

export async function createTripAction(prevState: unknown, formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;

  if (!name) {
    return { success: false, error: 'Nama trip wajib diisi' };
  }

  try {
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    if (startDate && endDate && endDate <= startDate) {
      return { success: false, error: 'Tanggal selesai harus setelah tanggal mulai' };
    }

    // Create Trip
    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        description,
        startDate,
        endDate,
        status: 'DRAFT',
      },
    });

    revalidatePath('/trips');
    return { success: true, error: '', tripId: trip.id };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Terjadi kesalahan saat membuat trip' };
  }
}

export async function createBookingAction(prevState: unknown, formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const tripId = formData.get('tripId') as string;
  const type = formData.get('type') as 'FLIGHT' | 'HOTEL' | 'ACTIVITY';
  const itemId = formData.get('itemId') as string;
  const startDateStr = formData.get('startDate') as string;
  const endDateStr = formData.get('endDate') as string;
  const totalAmount = parseInt(formData.get('totalAmount') as string);
  const details = formData.get('details') as string;

  if (!tripId || !type || !itemId || !startDateStr || !endDateStr || !totalAmount) {
    return { success: false, error: 'Data booking tidak lengkap' };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookingData: any = {
      tripId,
      type,
      totalAmount,
      bookingDetails: details,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      status: 'PENDING_APPROVAL',
    };

    if (type === 'FLIGHT') bookingData.flightId = itemId;
    if (type === 'HOTEL') bookingData.hotelId = itemId;
    if (type === 'ACTIVITY') bookingData.activityId = itemId;

    await prisma.booking.create({
      data: bookingData,
    });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal membuat booking' };
  }
}
