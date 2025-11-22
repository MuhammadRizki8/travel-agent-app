import { getTripById } from '@/lib/data/trip';
import { formatRupiah } from '@/lib/utils';
import CheckoutForm from './CheckoutForm';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = await getTripById(id);

  if (!trip) {
    notFound();
  }

  // If trip is already paid, redirect to trip details
  if (trip.status === 'CONFIRMED' || trip.status === 'COMPLETED') {
    redirect(`/trips/${trip.id}`);
  }

  const totalAmount = trip.bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout Perjalanan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan: {trip.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trip.bookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-start border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{booking.type}</Badge>
                      <span className="font-medium">
                        {booking.type === 'FLIGHT' && booking.flight && `${booking.flight.airline} (${booking.flight.flightCode})`}
                        {booking.type === 'HOTEL' && booking.hotel && booking.hotel.name}
                        {booking.type === 'ACTIVITY' && booking.activity && booking.activity.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(booking.startDate).toLocaleDateString('id-ID')} - {new Date(booking.endDate).toLocaleDateString('id-ID')}
                    </div>
                    {(booking.hotel || booking.activity) && (
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {booking.hotel?.location.name || booking.activity?.location.name}
                      </div>
                    )}
                  </div>
                  <div className="font-semibold">{formatRupiah(booking.totalAmount)}</div>
                </div>
              ))}

              <Separator className="my-4" />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="md:col-span-1">
          <CheckoutForm tripId={trip.id} paymentMethods={trip.user.paymentMethods} totalAmount={totalAmount} />
        </div>
      </div>
    </div>
  );
}
