import { NextResponse } from 'next/server';

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { deleteBookingAction } = await import('@/lib/data/booking');
    const { id } = await context.params;
    const result = await deleteBookingAction(id);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('DELETE /api/bookings/[id] failed:', err);
    return new Response(JSON.stringify({ success: false, error: 'server error' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
