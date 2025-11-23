import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight, Plane, Hotel, Ticket } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import CreateTripModal from '@/components/trips/CreateTripModal';
import { Trip, Booking } from '@/lib/types';

export default async function TripsPage() {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const hdrs = await (await import('next/headers')).headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const base = envBase ?? `${proto}://${host}`;
  const userRes = await fetch(new URL('/api/user', base).toString());
  const user = userRes.ok ? await userRes.json() : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Please Log In</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to view your trips.</p>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  const tripsRes = await fetch(new URL('/api/trips', base).toString());
  const trips: Trip[] = tripsRes.ok ? await tripsRes.json() : [];

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
            <p className="text-gray-500 mt-1">Manage your upcoming adventures and past journeys.</p>
          </div>
          <CreateTripModal />
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No trips found</h3>
            <p className="text-gray-500 mt-1 mb-6">You haven&apost planned any trips yet. Start exploring now!</p>
            <Button asChild variant="outline">
              <Link href="/">Start Exploring</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => {
              const bookings = (trip.bookings || []) as Booking[];
              const totalCost = bookings.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);
              const bookingCount = bookings.length;
              const flightCount = bookings.filter((b) => b.type === 'FLIGHT').length;
              const hotelCount = bookings.filter((b) => b.type === 'HOTEL').length;
              const activityCount = bookings.filter((b) => b.type === 'ACTIVITY').length;

              // Determine status color
              let statusColor = 'bg-gray-100 text-gray-800';
              if (trip.status === 'DRAFT') statusColor = 'bg-yellow-100 text-yellow-800';
              if (trip.status === 'CONFIRMED') statusColor = 'bg-green-100 text-green-800';
              if (trip.status === 'COMPLETED') statusColor = 'bg-blue-100 text-blue-800';

              return (
                <Card key={trip.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className={statusColor}>
                        {trip.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{trip.updatedAt ? new Date(trip.updatedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{trip.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {bookingCount} Items Planned
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex gap-3 text-sm text-gray-600 mb-4">
                      {flightCount > 0 && (
                        <div className="flex items-center gap-1" title="Flights">
                          <Plane className="h-4 w-4" /> {flightCount}
                        </div>
                      )}
                      {hotelCount > 0 && (
                        <div className="flex items-center gap-1" title="Hotels">
                          <Hotel className="h-4 w-4" /> {hotelCount}
                        </div>
                      )}
                      {activityCount > 0 && (
                        <div className="flex items-center gap-1" title="Activities">
                          <Ticket className="h-4 w-4" /> {activityCount}
                        </div>
                      )}
                      {bookingCount === 0 && <span className="text-gray-400 italic">Empty trip</span>}
                    </div>
                    <div className="text-lg font-bold text-blue-600">{formatRupiah(totalCost)}</div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button asChild className="w-full" variant="outline">
                      <Link href={`/trips/${trip.id}`}>
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
