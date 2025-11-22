import { getFlightById, getHotelById, getActivityById } from '@/lib/data';
import BookingForm from '@/components/trips/BookingForm';
import { notFound } from 'next/navigation';

export default async function BookingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ type: string; itemId: string }> }) {
  const { id: tripId } = await params;
  const { type, itemId } = await searchParams;

  let item;
  if (type === 'FLIGHT') item = await getFlightById(itemId);
  else if (type === 'HOTEL') item = await getHotelById(itemId);
  else if (type === 'ACTIVITY') item = await getActivityById(itemId);

  if (!item) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemAny = item as any;

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Konfirmasi Booking</h1>

      {/* Item Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
        <h2 className="font-semibold text-lg mb-2">{itemAny.name || itemAny.airline || 'Item Detail'}</h2>
        {type === 'FLIGHT' && (
          <p className="text-sm text-gray-600">
            {itemAny.origin?.code} ➔ {itemAny.destination?.code} | {new Date(itemAny.departure).toLocaleString()}
          </p>
        )}
        {type === 'HOTEL' && (
          <p className="text-sm text-gray-600">
            {itemAny.location?.name} | Rating: {itemAny.rating}⭐
          </p>
        )}
        {type === 'ACTIVITY' && (
          <p className="text-sm text-gray-600">
            {itemAny.location?.name} | Durasi: {itemAny.durationMin} menit
          </p>
        )}
        <p className="font-bold text-blue-600 mt-2">Rp {type === 'HOTEL' ? `${itemAny.pricePerNight.toLocaleString()}/malam` : itemAny.price.toLocaleString()}</p>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <BookingForm tripId={tripId} type={type as any} item={item} />
    </div>
  );
}
