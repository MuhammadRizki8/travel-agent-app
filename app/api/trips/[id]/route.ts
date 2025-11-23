import { getTripById } from '@/lib/data/trip';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    const trip = await getTripById(id);
    if (!trip) return new Response(null, { status: 404 });

    return new Response(JSON.stringify(trip), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/trips/[id] failed:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}

export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    const body = await req.json();
    const formLike = {
      get(key: string) {
        const val = body?.[key];
        if (val === undefined) return null;
        return String(val);
      },
    } as unknown as FormData;

    const { updateTripAction } = await import('@/lib/data/trip');
    const result = await updateTripAction(id, formLike);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('PUT /api/trips/[id] failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    const { deleteTripAction } = await import('@/lib/data/trip');
    const result = await deleteTripAction(id);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('DELETE /api/trips/[id] failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
