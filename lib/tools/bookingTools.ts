// Clean minimal public API implemented below
import { z } from 'zod';
import { searchParametersSchema } from '@/lib/schema';
// We'll call the app's search API endpoints instead of direct data helpers

// Keep bookingRequestSchema aligned with search parameters only.
export const bookingRequestSchema = searchParametersSchema;

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export async function searchRelevant(input: BookingRequest) {
  // For search API we prefer to pass origin/destination as filters and keep q empty
  // (using q with origin+destination produced no results in practice).
  const q = '';

  // Normalize inputs
  const flightFilters: Record<string, unknown> = {};
  const hotelFilters: Record<string, unknown> = {};
  const activityFilters: Record<string, unknown> = {};

  // Budget heuristics (Option A): schema describes `budget` as hotel/night.
  // We keep heuristics: use budget as hotel maxPrice, and derive flight/activity budgets.
  let budgetNumber: number | undefined = undefined;
  if (typeof input.budget === 'number' && !isNaN(input.budget)) budgetNumber = Math.round(input.budget);
  else if (typeof input.budget === 'string' && input.budget !== '' && !isNaN(Number(input.budget))) budgetNumber = Math.round(Number(input.budget));

  if (typeof budgetNumber === 'number') {
    // Use conservative scaling factors so price ranges match examples.
    // Example: budget=100_000_000 -> min=500_000 (0.005), max=3_000_000 (0.03)
    const minFactor = 0.005; // 0.5%
    const maxFactor = 0.03; // 3%

    const minP = Math.max(0, Math.round(budgetNumber * minFactor));
    const maxP = Math.max(minP + 1, Math.round(budgetNumber * maxFactor));

    // hotel: narrow per-night range
    hotelFilters.minPrice = minP;
    hotelFilters.maxPrice = maxP;

    // flights: use similar scaled range
    flightFilters.minPrice = minP;
    flightFilters.maxPrice = maxP;

    // activities: allow same scaled range (can be tuned smaller if desired)
    activityFilters.minPrice = minP;
    activityFilters.maxPrice = maxP;
  }

  // Dates: normalize to YYYY-MM-DD if provided
  if (input.startDate) {
    try {
      const d = new Date(input.startDate);
      if (!isNaN(d.getTime())) {
        flightFilters.date = d.toISOString().split('T')[0];
      }
    } catch {
      // ignore invalid date
    }
  }

  // Map origin/destination/provider to filters used by data layer
  if (input.provider) flightFilters.airline = input.provider;
  if (input.origin) flightFilters.origin = input.origin;
  if (input.destination) {
    flightFilters.destination = input.destination;
    // prefer mapping destination to hotel/activity location filter as UI uses location names
    hotelFilters.location = input.destination;
    activityFilters.location = input.destination;
  }

  // Build base URL for internal API calls. Prefer explicit env var or fallback to localhost for local dev.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? 'http://localhost:3000';

  const buildSearchUrl = (type: 'flight' | 'hotel' | 'activity') => {
    const url = new URL('/api/search', baseUrl);
    const params = url.searchParams;
    params.set('type', type);
    if (q) params.set('q', q);
    params.set('page', '1');
    // add filters
    const addFilters = (filters: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(filters)) {
        if (v === undefined || v === null) continue;
        params.set(k, String(v));
      }
    };
    if (type === 'flight') addFilters(flightFilters);
    if (type === 'hotel') addFilters(hotelFilters);
    if (type === 'activity') addFilters(activityFilters);
    return url.toString();
  };

  const [flightData, hotelData, activityData] = await Promise.all([
    fetch(buildSearchUrl('flight'))
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    fetch(buildSearchUrl('hotel'))
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    fetch(buildSearchUrl('activity'))
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
  ]);

  // Pretty log results (server-side). Guard in production to avoid noisy logs.
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        JSON.stringify(
          {
            flights: { count: flightData?.data?.length ?? 0, sample: flightData?.data?.slice(0, 3) ?? [] },
            hotels: { count: hotelData?.data?.length ?? 0, sample: hotelData?.data?.slice(0, 3) ?? [] },
            activities: { count: activityData?.data?.length ?? 0, sample: activityData?.data?.slice(0, 3) ?? [] },
          },
          null,
          2
        )
      );
    }
  } catch {
    // swallow logging errors
  }

  // Return raw data arrays from the search API. Consumers can map/normalize as needed.
  const flights = flightData?.data ?? [];
  const hotels = hotelData?.data ?? [];
  const activities = activityData?.data ?? [];

  return { flights, hotels, activities };
}

export async function createTripDraft() {
  // Disabled: automatic trip creation & booking is currently turned off.
  // Use `searchRelevant` to collect candidate flights/hotels/activities,
  // then create trips/bookings manually after approval.
  return { error: 'disabled', message: 'createTripDraft is disabled. Use searchRelevant to preview options.' };
}

const bookingToolsExport = {
  bookingRequestSchema,
  createTripDraft,
  searchRelevant,
};

export default bookingToolsExport;

// Expose internals for server-only usage (named with underscore)
// No internal exports — server-only helpers were removed.
