import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getUserId } from '@/lib/data/user';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, Hotel, Ticket, CheckCircle2, XCircle, Clock } from 'lucide-react';

type BookingWithDetails = Prisma.BookingGetPayload<{
  include: {
    trip: true;
    flight: { include: { origin: true; destination: true } };
    hotel: { include: { location: true } };
    activity: { include: { location: true } };
  };
}>;

// Helper: Format Rupiah
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

// Fetch Data Langsung dari DB (Server Component)
async function getMyBookings() {
  const userId = await getUserId();
  if (!userId) return [];

  // Ambil Booking dengan Relasi Trip & Item
  const bookings = await prisma.booking.findMany({
    where: {
      trip: { userId: userId },
    },
    include: {
      trip: true,
      flight: { include: { origin: true, destination: true } },
      hotel: { include: { location: true } },
      activity: { include: { location: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return bookings;
}

export default async function HistoryPage() {
  const bookings = await getMyBookings();

  return (
    <main className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Riwayat Pemesanan</h1>
            <p className="text-muted-foreground">Pantau status booking Anda di sini.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/trips">+ Rencana Baru</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="px-6 py-4 border-b">
            <CardTitle className="text-base">Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-[50px]">Tipe</TableHead>
                  <TableHead>Detail Item</TableHead>
                  <TableHead>Trip</TableHead>
                  <TableHead>Tanggal Request</TableHead>
                  <TableHead>Total Harga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      Belum ada riwayat booking.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking: BookingWithDetails) => (
                    <TableRow key={booking.id} className="group">
                      {/* KOLOM 1: ICON TIPE */}
                      <TableCell>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            booking.type === 'FLIGHT' ? 'bg-blue-100 text-blue-600' : booking.type === 'HOTEL' ? 'bg-teal-100 text-teal-600' : 'bg-orange-100 text-orange-600'
                          }`}
                        >
                          {booking.type === 'FLIGHT' && <Plane className="w-4 h-4" />}
                          {booking.type === 'HOTEL' && <Hotel className="w-4 h-4" />}
                          {booking.type === 'ACTIVITY' && <Ticket className="w-4 h-4" />}
                        </div>
                      </TableCell>

                      {/* KOLOM 2: DETAIL NAMA */}
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{booking.type === 'FLIGHT' ? booking.flight?.airline : booking.type === 'HOTEL' ? booking.hotel?.name : booking.activity?.name}</span>
                          <span className="text-xs text-muted-foreground font-normal">
                            {booking.type === 'FLIGHT' ? `${booking.flight?.origin?.code} ➝ ${booking.flight?.destination?.code}` : booking.type === 'HOTEL' ? booking.hotel?.location?.name : booking.activity?.location?.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* KOLOM 3: TRIP */}
                      <TableCell>
                        <Link href={`/trips/${booking.tripId}`} className="text-blue-600 hover:underline text-sm">
                          {booking.trip.name}
                        </Link>
                      </TableCell>

                      {/* KOLOM 4: TANGGAL */}
                      <TableCell>{format(new Date(booking.createdAt), 'dd MMM yyyy, HH:mm', { locale: id })}</TableCell>

                      {/* KOLOM 5: HARGA */}
                      <TableCell className="font-mono">{formatRupiah(booking.totalAmount)}</TableCell>

                      {/* KOLOM 6: STATUS */}
                      <TableCell>
                        {booking.status === 'PENDING_APPROVAL' && (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                            <Clock className="w-3 h-3" /> Menunggu
                          </Badge>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                          </Badge>
                        )}
                        {booking.status === 'REJECTED' && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </Badge>
                        )}
                        {booking.status === 'DRAFT' && (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1">
                            Draft
                          </Badge>
                        )}
                      </TableCell>

                      {/* KOLOM 7: AKSI */}
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/trips/${booking.tripId}`}>Lihat Trip</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
