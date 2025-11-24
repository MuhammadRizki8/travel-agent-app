'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from './user';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';

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
    const startDateObj = new Date(startDateStr);
    const endDateObj = new Date(endDateStr);

    const data: any = {
      type,
      totalAmount,
      bookingDetails: details,
      startDate: startDateObj,
      endDate: endDateObj,
      status: 'CONFIRMED',
      trip: { connect: { id: tripId } },
    };

    if (type === 'FLIGHT') data.flight = { connect: { id: itemId } };
    if (type === 'HOTEL') data.hotel = { connect: { id: itemId } };
    if (type === 'ACTIVITY') data.activity = { connect: { id: itemId } };

    await prisma.booking.create({ data });

    revalidatePath(`/trips/${tripId}`);
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal membuat booking' };
  }
}

export async function getBookingById(bookingId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      trip: true,
      flight: { include: { origin: true, destination: true } },
      hotel: { include: { location: true } },
      activity: { include: { location: true } },
    },
  });

  if (!booking || booking.trip.userId !== userId) {
    return null;
  }

  return booking;
}

export async function updateBookingStatusAction(bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'REJECTED') {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking || booking.trip.userId !== userId) {
      return { success: false, error: 'Booking not found or unauthorized' };
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    revalidatePath(`/trips/${booking.tripId}`);
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal memperbarui status booking' };
  }
}

export async function deleteBookingAction(bookingId: string) {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trip: true },
    });

    if (!booking || booking.trip.userId !== userId) {
      return { success: false, error: 'Booking not found or unauthorized' };
    }

    await prisma.booking.delete({
      where: { id: bookingId },
    });

    revalidatePath(`/trips/${booking.tripId}`);
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Gagal menghapus booking' };
  }
}
