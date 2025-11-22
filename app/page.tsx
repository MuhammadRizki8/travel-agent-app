import { Suspense } from 'react';
import Link from 'next/link';
import { Plane, Hotel, Search, Map, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getUserId } from '@/lib/data/index';
import { SearchResults } from '@/components/SearchResults';

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
  const userId = await getUserId();

  return (
    <main className="min-h-screen bg-gray-50/50 font-sans">
      {/* HERO SECTION */}
      <div className="bg-blue-900 text-white py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Jelajahi Dunia Bersama Kami</h1>
          <p className="text-blue-200">Temukan penerbangan dan hotel terbaik untuk perjalanan Anda.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <Card className="p-6 shadow-lg bg-white mb-8">
          {/* TABS */}
          <div className="flex gap-4 border-b mb-6 overflow-x-auto">
            <Link
              href="/?type=location"
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'location' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" /> Destinasi
              </div>
            </Link>
            <Link
              href="/?type=flight"
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'flight' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" /> Penerbangan
              </div>
            </Link>
            <Link href="/?type=hotel" className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'hotel' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4" /> Hotel
              </div>
            </Link>
            <Link
              href="/?type=activity"
              className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${type === 'activity' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Aktivitas
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
                placeholder={type === 'flight' ? 'Cari maskapai, kota asal, atau tujuan...' : type === 'hotel' ? 'Cari nama hotel atau kota...' : type === 'activity' ? 'Cari aktivitas atau lokasi...' : 'Cari negara atau kota tujuan...'}
                className="pl-10"
              />
            </div>
            <Button type="submit">Cari</Button>
          </form>
        </Card>

        {/* LISTING WITH SUSPENSE */}
        <Suspense key={type + query + page} fallback={<SearchResultsSkeleton />}>
          <SearchResults type={type} query={query} page={page} userId={userId} />
        </Suspense>
      </div>
    </main>
  );
}
