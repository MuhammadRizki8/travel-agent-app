import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTripById, getUserId } from '@/lib/data/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatRupiah } from '@/lib/utils';
import { ArrowLeft, Calendar, Clock, Plane, Hotel, Ticket } from 'lucide-react';
import TripActions from '@/components/trips/TripActions';
import DeleteBookingButton from '@/components/trips/DeleteBookingButton';

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) return <div className="p-8 text-center">Please log in.</div>;

  const trip = await getTripById(id);

  if (!trip || trip.userId !== userId) {
    notFound();
  }

  const totalCost = trip.bookings.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/trips" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to My Trips
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{trip.name}</h1>
              <p className="text-gray-600 mt-1">{trip.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={trip.status === 'DRAFT' ? 'outline' : 'default'} className={trip.status === 'DRAFT' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-600'}>
                  {trip.status}
                </Badge>

                <p className="text-sm text-gray-500">
                  {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'No start date'} - {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'No end date'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <TripActions trip={trip} />
              {trip.status === 'DRAFT' && trip.bookings.length > 0 && (
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href={`/checkout/${trip.id}`}>Checkout</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Left Column: Itinerary / Bookings */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" /> Itinerary
            </h2>

            {trip.bookings.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">This trip is empty.</p>
                  <Button variant="outline" asChild>
                    <Link href="/search">Add Flights or Hotels</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {trip.bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className="flex">
                      <div className={`w-2 ${booking.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {booking.type === 'FLIGHT' && <Plane className="h-4 w-4 text-blue-500" />}
                            {booking.type === 'HOTEL' && <Hotel className="h-4 w-4 text-orange-500" />}
                            {booking.type === 'ACTIVITY' && <Ticket className="h-4 w-4 text-purple-500" />}
                            <span className="font-semibold text-sm text-gray-600">{booking.type}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="mb-3">
                          {booking.type === 'FLIGHT' && booking.flight && (
                            <div>
                              <h3 className="font-bold text-lg">
                                {booking.flight.origin.code} → {booking.flight.destination.code}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {booking.flight.airline} • {booking.flight.flightCode}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(booking.startDate).toLocaleString()} - {new Date(booking.endDate).toLocaleString()}
                              </p>
                            </div>
                          )}
                          {booking.type === 'HOTEL' && booking.hotel && (
                            <div>
                              <h3 className="font-bold text-lg">{booking.hotel.name}</h3>
                              <p className="text-sm text-gray-600">{booking.hotel.location.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Check-in: {new Date(booking.startDate).toLocaleDateString()}</p>
                              <p className="text-xs text-gray-500">Check-out: {new Date(booking.endDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {booking.type === 'ACTIVITY' && booking.activity && (
                            <div>
                              <h3 className="font-bold text-lg">{booking.activity.name}</h3>
                              <p className="text-sm text-gray-600">{booking.activity.location.name}</p>
                              <p className="text-xs text-gray-500 mt-1">Date: {new Date(booking.startDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="font-bold text-blue-600">{formatRupiah(booking.totalAmount)}</span>
                          {trip.status === 'DRAFT' && <DeleteBookingButton bookingId={booking.id} />}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <Button>
                  <Link href="/">Add More Items</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trip Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">{trip.bookings.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium capitalize">{trip.status.toLowerCase()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-blue-600">{formatRupiah(totalCost)}</span>
                </div>
              </CardContent>
            </Card>

            {trip.status === 'DRAFT' && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                <div className="flex gap-2">
                  <Clock className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>Items in your draft are reserved for 30 minutes. Complete checkout to secure your booking.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
