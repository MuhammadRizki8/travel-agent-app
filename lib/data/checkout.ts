'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/data/index';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Cek apakah ada jadwal booking yang bentrok dengan Calendar Event user
export async function validateTripConflicts(tripId: string) {
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

  const conflicts: string[] = [];

  // 3. Cek Overlap
  for (const booking of trip.bookings) {
    for (const event of calendarEvents) {
      // Logika Overlap: (StartA < EndB) dan (EndA > StartB)
      const isOverlapping = booking.startDate < event.end && booking.endDate > event.start;

      if (isOverlapping) {
        conflicts.push(`Booking "${booking.type}" conflic with event "${event.title}" (${event.start.toLocaleDateString()})`);
      }
    }
  }

  return conflicts;
}

// Proses Final Checkout
export async function processCheckoutAction(tripId: string, paymentMethodId: string) {
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
  redirect(`/trips/${tripId}`);
}
