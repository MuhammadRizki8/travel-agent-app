// This public booking endpoint has been deprecated and moved to
// `/api/internal/book`. Leaving this route in place to return a helpful
// deprecation response so any lingering callers fail fast and get guidance.

export async function POST() {
  return new Response(JSON.stringify({ error: 'moved', message: 'Booking endpoint moved to /api/internal/book. Use draft+checkout flow.' }), { status: 410 });
}
