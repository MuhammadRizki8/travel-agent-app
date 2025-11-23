export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { deleteCalendarEvent } = await import('@/lib/data/profile');
    const { id } = await context.params;
    const result = await deleteCalendarEvent(id);
    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('DELETE /api/profile/calendar/[id] failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
