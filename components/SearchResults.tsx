import Link from 'next/link';
import { CalendarClock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Data now served via API routes; components fetch from `/api/search`.
import { FlightCard, FlightCardProps } from '@/components/cards/FlightCard';
import { HotelCard, HotelCardProps } from '@/components/cards/HotelCard';
import { ActivityCard, ActivityCardProps } from '@/components/cards/ActivityCard';
import { LocationCard, LocationCardProps } from '@/components/cards/LocationCard';

// ITEMS_PER_PAGE handled by API

async function getSearchResults(type: 'location' | 'flight' | 'hotel' | 'activity', query: string, page: number, filters?: Record<string, unknown> | undefined) {
  const params = new URLSearchParams();
  params.set('type', type);
  params.set('q', query || '');
  params.set('page', String(page || 1));
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (typeof v !== 'undefined' && v !== null) params.set(k, String(v));
    });
  }

  const res = await fetch(new URL(`/api/search?${params.toString()}`, process.env.NEXTAUTH_URL || 'http://localhost:3000').toString());
  if (!res.ok) return { data: [], total: 0, totalPages: 0 };
  return res.json() as Promise<{ data: unknown[]; total: number; totalPages: number }>;
}

export async function SearchResults({
  type,
  query,
  page,
  userId,
  filters,
}: {
  type: 'location' | 'flight' | 'hotel' | 'activity';
  query: string;
  page: number;
  userId: string | null;
  filters?: {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    country?: string;
    location?: string;
    airline?: string;
    origin?: string;
    destination?: string;
    date?: string;
  };
}) {
  const { data, total, totalPages } = await getSearchResults(type, query, page, filters);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">{query ? `Hasil Pencarian "${query}"` : `Rekomendasi ${type === 'flight' ? 'Penerbangan' : type === 'hotel' ? 'Hotel' : type === 'activity' ? 'Aktivitas' : 'Destinasi'}`}</h2>
        <span className="text-sm text-muted-foreground">{total} item ditemukan</span>
      </div>

      <div className={type === 'location' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : 'grid gap-4'}>
        {data.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed col-span-full">
            <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">Tidak ada data ditemukan</h3>
            <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          data.map((item) => {
            const record = item as Record<string, unknown>;
            const id = String(record.id);
            if (type === 'flight') return <FlightCard key={id} item={record as FlightCardProps['item']} userId={userId} />;
            if (type === 'hotel') return <HotelCard key={id} item={record as HotelCardProps['item']} userId={userId} />;
            if (type === 'activity') return <ActivityCard key={id} item={record as ActivityCardProps['item']} userId={userId} />;
            if (type === 'location') return <LocationCard key={id} item={record as LocationCardProps['item']} />;
            return null;
          })
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" disabled={page <= 1} asChild>
            <Link href={`/?type=${type}&q=${query}&page=${page - 1}`}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Sebelumnya
            </Link>
          </Button>
          <div className="flex items-center px-4 font-medium text-sm">
            Halaman {page} dari {totalPages}
          </div>
          <Button variant="outline" disabled={page >= totalPages} asChild>
            <Link href={`/?type=${type}&q=${query}&page=${page + 1}`}>
              Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
