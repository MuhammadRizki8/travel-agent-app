import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, type, itemId, details } = body;

    // 1. Validasi Item & Ambil Harga Asli (Security: Jangan percaya harga dari body request)
    let price = 0;
    let tripName = '';

    if (type === 'FLIGHT') {
      const flight = await prisma.flight.findUnique({ where: { id: itemId } });
      if (!flight) throw new Error('Flight not found');
      price = flight.price;
      tripName = `Trip to ${flight.destination}`;
    } else if (type === 'HOTEL') {
      const hotel = await prisma.hotel.findUnique({ where: { id: itemId } });
      if (!hotel) throw new Error('Hotel not found');
      // Asumsi booking 1 malam dulu untuk simplifikasi PoC
      price = hotel.pricePerNight;
      tripName = `Stay at ${hotel.city}`;
    }

    // 2. Buat Trip Wrapper (Sesuai Schema Database kita: Booking harus punya Trip)
    const newTrip = await prisma.trip.create({
      data: {
        userId,
        name: tripName,
        status: 'DRAFT', // Trip status
      },
    });

    // 3. Buat Booking Transaction (Status: PENDING)
    // Ini menjawab poin "Risk Mitigation" di tugas
    const booking = await prisma.booking.create({
      data: {
        tripId: newTrip.id,
        type,
        // Pasang ID ke kolom yang sesuai (Polymorphic)
        flightId: type === 'FLIGHT' ? itemId : null,
        hotelId: type === 'HOTEL' ? itemId : null,

        totalAmount: price,
        status: 'PENDING', // <--- SAFETY LOCK
        bookingDetails: JSON.stringify(details || {}),
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: booking.status,
      tripId: newTrip.id,
      message: 'Booking Draft Created. Waiting for User Confirmation.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
