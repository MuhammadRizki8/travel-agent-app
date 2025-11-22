import Link from 'next/link';
import { ArrowLeft, Plane, Hotel, CalendarClock, Star, MapPin, Users, Luggage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { prisma } from '@/lib/prisma';

// Helper: Format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number);
};

// Server Action untuk Fetch Data
async function getSearchResults(searchParams: any) {
  const type = searchParams.type;
  let data: any[] = [];

  try {
    if (type === 'flight') {
      const origin = searchParams.origin || '';
      const destination = searchParams.destination || '';
      if (origin && destination) {
        data = await prisma.flight.findMany({
          where: {
            originCode: { equals: origin, mode: 'insensitive' },
            destCode: { equals: destination, mode: 'insensitive' },
            departure: { gte: new Date() },
          },
          orderBy: { price: 'asc' },
          include: { origin: true, destination: true },
        });
      }
    } else if (type === 'hotel') {
      const city = searchParams.city || '';
      if (city) {
        data = await prisma.hotel.findMany({
          where: {
            location: { name: { contains: city, mode: 'insensitive' } },
          },
          include: { location: true },
        });
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
    data = [];
  }

  return data;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<any> }) {
  const resolvedSearchParams = await searchParams;
  const data = await getSearchResults(resolvedSearchParams);
  const type = resolvedSearchParams.type as 'flight' | 'hotel';

  const user = await prisma.user.findUnique({
    where: { email: 'demo@travel.com' },
  });
  const userId = user?.id || null;

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-muted-foreground hover:text-blue-600 flex items-center gap-2 w-fit">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight capitalize flex items-center gap-2">
              {type === 'flight' ? <Plane className="w-6 h-6 text-blue-600" /> : <Hotel className="w-6 h-6 text-teal-600" />}
              Hasil Pencarian {type}
            </h1>
            <Badge variant="outline" className="px-3 py-1">
              {data.length} Opsi Ditemukan
            </Badge>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid gap-4">
          {data.length === 0 ? (
            <Card className="p-10 text-center border-dashed">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="bg-gray-100 p-4 rounded-full">
                  <CalendarClock className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900">Tidak ada hasil</h3>
                <p>Coba ubah kata kunci pencarian atau tanggal Anda.</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/">Cari Ulang</Link>
                </Button>
              </div>
            </Card>
          ) : (
            data.map((item: any) => (type === 'flight' ? <FlightCard key={item.id} item={item} /> : <HotelCard key={item.id} item={item} />))
          )}
        </div>
      </div>
    </main>
  );
}

// --- SUB-COMPONENTS (Agar kode rapi) ---

function FlightCard({ item }: { item: any }) {
  const duration = Math.abs(new Date(item.arrival).getTime() - new Date(item.departure).getTime()) / 36e5;

  return (
    <Card className="hover:shadow-md transition-all group border-l-4 border-l-blue-600">
      <div className="flex flex-col md:flex-row">
        {/* Info Penerbangan */}
        <div className="flex-1 p-6 flex flex-col justify-center gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Logo Maskapai Placeholder */}
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-bold text-xs">{item.airline.substring(0, 2).toUpperCase()}</div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.airline}</h3>
                <p className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                  {item.flightCode} • {item.availableSeats > 0 ? 'Tersedia' : 'Penuh'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 mt-2">
            <div className="text-center">
              <p className="text-xl font-bold">{new Date(item.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <Badge variant="secondary" className="text-xs font-mono">
                {item.originCode}
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
                {item.destCode}
              </Badge>
            </div>
          </div>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-auto" />
        <Separator orientation="horizontal" className="md:hidden w-full" />

        {/* Harga & Action */}
        <div className="md:w-64 p-6 bg-gray-50/50 flex flex-col justify-center items-end md:items-center gap-3">
          <div className="text-right md:text-center">
            <p className="text-sm text-muted-foreground">Harga per orang</p>
            <p className="text-2xl font-bold text-blue-700">{formatRupiah(item.price)}</p>
          </div>

          {/* TOMBOL KE CHECKOUT */}
          <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
            <Link href={`/checkout/${item.id}?type=FLIGHT`}>Pilih Tiket</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function HotelCard({ item }: { item: any }) {
  return (
    <Card className="hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
      {/* Gambar Placeholder */}
      <div className="h-48 md:h-auto md:w-64 bg-zinc-200 flex items-center justify-center">
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
                <span className="text-muted-foreground text-sm ml-2">• {item.location?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-700">{formatRupiah(item.pricePerNight)}</p>
              <p className="text-xs text-muted-foreground">/ malam</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="gap-1">
              <MapPin className="w-3 h-3" /> Strategis
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Users className="w-3 h-3" /> Family
            </Badge>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          {/* TOMBOL KE CHECKOUT */}
          <Button className="bg-teal-600 hover:bg-teal-700" asChild>
            <Link href={`/checkout/${item.id}?type=HOTEL`}>Lihat Kamar</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
