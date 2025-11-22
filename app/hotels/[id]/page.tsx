import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Hotel, Star, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import BookingButton from '@/components/BookingButton';
import { getHotelById, getUserId } from '@/lib/data/index';
import { formatRupiah } from '@/lib/utils';

export default async function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await getHotelById(id);
  const userId = await getUserId();

  if (!hotel) {
    notFound();
  }

  const amenities = hotel.amenities ? JSON.parse(hotel.amenities) : ['WiFi Gratis', 'Kolam Renang', 'Sarapan', 'Parkir', 'AC'];

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden shadow-lg">
          <div className="h-64 bg-zinc-200 flex items-center justify-center">
            <Hotel className="w-24 h-24 text-zinc-400" />
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{hotel.name}</h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold ml-1">{hotel.rating}</span>
                  </div>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {hotel.location.name}
                  </div>
                </div>
                <p className="text-muted-foreground mt-2">{hotel.address || 'Alamat lengkap tersedia setelah pemesanan.'}</p>
              </div>

              <div className="text-right">
                <p className="text-3xl font-bold text-teal-700">{formatRupiah(hotel.pricePerNight)}</p>
                <p className="text-sm text-muted-foreground">per malam</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Fasilitas</h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Deskripsi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nikmati pengalaman menginap yang tak terlupakan di {hotel.name}. Terletak strategis di {hotel.location.name}, hotel ini menawarkan kenyamanan modern dengan sentuhan keramahan lokal. Cocok untuk perjalanan bisnis maupun
                  liburan keluarga.
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/">Kembali</Link>
              </Button>
              {userId ? <BookingButton itemId={hotel.id} type="HOTEL" price={hotel.pricePerNight} userId={userId} /> : <Button disabled>Login untuk Pesan</Button>}
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}
