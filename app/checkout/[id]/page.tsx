import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CheckCircle2, AlertTriangle, CreditCard, Plane, Hotel, MapPin, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import PaymentAction from './PaymentAction';

// Helper Rupiah
const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

// Fetch Data Trip (Server Side)
async function getTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          flight: true,
          hotel: { include: { location: true } },
          activity: { include: { location: true } },
        },
      },
      user: {
        include: {
          paymentMethods: true,
        },
      },
    },
  });
  return trip;
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const trip = await getTrip(resolvedParams.id);

  if (!trip) return notFound();

  // Hitung Total
  const totalAmount = trip.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const paymentMethod = trip.user.paymentMethods[0];

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* JUDUL HALAMAN */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Tinjau & Bayar Trip</h1>
          <p className="text-gray-500">Trip ID: #{trip.id.slice(-6).toUpperCase()}</p>
        </div>

        {/* KARTU STATUS */}
        {trip.status === 'CONFIRMED' ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mb-2" />
              <h2 className="text-xl font-bold text-green-800">Pembayaran Berhasil!</h2>
              <p className="text-green-700">Semua tiket dalam trip ini telah dikonfirmasi.</p>
            </CardContent>
          </Card>
        ) : (
          <Alert variant="default" className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 font-semibold">Menunggu Persetujuan Anda</AlertTitle>
            <AlertDescription className="text-amber-700">Ini adalah draft trip. Saldo Anda belum terpotong sampai Anda menekan tombol konfirmasi di bawah.</AlertDescription>
          </Alert>
        )}

        {/* DAFTAR ITEM */}
        <div className="space-y-4">
          {trip.bookings.map((booking) => {
            const itemName = booking.type === 'FLIGHT' ? booking.flight?.airline : booking.type === 'HOTEL' ? booking.hotel?.name : booking.activity?.name;
            const itemDesc = booking.type === 'FLIGHT' ? `${booking.flight?.originCode} ➝ ${booking.flight?.destCode}` : booking.type === 'HOTEL' ? booking.hotel?.location?.name : booking.activity?.location?.name;
            const Icon = booking.type === 'FLIGHT' ? Plane : booking.type === 'HOTEL' ? Hotel : MapPin;

            return (
              <Card key={booking.id} className="shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{itemName}</h3>
                      <p className="text-sm text-gray-500">{itemDesc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatRupiah(booking.totalAmount)}</p>
                    <Badge variant="outline" className="text-xs">
                      {booking.type}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* RINGKASAN PEMBAYARAN */}
        <Card className="shadow-lg overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b pb-4">
            <CardTitle className="text-lg">Ringkasan Pembayaran</CardTitle>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Item ({trip.bookings.length})</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Biaya Layanan</span>
                <span>Rp 0</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Tagihan</span>
                <span className="text-blue-700">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            {/* Metode Pembayaran */}
            <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 border">
              <div className="bg-white p-2 rounded border">
                <CreditCard className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{paymentMethod ? `Kartu •••• ${paymentMethod.last4}` : 'Belum ada metode pembayaran'}</p>
                <p className="text-xs text-gray-500">{paymentMethod ? `Exp ${paymentMethod.expiryMonth}/${paymentMethod.expiryYear}` : 'Tambahkan kartu di profil'}</p>
              </div>
              {paymentMethod && <Badge variant="secondary">Utama</Badge>}
            </div>

            {/* Tombol Bayar */}
            {trip.status !== 'CONFIRMED' && (
              <div className="pt-4">
                <PaymentAction tripId={trip.id} amount={totalAmount} />
                <p className="text-xs text-center text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Pembayaran aman & terenkripsi
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
