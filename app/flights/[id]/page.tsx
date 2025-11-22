import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Plane, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import BookingButton from '@/components/BookingButton';
import { getFlightById, getUserId } from '@/lib/data/index';
import { formatRupiah } from '@/lib/utils';

export default async function FlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = await getFlightById(id);
  const userId = await getUserId();

  if (!flight) {
    notFound();
  }

  const duration = Math.abs(new Date(flight.arrival).getTime() - new Date(flight.departure).getTime()) / 36e5;

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{flight.airline}</h1>
              <p className="text-muted-foreground">{flight.flightCode}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-1">
              {formatRupiah(flight.price)}
            </Badge>
          </div>

          <div className="flex items-center justify-between bg-blue-50 p-6 rounded-xl mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-900">{new Date(flight.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-sm font-medium text-blue-700">
                {flight.origin.name} ({flight.originCode})
              </p>
              <p className="text-xs text-blue-500 mt-1">{new Date(flight.departure).toLocaleDateString()}</p>
            </div>

            <div className="flex-1 flex flex-col items-center px-8">
              <p className="text-sm text-muted-foreground mb-2">{duration.toFixed(1)} jam</p>
              <div className="w-full h-px bg-blue-200 relative">
                <Plane className="w-5 h-5 text-blue-500 absolute -top-2.5 right-0 rotate-90" />
              </div>
              <p className="text-xs text-blue-600 mt-2 font-medium">Langsung</p>
            </div>

            <div className="text-center">
              <p className="text-3xl font-bold text-blue-900">{new Date(flight.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p className="text-sm font-medium text-blue-700">
                {flight.destination.name} ({flight.destCode})
              </p>
              <p className="text-xs text-blue-500 mt-1">{new Date(flight.arrival).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tanggal Keberangkatan</p>
                <p className="font-medium">{new Date(flight.departure).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durasi Penerbangan</p>
                <p className="font-medium">{duration.toFixed(1)} Jam</p>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end gap-4">
            <Button variant="outline" asChild>
              <Link href="/">Kembali</Link>
            </Button>
            {userId ? <BookingButton itemId={flight.id} type="FLIGHT" price={flight.price} userId={userId} /> : <Button disabled>Login untuk Pesan</Button>}
          </div>
        </Card>
      </div>
    </main>
  );
}
