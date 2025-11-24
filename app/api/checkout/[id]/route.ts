import { processCheckoutAction } from '@/lib/data/checkout';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const body = await req.json();
    const paymentMethodId = body?.paymentMethodId;
    if (!paymentMethodId) {
      return new Response(JSON.stringify({ success: false, error: 'missing paymentMethodId' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { id } = await context.params;
    // Prefer non-throwing finalizer so we can return a structured JSON result
    const result = await processCheckoutAction(id, paymentMethodId, { doRedirect: false });
    // Build an absolute redirect to trips page for client convenience
    const host = req.headers.get('host');
    const proto = req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol') || 'http';
    const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
    const redirectUrl = new URL(`/trips/${id}`, origin).toString();
    return new Response(JSON.stringify({ success: true, result, redirect: redirectUrl }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('POST /api/checkout/[id] failed:', err);
    return new Response(JSON.stringify({ success: false }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
