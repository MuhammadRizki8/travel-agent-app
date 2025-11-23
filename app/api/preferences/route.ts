import { getUserProfile } from '@/lib/data/index';
import { getSearchPreferencesByUserId, clearSearchPreferences } from '@/lib/data/preferences';

export async function GET() {
  try {
    const user = await getUserProfile();
    if (!user?.id) return new Response(JSON.stringify({}), { status: 200, headers: { 'content-type': 'application/json' } });
    const prefs = await getSearchPreferencesByUserId(user.id);
    return new Response(JSON.stringify(prefs ?? {}), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('GET /api/preferences failed:', err);
    return new Response(JSON.stringify({}), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}

export async function DELETE() {
  try {
    const user = await getUserProfile();
    if (!user?.id) return new Response(null, { status: 204 });
    await clearSearchPreferences(user.id);
    return new Response(null, { status: 204 });
  } catch (err) {
    console.error('DELETE /api/preferences failed:', err);
    return new Response(null, { status: 500 });
  }
}
