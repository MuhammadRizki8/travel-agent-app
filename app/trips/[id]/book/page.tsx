import BookingForm from '@/components/trips/BookingForm';
import { notFound } from 'next/navigation';
import { Flight, Hotel, Activity } from '@/lib/types';

export default async function BookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type: string; itemId: string }> }) {
  const envBase = process.env.NEXT_PUBLIC_API_BASE;
  const hdrs = await (await import('next/headers')).headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'http';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const base = envBase ?? `${proto}://${host}`;
  const { id: tripId } = await params;
  const { type, itemId } = await searchParams;

  let item: Flight | Hotel | Activity | null = null;
  try {
    if (type === 'FLIGHT') {
      const res = await fetch(new URL(`/api/flights/${itemId}`, base).toString());
      if (!res.ok) return notFound();
      item = await res.json();
    } else if (type === 'HOTEL') {
      const res = await fetch(new URL(`/api/hotels/${itemId}`, base).toString());
      if (!res.ok) return notFound();
      item = await res.json();
    } else if (type === 'ACTIVITY') {
      const res = await fetch(new URL(`/api/activities/${itemId}`, base).toString());
      if (!res.ok) return notFound();
      item = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch item for booking page', err);
    return notFound();
  }

  if (!item) return notFound();

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Konfirmasi Booking</h1>

      {/* Item Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <h2 className="font-semibold text-lg mb-2">{(item as Hotel)?.name ?? (item as Flight)?.airline ?? 'Item Detail'}</h2>
        {type === 'FLIGHT' && (
          <p className="text-sm text-gray-600">
            {String((item as Flight).originCode)} ➔ {String((item as Flight).destCode)} | {new Date((item as Flight).departure).toLocaleString()}
          </p>
        )}
        {type === 'HOTEL' && (
          <p className="text-sm text-gray-600">
            {String((item as Hotel).locationId)} | Rating: {(item as Hotel).rating}⭐
          </p>
        )}
        {type === 'ACTIVITY' && (
          <p className="text-sm text-gray-600">
            {String((item as Activity).locationId)} | Durasi: {(item as Activity).durationMin} menit
          </p>
        )}
        <p className="font-bold text-blue-600 mt-2">Rp {type === 'HOTEL' ? `${(item as Hotel).pricePerNight.toLocaleString()}/malam` : (item as Flight | Activity).price.toLocaleString()}</p>
      </div>

      <BookingForm tripId={tripId} type={type as 'FLIGHT' | 'HOTEL' | 'ACTIVITY'} item={item as Flight | Hotel | Activity} />
    </div>
  );
}
