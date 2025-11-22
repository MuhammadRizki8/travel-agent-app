import Link from 'next/link';
import { Plane, Hotel, CalendarClock, Search, ArrowRight, ArrowLeft, Map, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getData, getUserId } from '@/lib/data';
import { FlightCard, FlightCardProps } from '@/components/cards/FlightCard';
import { HotelCard, HotelCardProps } from '@/components/cards/HotelCard';
import { ActivityCard, ActivityCardProps } from '@/components/cards/ActivityCard';
import { LocationCard, LocationCardProps } from '@/components/cards/LocationCard';

// --- MAIN PAGE ---

export default async function HomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const type = (resolvedSearchParams.type as 'flight' | 'hotel' | 'activity' | 'location') || 'flight';
  const query = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : resolvedSearchParams.q?.[0] || '';
  const page = Number(resolvedSearchParams.page) || 1;

  const { data, total, totalPages } = await getData(type, query, page);
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
        <Card className="p-6 shadow-lg bg-white">
          {/* TABS */}
          <div className="flex gap-4 border-b mb-6">
            <Link href="/?type=flight" className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${type === 'flight' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Plane className="w-4 h-4" /> Penerbangan
              </div>
            </Link>
            <Link href="/?type=hotel" className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${type === 'hotel' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Hotel className="w-4 h-4" /> Hotel
              </div>
            </Link>
            <Link href="/?type=activity" className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${type === 'activity' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Aktivitas
              </div>
            </Link>
            <Link href="/?type=location" className={`pb-3 px-4 font-medium text-sm transition-colors border-b-2 ${type === 'location' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4" /> Destinasi
              </div>
            </Link>
          </div>

          {/* SEARCH & FILTER */}
          <form className="flex gap-4 mb-2">
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

        {/* LISTING */}
        <div className="mt-8 space-y-6 pb-12">
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
      </div>
    </main>
  );
}
