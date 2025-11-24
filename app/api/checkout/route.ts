import { prisma } from '@/lib/prisma';
import { getUserProfile } from '@/lib/data/index';
import { findIdempotencyKey, createIdempotencyKey, markIdempotencyUsed } from '@/lib/providers/idempotency';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const {
    tripId,
    proceedIfConflicts = false,
    paymentMethodId,
    toolCallId,
  } = body as {
    tripId?: string;
    proceedIfConflicts?: boolean;
    paymentMethodId?: string;
    toolCallId?: string;
  };

  const user = await getUserProfile();
  if (!user) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401 });
  if (!tripId) return new Response(JSON.stringify({ error: 'missing_trip_id' }), { status: 400 });

  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { bookings: true, user: { include: { paymentMethods: true, calendar: true } } } });
  if (!trip) return new Response(JSON.stringify({ error: 'trip_not_found' }), { status: 404 });
  if (trip.userId !== user.id) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });

  // Payment method check
  const userPaymentMethods = trip.user?.paymentMethods ?? [];
  const hasPayment = (paymentMethodId && userPaymentMethods.some((p) => p.id === paymentMethodId)) || userPaymentMethods.length > 0;
  if (!hasPayment) {
    return new Response(JSON.stringify({ error: 'no_payment_method', redirect: '/profile' }), { status: 400 });
  }

  // Idempotency: avoid duplicate checkout processing if toolCallId provided
  if (toolCallId) {
    const existing = await findIdempotencyKey(toolCallId);
    if (existing && existing.used) {
      return new Response(JSON.stringify({ error: 'duplicate_tool_call' }), { status: 409 });
    }
    if (!existing) {
      await createIdempotencyKey(toolCallId, { toolCallId });
    }
  }

  // Check calendar conflicts
  const conflicts: Array<{ bookingId: string; eventId: string; eventTitle: string }> = [];
  for (const booking of trip.bookings) {
    const overlapping = await prisma.calendarEvent.findMany({ where: { userId: user.id, AND: [{ start: { lte: booking.endDate } }, { end: { gte: booking.startDate } }] } });
    for (const ev of overlapping) {
      conflicts.push({ bookingId: booking.id, eventId: ev.id, eventTitle: ev.title });
    }
  }

  if (conflicts.length > 0 && !proceedIfConflicts) {
    return new Response(JSON.stringify({ error: 'conflict', conflicts }), { status: 409 });
  }

  // Finalize bookings (mock): mark each booking CONFIRMED
  const updatedBookings = [] as any[];
  for (const booking of trip.bookings) {
    const ub = await prisma.booking.update({ where: { id: booking.id }, data: { status: 'CONFIRMED' } });
    updatedBookings.push(ub);
  }

  const updatedTrip = await prisma.trip.update({ where: { id: trip.id }, data: { status: 'CONFIRMED', paymentMethodId: paymentMethodId ?? trip.paymentMethodId } });

  // Mark idempotency used after successful finalization
  if (toolCallId) {
    try {
      await markIdempotencyUsed(toolCallId);
    } catch {
      // ignore
    }
  }

  return new Response(JSON.stringify({ success: true, trip: updatedTrip, bookings: updatedBookings }));
}
