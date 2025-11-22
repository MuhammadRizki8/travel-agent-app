import Link from 'next/link';
import { CalendarClock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchFlights } from '@/lib/data/flight';
import { searchHotels } from '@/lib/data/hotel';
import { searchActivities } from '@/lib/data/activity';
import { searchLocations } from '@/lib/data/location';
import { FlightCard, FlightCardProps } from '@/components/cards/FlightCard';
import { HotelCard, HotelCardProps } from '@/components/cards/HotelCard';
import { ActivityCard, ActivityCardProps } from '@/components/cards/ActivityCard';
import { LocationCard, LocationCardProps } from '@/components/cards/LocationCard';

const ITEMS_PER_PAGE = 5;

async function getSearchResults(type: 'location' | 'flight' | 'hotel' | 'activity', query: string, page: number, filters?: any) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  if (type === 'flight') {
    const { data, total } = await searchFlights(query, filters, skip, ITEMS_PER_PAGE);
    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  }
  if (type === 'hotel') {
    const { data, total } = await searchHotels(query, filters, skip, ITEMS_PER_PAGE);
    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  }
  if (type === 'activity') {
    const { data, total } = await searchActivities(query, filters, skip, ITEMS_PER_PAGE);
    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  }

  // Default to location
  const { data, total } = await searchLocations(query, filters, skip, ITEMS_PER_PAGE);
  return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
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
            if (type === 'flight') return <FlightCard key={item.id} item={item as unknown as FlightCardProps['item']} userId={userId} />;
            if (type === 'hotel') return <HotelCard key={item.id} item={item as unknown as HotelCardProps['item']} userId={userId} />;
            if (type === 'activity') return <ActivityCard key={item.id} item={item as unknown as ActivityCardProps['item']} userId={userId} />;
            if (type === 'location') return <LocationCard key={item.id} item={item as unknown as LocationCardProps['item']} />;
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
