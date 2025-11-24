// INTERNAL: This route is intended for internal tooling only.
// It was moved from `/api/book` to `/api/internal/book` to remove
// a public booking surface for the agent. Keep auth checks in place.
import { getUserProfile } from '@/lib/data/index';
import bookingTools from '@/lib/tools/bookingTools';

export async function POST(req: Request) {
  try {
    const user = await getUserProfile();
    if (!user || !user.id) return new Response(JSON.stringify({ error: 'unauthenticated' }), { status: 401 });
    const body = await req.json();
    const { optionId, params } = body as { optionId: string; params?: Record<string, unknown> };
    if (!optionId) return new Response(JSON.stringify({ error: 'missing_optionId' }), { status: 400 });

    const result = await bookingTools.bookFlight(optionId, { ...(params as any), userId: user.id });
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error('internal booking endpoint error', err);
    return new Response(JSON.stringify({ error: 'server_error', detail: String(err) }), { status: 500 });
  }
}
