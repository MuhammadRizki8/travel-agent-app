import { getUniqueCountries } from '@/lib/data/location';

export async function GET() {
  try {
    const countries = await getUniqueCountries();
    return new Response(JSON.stringify(countries), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('GET /api/locations/countries failed:', err);
    return new Response(JSON.stringify([]), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
