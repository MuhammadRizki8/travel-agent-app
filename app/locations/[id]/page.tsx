import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Map, Hotel, Ticket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getLocationById } from '@/lib/data';

export default async function LocationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const location = await getLocationById(id);

  if (!location) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO IMAGE */}
      <div className="relative h-[400px] w-full bg-gray-900">
        {location.image ? (
          <img src={location.image} alt={location.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <Map className="w-24 h-24 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-4">
          <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">{location.code}</Badge>
          <h1 className="text-5xl font-bold text-white mb-2">{location.name}</h1>
          <p className="text-xl text-white/90">{location.country}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 -mt-20 relative z-10">
        <Card className="p-8 shadow-xl bg-white mb-8">
          <h2 className="text-2xl font-bold mb-4">Tentang {location.name}</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            {location.description || `Jelajahi keindahan ${location.name}, sebuah destinasi menakjubkan di ${location.country}. Temukan berbagai pengalaman menarik, mulai dari wisata alam, budaya, hingga kuliner yang menggugah selera.`}
          </p>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          {/* HOTELS */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-100 rounded-lg">
                  <Hotel className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold">Hotel Populer</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/?type=hotel&q=${location.name}`}>
                  Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {location.hotels && location.hotels.length > 0 ? (
                location.hotels.slice(0, 3).map((hotel) => (
                  <Link key={hotel.id} href={`/hotels/${hotel.id}`} className="block group">
                    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                      <div>
                        <p className="font-medium group-hover:text-teal-600 transition-colors">{hotel.name}</p>
                        <p className="text-sm text-muted-foreground">Rating: {hotel.rating}/5</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">Belum ada data hotel.</p>
              )}
            </div>
          </Card>

          {/* ACTIVITIES */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Ticket className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold">Aktivitas Seru</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/?type=activity&q=${location.name}`}>
                  Lihat Semua <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {location.activities && location.activities.length > 0 ? (
                location.activities.slice(0, 3).map((activity) => (
                  <Link key={activity.id} href={`/activities/${activity.id}`} className="block group">
                    <div className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                      <div>
                        <p className="font-medium group-hover:text-orange-600 transition-colors">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">{activity.durationMin} Menit</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-600" />
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">Belum ada data aktivitas.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
