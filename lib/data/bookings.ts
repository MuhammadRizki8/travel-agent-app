import { prisma } from '@/lib/prisma';
import type { BookingType, Prisma } from '@prisma/client';

export async function createTripForUser(userId: string, params: { name?: string; startDate?: Date | null; endDate?: Date | null; paymentMethodId?: string | null }) {
  const trip = await prisma.trip.create({
    data: {
      userId,
      name: params.name ?? 'Auto-created Trip',
      startDate: params.startDate ?? undefined,
      endDate: params.endDate ?? undefined,
      paymentMethodId: params.paymentMethodId ?? undefined,
    },
  });
  return trip;
}

export async function createBookingForTrip(tripId: string, payload: { type: string; totalAmount: number; bookingDetails?: string; startDate?: Date; endDate?: Date; itemId?: string }) {
  // Try to extract itemId from explicit payload or from bookingDetails JSON
  let itemId: string | undefined = payload.itemId;
  if (!itemId && payload.bookingDetails) {
    try {
      const parsed = JSON.parse(payload.bookingDetails) as Record<string, unknown>;
      if (parsed) itemId = (parsed.itemId ?? parsed.id ?? parsed.item ?? parsed.item_id) as string | undefined;
    } catch {
      // ignore parse errors
    }
  }

  const data: Prisma.BookingUncheckedCreateInput = {
    tripId,
    type: payload.type as unknown as BookingType,
    totalAmount: payload.totalAmount,
    // store minimal bookingDetails: prefer itemId only (agent draft), otherwise original payload
    bookingDetails: itemId ? JSON.stringify({ itemId }) : payload.bookingDetails ?? undefined,
    startDate: payload.startDate ?? new Date(),
    endDate: payload.endDate ?? new Date(),
    status: 'PENDING_APPROVAL',
  };

  // Set foreign key based on booking type if we have an itemId
  if (itemId) {
    if (payload.type === 'FLIGHT') data.flightId = itemId;
    if (payload.type === 'HOTEL') data.hotelId = itemId;
    if (payload.type === 'ACTIVITY') data.activityId = itemId;
  }

  const booking = await prisma.booking.create({ data: data as any });
  return booking;
}

const bookingsExport = { createTripForUser, createBookingForTrip };
export default bookingsExport;
