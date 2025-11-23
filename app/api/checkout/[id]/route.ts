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
    try {
      const result = await processCheckoutAction(id, paymentMethodId);
      return new Response(JSON.stringify({ success: true, result }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    } catch (innerErr: unknown) {
      // Detect Next.js redirect triggered by `redirect()` in server actions
      // Next throws a special error with a `digest` containing 'NEXT_REDIRECT'
      // Narrow the unknown error to safely access properties
      const maybeErr = innerErr as { digest?: unknown; message?: unknown } | undefined;
      const digest: string | undefined = typeof maybeErr?.digest === 'string' ? maybeErr.digest : typeof maybeErr?.message === 'string' ? maybeErr.message : undefined;

      if (typeof digest === 'string' && digest.includes('NEXT_REDIRECT')) {
        // Attempt to extract the target URL from the digest string
        // Format looks like: "NEXT_REDIRECT;replace;/trips/<id>;307;"
        const m = digest.match(/NEXT_REDIRECT;[^;]*;([^;]+);(\d+);/);
        if (m) {
          let url = m[1];

          // If the extracted URL is a relative path, build an absolute URL
          // using request headers or environment fallback to avoid ERR_INVALID_URL.
          try {
            if (url.startsWith('/')) {
              const host = req.headers.get('host');
              const proto = req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol') || 'http';
              const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
              url = new URL(url, origin).toString();
            }
          } catch {
            // If building absolute URL fails, fallback to trips page absolute URL
            const host = req.headers.get('host');
            const proto = req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol') || 'http';
            const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
            url = new URL(`/trips/${id}`, origin).toString();
          }

          return new Response(JSON.stringify({ success: true, redirect: url }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          });
        }
        // Fallback: return generic redirect to trips page (absolute)
        const host = req.headers.get('host');
        const proto = req.headers.get('x-forwarded-proto') || req.headers.get('x-forwarded-protocol') || 'http';
        const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || (host ? `${proto}://${host}` : 'http://localhost:3000');
        return new Response(JSON.stringify({ success: true, redirect: new URL(`/trips/${id}`, origin).toString() }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        });
      }
      throw innerErr;
    }
  } catch (err) {
    console.error('POST /api/checkout/[id] failed:', err);
    return new Response(JSON.stringify({ success: false }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
