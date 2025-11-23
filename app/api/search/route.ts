import { searchFlights } from '@/lib/data/flight';
import { searchHotels } from '@/lib/data/hotel';
import { searchActivities } from '@/lib/data/activity';
import { searchLocations } from '@/lib/data/location';

const ITEMS_PER_PAGE = 5;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = (url.searchParams.get('type') as 'flight' | 'hotel' | 'activity' | 'location') || 'location';
    const q = url.searchParams.get('q') || '';
    const page = Number(url.searchParams.get('page') || '1');
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const filters: Record<string, any> = {};
    const keys = ['minPrice', 'maxPrice', 'minRating', 'country', 'location', 'airline', 'origin', 'destination', 'date'];
    for (const k of keys) {
      const v = url.searchParams.get(k);
      if (v !== null && v !== '') filters[k] = isNaN(Number(v)) ? v : Number(v);
    }

    if (type === 'flight') {
      const { data, total } = await searchFlights(q, filters, skip, ITEMS_PER_PAGE);
      return new Response(JSON.stringify({ data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (type === 'hotel') {
      const { data, total } = await searchHotels(q, filters, skip, ITEMS_PER_PAGE);
      return new Response(JSON.stringify({ data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (type === 'activity') {
      const { data, total } = await searchActivities(q, filters, skip, ITEMS_PER_PAGE);
      return new Response(JSON.stringify({ data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    // default: location
    const { data, total } = await searchLocations(q, { country: filters.country }, skip, ITEMS_PER_PAGE);
    return new Response(JSON.stringify({ data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err) {
    console.error('GET /api/search failed:', err);
    return new Response(JSON.stringify({ data: [], total: 0, totalPages: 0 }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
}
