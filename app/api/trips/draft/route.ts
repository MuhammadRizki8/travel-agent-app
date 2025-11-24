import { prisma } from '@/lib/prisma';
import { getUserProfile } from '@/lib/data/index';

export async function GET() {
  const user = await getUserProfile();
  if (!user) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401 });

  const trip = await prisma.trip.findFirst({ where: { userId: user.id, status: 'DRAFT' }, include: { bookings: true } });
  if (!trip) return new Response(JSON.stringify({ trip: null }));
  return new Response(JSON.stringify({ trip }));
}

export async function DELETE(req: Request) {
  const user = await getUserProfile();
  if (!user) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { tripId } = body as { tripId?: string };
  if (!tripId) return new Response(JSON.stringify({ error: 'missing_trip_id' }), { status: 400 });

  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) return new Response(JSON.stringify({ error: 'trip_not_found' }), { status: 404 });
  if (trip.userId !== user.id) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403 });

  await prisma.trip.delete({ where: { id: tripId } });
  return new Response(JSON.stringify({ success: true }));
}
