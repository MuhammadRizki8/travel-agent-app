import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tripId = url.searchParams.get('tripId');
    if (!tripId) {
      return new Response(JSON.stringify({ error: 'missing tripId' }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const { validateTripConflicts } = await import('@/lib/data/checkout');
    const conflicts = await validateTripConflicts(tripId);
    return new Response(JSON.stringify(conflicts), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('GET /api/checkout/validate failed:', err);
    return new Response(JSON.stringify([]), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
