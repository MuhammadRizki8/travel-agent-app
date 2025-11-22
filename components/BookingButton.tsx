'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Untuk redirect
import { Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BookingButton({ itemId, type, userId, className }: { itemId: string; type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY'; price: number; userId: string; className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreateDraft = async () => {
    setLoading(true);
    try {
      // 1. Panggil API untuk buat DRAFT (Status: PENDING)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          type,
          itemId,
          details: { note: 'Draft created from Search Page' },
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Gagal booking');

      // 2. Redirect ke Halaman Checkout/Review dengan Booking ID
      router.push(`/checkout/${data.bookingId}`);
    } catch (error) {
      console.error(error);
      alert('❌ Terjadi kesalahan saat membuat draft booking.');
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleCreateDraft} disabled={loading} suppressHydrationWarning={true} className={`bg-blue-600 hover:bg-blue-700 ${className || ''}`}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
        </>
      ) : (
        <>
          Pilih Tiket <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
