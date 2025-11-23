import { getAllLocations } from '@/lib/data/location';

export async function GET() {
  try {
    const locations = await getAllLocations();
    return new Response(JSON.stringify(locations), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('GET /api/locations failed:', err);
    return new Response(JSON.stringify([]), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
