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

export async function updateTripAction(tripId: string, formData: FormData) {
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
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip || trip.userId !== userId) {
      return { success: false, error: 'Trip tidak ditemukan atau akses ditolak' };
    }

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    if (startDate && endDate && endDate <= startDate) {
      return { success: false, error: 'Tanggal selesai harus setelah tanggal mulai' };
    }

    await prisma.trip.update({
      where: { id: tripId },
      data: {
        name,
        description,
        startDate,
        endDate,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath('/trips');
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal memperbarui trip' };
  }
}

export async function deleteTripAction(tripId: string) {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip || trip.userId !== userId) {
      return { success: false, error: 'Trip tidak ditemukan atau akses ditolak' };
    }

    await prisma.trip.delete({
      where: { id: tripId },
    });

    revalidatePath('/trips');
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal menghapus trip' };
  }
}
