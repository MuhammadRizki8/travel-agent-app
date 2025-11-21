import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Update status menjadi CONFIRMED
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Pembayaran berhasil dikonfirmasi.',
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal konfirmasi booking' }, { status: 500 });
  }
}
