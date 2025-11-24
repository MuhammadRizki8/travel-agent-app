'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/data/index';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Cek apakah ada jadwal booking yang bentrok dengan Calendar Event user
export type ConflictItem = {
  bookingId: string;
  bookingType?: string | null;
  bookingStart?: string | null;
  bookingEnd?: string | null;
  eventId: string;
  eventTitle?: string | null;
  eventStart?: string | null;
  eventEnd?: string | null;
  message: string;
};

export async function validateTripConflicts(tripId: string): Promise<ConflictItem[]> {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // 1. Ambil semua booking dalam trip ini
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { bookings: true },
  });

  if (!trip) throw new Error('Trip not found');

  // 2. Ambil semua calendar event user
  const calendarEvents = await prisma.calendarEvent.findMany({
    where: { userId },
  });

  const conflicts: ConflictItem[] = [];

  // 3. Cek Overlap — normalize dates and compare using epoch ms
  for (const booking of trip.bookings) {
    const bStart = booking.startDate ? new Date(booking.startDate).getTime() : null;
    const bEnd = booking.endDate ? new Date(booking.endDate).getTime() : null;

    for (const event of calendarEvents) {
      const eStart = event.start ? new Date(event.start).getTime() : null;
      const eEnd = event.end ? new Date(event.end).getTime() : null;

      if (bStart === null || bEnd === null || eStart === null || eEnd === null) continue;

      // Overlap logic: (bStart < eEnd) && (bEnd > eStart)
      const isOverlapping = bStart < eEnd && bEnd > eStart;

      if (isOverlapping) {
        conflicts.push({
          bookingId: booking.id,
          bookingType: booking.type ?? null,
          bookingStart: booking.startDate ? new Date(booking.startDate).toISOString() : null,
          bookingEnd: booking.endDate ? new Date(booking.endDate).toISOString() : null,
          eventId: event.id,
          eventTitle: event.title ?? null,
          eventStart: event.start ? new Date(event.start).toISOString() : null,
          eventEnd: event.end ? new Date(event.end).toISOString() : null,
          message: `Booking ${booking.type ?? booking.id} conflicts with calendar event ${event.title ?? event.id}`,
        });
      }
    }
  }

  return conflicts;
}

// Proses Final Checkout
export async function processCheckoutAction(tripId: string, paymentMethodId: string, options?: { doRedirect?: boolean }) {
  const userId = await getUserId();
  if (!userId) throw new Error('Unauthorized');

  // Database Transaction untuk menjamin integritas data
  await prisma.$transaction(async (tx) => {
    // 1. Update Status Trip
    await tx.trip.update({
      where: { id: tripId },
      data: {
        status: 'CONFIRMED',
        paymentMethodId: paymentMethodId,
      },
    });

    // 2. Update Status Semua Booking di dalamnya
    await tx.booking.updateMany({
      where: { tripId },
      data: {
        status: 'CONFIRMED',
      },
    });

    // 3. (Opsional) Masukkan Trip ke Calendar User otomatis
    const trip = await tx.trip.findUnique({ where: { id: tripId } });
    if (trip && trip.startDate && trip.endDate) {
      await tx.calendarEvent.create({
        data: {
          userId,
          title: `Trip: ${trip.name}`,
          start: trip.startDate,
          end: trip.endDate,
          description: trip.description || 'Trip confirmed via TravelAgent.ai',
          isAllDay: true,
        },
      });
    }
  });

  revalidatePath('/trips');

  const doRedirect = options?.doRedirect ?? true;
  if (doRedirect) {
    // Preserve original behavior for callers that expect a server redirect
    redirect(`/trips/${tripId}`);
    // redirect will throw; unreachable beyond this point
  }

  // When not redirecting, return a structured result so API routes or tools can handle it.
  return { success: true, tripId } as const;
}
