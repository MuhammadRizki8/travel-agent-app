import { getUserProfile } from '@/lib/data/user';

export async function GET() {
  try {
    // Return the full user profile (includes paymentMethods and calendar) for the UI
    const user = await getUserProfile();
    return new Response(JSON.stringify(user || null), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('GET /api/user failed:', err);
    return new Response(JSON.stringify(null), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
