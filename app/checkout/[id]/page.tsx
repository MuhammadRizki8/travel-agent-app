import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, AlertTriangle, CreditCard, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PaymentAction from './PaymentAction'; // Kita buat komponen client ini di bawah

// Helper Rupiah
const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Fetch Data Booking (Server Side)
async function getBooking(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { flight: true, hotel: true, activity: true, trip: { include: { user: { include: { paymentMethods: true } } } } },
  });
  return booking;
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const booking = await getBooking(resolvedParams.id);

  if (!booking) return notFound();

  // Tentukan Nama Item & Detail
  const itemName = booking.type === 'FLIGHT' ? booking.flight?.airline : booking.type === 'HOTEL' ? booking.hotel?.name : booking.activity?.name;

  const itemDesc = booking.type === 'FLIGHT' ? `${booking.flight?.origin} ➝ ${booking.flight?.destination}` : booking.type === 'HOTEL' ? booking.hotel?.city : booking.activity?.city;

  const paymentMethod = booking.trip.user.paymentMethods[0];

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* JUDUL HALAMAN */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Tinjau & Bayar</h1>
          <p className="text-gray-500">Booking ID: #{booking.id.slice(-6).toUpperCase()}</p>
        </div>

        {/* KARTU STATUS */}
        {booking.status === 'CONFIRMED' ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
              <h2 className="text-xl font-bold text-green-800">Pembayaran Berhasil!</h2>
              <p className="text-green-700">Tiket elektronik telah dikirim ke email Anda.</p>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-semibold">Menunggu Persetujuan Anda</AlertTitle>
            <AlertDescription className="text-amber-700">Ini adalah draft booking. Saldo Anda belum terpotong sampai Anda menekan tombol konfirmasi di bawah.</AlertDescription>
          </Alert>
        )}

        {/* DETAIL TRANSAKSI */}
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-muted-foreground tracking-wider uppercase mb-1">Item Detail</p>
                <CardTitle className="text-lg">{itemName}</CardTitle>
                <p className="text-sm text-gray-500">{itemDesc}</p>
              </div>
              <Badge>{booking.type}</Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {/* Rincian Harga */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Harga Satuan</span>
                <span>{formatRupiah(booking.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Layanan</span>
                <span>Rp 0</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Tagihan</span>
                <span className="text-blue-700">{formatRupiah(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 border">
              <div className="bg-white p-2 rounded border">
                <CreditCard className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {paymentMethod?.brand} •••• {paymentMethod?.last4Digits}
                </p>
                <p className="text-xs text-gray-500">Metode pembayaran utama</p>
              </div>
              <Lock className="w-4 h-4 text-green-600" />
            </div>
          </CardContent>

          {/* TOMBOL AKSI (Hanya muncul jika belum confirm) */}
          {booking.status === 'PENDING' && (
            <CardFooter className="bg-gray-50/30 p-6 pt-0">
              {/* CLIENT COMPONENT UNTUK INTERAKSI */}
              <PaymentAction bookingId={booking.id} amount={booking.totalAmount} />
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}
