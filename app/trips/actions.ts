'use server';

import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function createTripAction(prevState: unknown, formData: FormData) {
  const userId = await getUserId();
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const paymentMethodId = formData.get('paymentMethodId') as string;
  const addBooking = formData.get('addBooking') === 'on';

  if (!name) {
    return { success: false, error: 'Nama trip wajib diisi' };
  }

  try {
    // Jika user ingin langsung booking
    if (addBooking) {
      const type = formData.get('type') as 'FLIGHT' | 'HOTEL' | 'ACTIVITY';
      const itemId = formData.get('itemId') as string;

      if (!type || !itemId) {
        return { success: false, error: 'Pilih item booking (Penerbangan/Hotel/Aktivitas)' };
      }

      let startDate: Date;
      let endDate: Date;
      let totalAmount = 0;
      let bookingData: Record<string, string> = {};

      // Fetch Item Details & Determine Dates
      if (type === 'FLIGHT') {
        const flight = await prisma.flight.findUnique({ where: { id: itemId } });
        if (!flight) return { success: false, error: 'Penerbangan tidak ditemukan' };
        startDate = flight.departure;
        endDate = flight.arrival;
        totalAmount = flight.price;
        bookingData = { flightId: itemId };
      } else if (type === 'HOTEL') {
        const hotel = await prisma.hotel.findUnique({ where: { id: itemId } });
        if (!hotel) return { success: false, error: 'Hotel tidak ditemukan' };

        const checkIn = formData.get('checkIn') as string;
        const checkOut = formData.get('checkOut') as string;
        if (!checkIn || !checkOut) return { success: false, error: 'Tanggal Check-in/Check-out wajib diisi' };

        startDate = new Date(checkIn);
        endDate = new Date(checkOut);

        if (endDate <= startDate) return { success: false, error: 'Tanggal Check-out harus setelah Check-in' };

        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        totalAmount = hotel.pricePerNight * nights;
        bookingData = { hotelId: itemId };
      } else {
        // ACTIVITY
        const activity = await prisma.activity.findUnique({ where: { id: itemId } });
        if (!activity) return { success: false, error: 'Aktivitas tidak ditemukan' };

        const date = formData.get('date') as string;
        if (!date) return { success: false, error: 'Tanggal aktivitas wajib diisi' };

        startDate = new Date(date);
        endDate = new Date(startDate.getTime() + activity.durationMin * 60000);
        totalAmount = activity.price;
        bookingData = { activityId: itemId };
      }

      // VALIDASI: Cek Konflik Jadwal
      const conflict = await prisma.calendarEvent.findFirst({
        where: {
          userId,
          OR: [{ start: { lt: endDate }, end: { gt: startDate } }],
        },
      });

      if (conflict) {
        return { success: false, error: `Jadwal bentrok dengan agenda: ${conflict.title}` };
      }

      // Create Trip + Booking
      await prisma.trip.create({
        data: {
          userId,
          name,
          status: 'DRAFT',
          paymentMethodId: paymentMethodId || null,
          bookings: {
            create: {
              type,
              startDate,
              endDate,
              totalAmount,
              status: 'PENDING_APPROVAL',
              ...bookingData,
            },
          },
        },
      });
    } else {
      // Create Empty Trip
      await prisma.trip.create({
        data: {
          userId,
          name,
          status: 'DRAFT',
          paymentMethodId: paymentMethodId || null,
        },
      });
    }

    revalidatePath('/trips');
    return { success: true, error: '' };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Terjadi kesalahan saat membuat trip' };
  }
}
