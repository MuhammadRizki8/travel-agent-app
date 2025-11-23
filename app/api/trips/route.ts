import { getUserTrips } from '@/lib/data/trip';
import { getCurrentUser } from '@/lib/data/index';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return new Response(JSON.stringify([]), { status: 200, headers: { 'content-type': 'application/json' } });

    const trips = await getUserTrips(user.id);
    return new Response(JSON.stringify(trips), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('GET /api/trips failed:', err);
    return new Response(JSON.stringify([]), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // createTripAction expects a FormData-like object with a .get() method.
    // Instead of duplicating logic, call the server helper and provide a minimal shim.
    const formLike = {
      get(key: string) {
        return body?.[key] ?? null;
      },
    } as unknown as FormData;

    const { createTripAction } = await import('@/lib/data/trip');
    const result = await createTripAction(null, formLike);

    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('POST /api/trips failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
