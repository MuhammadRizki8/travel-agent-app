import Link from 'next/link';
import { Plane, Hotel, CalendarClock, Star, MapPin, Users, Search, ArrowRight, ArrowLeft, Luggage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import BookingButton from '@/components/BookingButton';
import { prisma } from '@/lib/prisma';

// --- HELPER FUNCTIONS ---

const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

// --- DATA FETCHING ---

const ITEMS_PER_PAGE = 5;

async function getData(type: 'flight' | 'hotel', query: string, page: number) {
  const skip = (page - 1) * ITEMS_PER_PAGE;

  if (type === 'flight') {
    const where: any = {
      departure: { gte: new Date() },
    };

    if (query) {
      where.OR = [{ origin: { contains: query, mode: 'insensitive' } }, { destination: { contains: query, mode: 'insensitive' } }, { airline: { contains: query, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        orderBy: { departure: 'asc' },
        take: ITEMS_PER_PAGE,
        skip,
      }),
      prisma.flight.count({ where }),
    ]);

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  } else {
    const where: any = {};

    if (query) {
      where.OR = [{ name: { contains: query, mode: 'insensitive' } }, { city: { contains: query, mode: 'insensitive' } }];
    }

    const [data, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        orderBy: { pricePerNight: 'asc' },
        take: ITEMS_PER_PAGE,
        skip,
      }),
      prisma.hotel.count({ where }),
    ]);

    return { data, total, totalPages: Math.ceil(total / ITEMS_PER_PAGE) };
  }
}

async function getUserId() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@travel.com' },
    });
    return user?.id || null;
  } catch (e) {
    console.error('Gagal ambil user ID', e);
    return null;
  }
}

// --- COMPONENTS ---

function FlightCard({ item, userId }: { item: any; userId: string | null }) {
  const duration = Math.abs(new Date(item.arrival).getTime() - new Date(item.departure).getTime()) / 36e5;

  return (
    <Card className="hover:shadow-md transition-all group border-l-4 border-l-blue-600">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">{item.airline.substring(0, 2).toUpperCase()}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.airline}</h3>
                <p className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full w-fit">{item.flightCode}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-2">
            <div className="text-center">
              <p className="text-xl font-bold">{new Date(item.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <Badge variant="secondary" className="text-xs font-mono">
                {item.origin}
              </Badge>
            </div>

            <div className="flex-1 flex flex-col items-center px-4">
              <p className="text-xs text-muted-foreground mb-1">{duration.toFixed(1)} jam</p>
              <div className="w-full h-px bg-gray-300 relative">
                <Plane className="w-3 h-3 text-gray-400 absolute -top-1.5 right-0 rotate-90 md:rotate-0" />
              </div>
              <p className="text-xs text-blue-600 mt-1 font-medium">Langsung</p>
            </div>

            <div className="text-center">
              <p className="text-xl font-bold">{new Date(item.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <Badge variant="secondary" className="text-xs font-mono">
                {item.destination}
              </Badge>
            </div>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-auto" />
        <Separator orientation="horizontal" className="md:hidden w-full" />

        <div className="md:w-64 p-6 bg-gray-50/50 flex flex-col justify-center items-end md:items-center gap-3">
          <div className="text-right md:text-center">
            <p className="text-sm text-muted-foreground">Harga per orang</p>
            <p className="text-2xl font-bold text-blue-700">{formatRupiah(item.price)}</p>
          </div>
          {userId ? (
            <BookingButton itemId={item.id} type="FLIGHT" price={item.price} userId={userId} />
          ) : (
            <Button disabled variant="secondary">
              Login
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function HotelCard({ item, userId }: { item: any; userId: string | null }) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
      <div className="h-48 md:h-auto md:w-64 bg-zinc-100 flex items-center justify-center">
        <Hotel className="w-12 h-12 text-zinc-400" />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between gap-4">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-xl text-gray-900">{item.name}</h3>
              <div className="flex items-center gap-1 text-amber-500 mt-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium text-sm">{item.rating}</span>
                <span className="text-muted-foreground text-sm ml-2">• {item.city}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700">{formatRupiah(item.pricePerNight)}</p>
              <p className="text-xs text-muted-foreground">/ malam</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" /> {item.address || 'Pusat Kota'}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" /> Family Friendly
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          {userId ? (
            <BookingButton itemId={item.id} type="HOTEL" price={item.pricePerNight} userId={userId} />
          ) : (
            <Button disabled variant="secondary">
              Login
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// --- MAIN PAGE ---

export default async function HomePage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  const type = (resolvedSearchParams.type as 'flight' | 'hotel') || 'flight';
  const query = resolvedSearchParams.q || '';
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
          </div>

          {/* SEARCH & FILTER */}
          <form className="flex gap-4 mb-2">
            <input type="hidden" name="type" value={type} />
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input name="q" defaultValue={query} placeholder={type === 'flight' ? 'Cari maskapai, kota asal, atau tujuan...' : 'Cari nama hotel atau kota...'} className="pl-10" />
            </div>
            <Button type="submit">Cari</Button>
          </form>
        </Card>

        {/* LISTING */}
        <div className="mt-8 space-y-6 pb-12">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">{query ? `Hasil Pencarian "${query}"` : `Rekomendasi ${type === 'flight' ? 'Penerbangan' : 'Hotel'}`}</h2>
            <span className="text-sm text-muted-foreground">{total} item ditemukan</span>
          </div>

          <div className="grid gap-4">
            {data.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">Tidak ada data ditemukan</h3>
                <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian Anda.</p>
              </div>
            ) : (
              data.map((item: any) => (type === 'flight' ? <FlightCard key={item.id} item={item} userId={userId} /> : <HotelCard key={item.id} item={item} userId={userId} />))
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
