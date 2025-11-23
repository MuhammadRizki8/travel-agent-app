import { Suspense } from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Plane, Hotel, Search, Map, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SearchResults } from '@/components/SearchResults';
import { User } from '@/lib/types';
import { SearchFilters } from '@/components/SearchFilters';

// --- COMPONENTS ---

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-white rounded-lg border border-gray-100 shadow-sm animate-pulse" />
      ))}
    </div>
  );
}

// --- MAIN PAGE ---

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const type = (resolvedSearchParams.type as 'flight' | 'hotel' | 'activity' | 'location') || 'location';
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : resolvedSearchParams.q?.[0] || '';
  const page = Number(resolvedSearchParams.page) || 1;
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const base = envBase ?? `${proto}://${host}`;
  const userRes = await fetch(new URL('/api/user', base).toString());
  const user: User | null = userRes.ok ? await userRes.json() : null;
  const userId = user?.id ?? null;

  // Extract filters
  const minPrice = resolvedSearchParams.minPrice ? Number(resolvedSearchParams.minPrice) : undefined;
  const maxPrice = resolvedSearchParams.maxPrice ? Number(resolvedSearchParams.maxPrice) : undefined;
  const minRating = resolvedSearchParams.minRating ? Number(resolvedSearchParams.minRating) : undefined;

  // Specific filters
  const country = typeof resolvedSearchParams.country === 'string' ? resolvedSearchParams.country : undefined;
  const location = typeof resolvedSearchParams.location === 'string' ? resolvedSearchParams.location : undefined;
  const airline = typeof resolvedSearchParams.airline === 'string' ? resolvedSearchParams.airline : undefined;
  const origin = typeof resolvedSearchParams.origin === 'string' ? resolvedSearchParams.origin : undefined;
  const destination = typeof resolvedSearchParams.destination === 'string' ? resolvedSearchParams.destination : undefined;
  const date = typeof resolvedSearchParams.date === 'string' ? resolvedSearchParams.date : undefined;

  const filters = { minPrice, maxPrice, minRating, country, location, airline, origin, destination, date };

  const [countries, locations] = await Promise.all([
    fetch(new URL('/api/locations/countries', process.env.NEXTAUTH_URL || 'http://localhost:3000').toString()).then((r) => r.json()),
    fetch(new URL('/api/locations', process.env.NEXTAUTH_URL || 'http://localhost:3000').toString()).then((r) => r.json()),
  ]);

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans">
      {/* HERO SECTION */}
      <div className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Explore the World with Us</h1>
          <p className="text-blue-200">Find the best flights and hotels for your trip.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <Card className="p-6 shadow-lg bg-white mb-8">
          {/* TABS */}
          <div className="flex gap-4 border-b mb-6 overflow-x-auto">
            <Link
              href="/?type=location"
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'location' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" /> Destinations
              </div>
            </Link>
            <Link
              href="/?type=flight"
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'flight' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" /> Flights
              </div>
            </Link>
            <Link href="/?type=hotel" className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'hotel' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4" /> Hotels
              </div>
            </Link>
            <Link
              href="/?type=activity"
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'activity' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Activities
              </div>
            </Link>
          </div>

          {/* SEARCH & FILTER */}
          <form className="flex gap-4">
            <input type="hidden" name="type" value={type} />
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                name="q"
                defaultValue={query}
                placeholder={
                  type === 'flight' ? 'Search airline, origin, or destination...' : type === 'hotel' ? 'Search hotel name or city...' : type === 'activity' ? 'Search activity or location...' : 'Search country or destination city...'
                }
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </Card>

        <div className="grid md:grid-cols-4 gap-6">
          {/* SIDEBAR FILTERS */}
          <div className="md:col-span-1">
            <SearchFilters type={type} countries={countries} locations={locations} />
          </div>

          {/* LISTING WITH SUSPENSE */}
          <div className="md:col-span-3">
            <Suspense key={type + query + page + JSON.stringify(filters)} fallback={<SearchResultsSkeleton />}>
              <SearchResults type={type} query={query} page={page} userId={userId} filters={filters} />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
