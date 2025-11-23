export async function POST(req: Request) {
  try {
    const body = await req.json();
    const formLike = {
      get(key: string) {
        const val = body?.[key];
        if (val === undefined) return null;
        return String(val);
      },
    } as unknown as FormData;

    const { addCalendarEvent } = await import('@/lib/data/profile');
    await addCalendarEvent(formLike);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('POST /api/profile/calendar failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
