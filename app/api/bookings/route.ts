import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Create a FormData-like shim with a .get() to satisfy server action signature
    const formLike = {
      get(key: string) {
        // Return null if missing to mimic FormData behavior
        const val = body?.[key];
        if (val === undefined) return null;
        return String(val);
      },
    } as unknown as FormData;

    const { createBookingAction } = await import('@/lib/data/booking');
    const result = await createBookingAction(null, formLike);

    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('POST /api/bookings failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
