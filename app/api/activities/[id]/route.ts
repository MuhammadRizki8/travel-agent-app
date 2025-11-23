import { getActivityById } from '@/lib/data/activity';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const id = segments[segments.length - 1];

    const activity = await getActivityById(id);
    if (!activity) return new Response(null, { status: 404 });

    return new Response(JSON.stringify(activity), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/activities/[id] failed:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
